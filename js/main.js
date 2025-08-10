// js/main.js

// --- Global Variables ---
let navigationHistory = [];
let currentPage = 'home';
let allProductsData = [];
let cart = [];
let orders = [];
let currentFilteredProducts = [];
let isLoadingProducts = false;
let appliedCoupon = null;
let initialLoadPending = true;
let currentNavigationContext = { id: null, searchTerm: null };

// --- DOM Element Cache ---
const domElements = {
    cartCount: document.getElementById('cartCount'),
    cartIcon: document.getElementById('cartIcon'),
    cartModal: document.getElementById('cartModal'),
    cartClose: document.getElementById('cartClose'),
    cartItemsDisplay: document.getElementById('cartItemsDisplay'),
    emptyCartMsg: document.getElementById('emptyCartMsg'),
    cartTotalValue: document.getElementById('cartTotalValue'),
    checkoutBtnCart: document.getElementById('checkoutBtnCart'),
    fabContainer: document.getElementById('fabContainer'),
    contactFabMain: document.getElementById('contactFabMain'),
    toast: document.getElementById('toast'),
    menuIcon: document.getElementById('menuIcon'),
    allProductsIcon: document.getElementById('allProductsIcon'),
    ordersIcon: document.getElementById('ordersIcon'),
    ordersNotification: document.getElementById('ordersNotification'),
    mainFooter: document.getElementById('mainFooter'),
    header: document.querySelector('.header'),
    pages: {
        home: document.getElementById('homePage'),
        products: document.getElementById('productsPage'),
        productDetail: document.getElementById('productDetailPage'),
        cart: document.getElementById('cartPage'),
        checkout: document.getElementById('checkoutPage'),
        orderConfirmation: document.getElementById('orderConfirmationPage'),
        about: document.getElementById('aboutPage'),
        orders: document.getElementById('ordersPage'),
        terms: document.getElementById('termsPage'),
        privacy: document.getElementById('privacyPage'),
        refund: document.getElementById('refundPage')
    },
    checkoutForm: document.getElementById('checkoutForm'),
    allProductsGrid: document.getElementById('allProductsGrid'),
    noProductsMessage: document.getElementById('noProductsMessage'),
    orderItemsCheckout: document.getElementById('orderItemsCheckout'),
    orderTotalCheckout: document.getElementById('orderTotalCheckout'),
    searchInput: document.getElementById('searchInput'),
    desktopSearchButton: document.getElementById('desktopSearchButton'),
    mobileHeaderSearchIcon: document.getElementById('mobileHeaderSearchIcon'),
    mobileSearchInput: document.getElementById('mobileSearchInput'),
    mobileBoxSearchButton: document.getElementById('mobileBoxSearchButton'),
    mobileSearchContainer: document.querySelector('.mobile-search-container'),
    productsPageTitle: document.getElementById('productsPageTitle'),
    featuredCoursesGrid: document.getElementById('featuredCoursesGrid'),
    popularSubscriptionsGrid: document.getElementById('popularSubscriptionsGrid'),
    topSoftwareGrid: document.getElementById('topSoftwareGrid'),
    latestEbooksGrid: document.getElementById('latestEbooksGrid'),
    featuredResourcesGrid: document.getElementById('featuredResourcesGrid'),
    ordersListContainer: document.getElementById('ordersListContainer'),
    noOrdersMessage: document.getElementById('noOrdersMessage'),
    offCanvasMenu: document.getElementById('offCanvasMenu'),
    offCanvasOverlay: document.getElementById('offCanvasOverlay'),
    offCanvasClose: document.getElementById('offCanvasClose'),
    cartPageContent: document.getElementById('cartPageContent'),
    emptyCartPage: document.getElementById('emptyCartPage')
};


// --- Router and Navigation ---

function navigateToWithoutHistory(pageName, context = null, searchTerm = null) {
    Object.values(domElements.pages).forEach(page => { if (page) page.classList.remove('active'); });
    window.scrollTo(0, 0);
    if (typeof closeOffCanvasMenu === 'function') closeOffCanvasMenu();

    let pageToShow = domElements.pages[pageName];
    let pageIdForClass = pageName;

    if (pageName === 'product') {
        pageToShow = domElements.pages.productDetail;
        pageIdForClass = 'productDetail';
    }

    if (typeof updateBodyClassForSearchVisibility === 'function') updateBodyClassForSearchVisibility(pageIdForClass);

    if (pageToShow) {
        pageToShow.classList.add('active');
        currentPage = pageIdForClass;
        currentNavigationContext = { id: context, searchTerm: searchTerm };

        // Call rendering functions which will be defined in other files
        if (pageName === 'product' && context) {
            const [category, slug] = context.split('/');
            const product = getProductBySlug(category, slug);
            if (product) {
                if(typeof showProductDetail === 'function') showProductDetail(product.id);
            } else {
                if(typeof showToast === 'function') showToast(`Product not found.`, 'error');
                navigateTo('products', 'all');
                return;
            }
        } else if (pageName === 'products') {
            if(typeof filterProducts === 'function') filterProducts((typeof context === 'string' && context !== 'null' && context !== 'undefined' && context !== "") ? context : 'all', searchTerm);
        } else if (pageName === 'cart') {
            if(typeof updateCartPage === 'function') updateCartPage();
        } else if (pageName === 'checkout') {
            if(typeof updateCheckoutPageOrderSummary === 'function') updateCheckoutPageOrderSummary();
        } else if (pageName === 'orders') {
            if(typeof displayOrdersPage === 'function') displayOrdersPage();
        } else if (pageName === 'home') {
            const bannerImg = document.querySelector('#homePage .banner-image-container img.image-fade-in');
            if (bannerImg && typeof setupSingleImageLoading === 'function') setupSingleImageLoading(bannerImg);
        }

        if(typeof updateBottomNavActiveState === 'function') updateBottomNavActiveState(pageIdForClass);
        if (pageIdForClass !== 'home' && typeof setupImageLoading === 'function') {
            setupImageLoading();
        }

    } else {
        console.warn(`Page element for "${pageName}" not found. Defaulting to home.`);
        if (domElements.pages.home) {
            domElements.pages.home.classList.add('active');
            currentPage = 'home';
            currentNavigationContext = { id: null, searchTerm: null };
            if(typeof updateBodyClassForSearchVisibility === 'function') updateBodyClassForSearchVisibility('home');
            if(typeof updateBottomNavActiveState === 'function') updateBottomNavActiveState('home');
            const bannerImg = document.querySelector('#homePage .banner-image-container img.image-fade-in');
            if (bannerImg && typeof setupSingleImageLoading === 'function') setupSingleImageLoading(bannerImg);
        }
    }
}

async function navigateTo(pageName, context = null, searchTerm = null, triggeredByUIAction = false) {
    if (!domElements.pages[pageName] && pageName !== 'product') {
        console.warn(`Non-existent page "${pageName}". Defaulting home.`);
        if(typeof showToast === 'function') showToast(`Content for "${pageName}" not found.`, 'info');
        pageName = 'home'; context = null; searchTerm = null;
    }

    if (pageName === 'checkout' && cart.length === 0 && !triggeredByUIAction) {
        if(typeof showToast === 'function') showToast("Cart is empty. Add products to checkout.", 'error');
        const redirectPage = 'products'; const redirectContext = 'all';
        navigateToWithoutHistory(redirectPage, redirectContext);
        let newRedirectHash = `#${redirectPage}`;
        if (redirectContext) newRedirectHash += `/${redirectContext}`;
        if (history.replaceState) {
            history.replaceState({ page: redirectPage, context: redirectContext, searchTerm: null }, null, newRedirectHash);
        } else {
            window.location.hash = newRedirectHash;
        }
        currentPage = redirectPage;
        currentNavigationContext = { id: redirectContext, searchTerm: null };
        return;
    }

    const targetHash = `#${pageName}${context ? '/' + context : ''}${(searchTerm && searchTerm.trim() !== "") ? '?search=' + encodeURIComponent(searchTerm.trim()) : ''}`;
    const currentSimpleHash = `#${currentPage}${currentNavigationContext?.id ? '/' + currentNavigationContext.id : ''}${(currentNavigationContext?.searchTerm && currentNavigationContext.searchTerm.trim() !== "") ? '?search=' + encodeURIComponent(currentNavigationContext.searchTerm.trim()) : ''}`;
    if ((currentSimpleHash !== targetHash || initialLoadPending) && !(currentPage === 'home' && pageName === 'home' && !context && !searchTerm)) {
        let currentSearchForHistory = null;
        if(window.innerWidth > 768 && domElements.searchInput) {
            currentSearchForHistory = domElements.searchInput.value;
        } else if (window.innerWidth <= 768 && document.body.classList.contains('show-mobile-search') && domElements.mobileSearchInput) {
            currentSearchForHistory = domElements.mobileSearchInput.value;
        }
        if (!initialLoadPending) {
            navigationHistory.push({ page: currentPage, context: currentNavigationContext?.id, searchTerm: currentSearchForHistory });
            if (navigationHistory.length > 10) navigationHistory.shift();
        }
    }
    if (pageName === 'home' && typeof startGuaranteedSkeletonDisplay === 'function') {
        startGuaranteedSkeletonDisplay();
    }

    currentPage = pageName === 'product' ? 'productDetail' : pageName;
    currentNavigationContext = { id: context, searchTerm: searchTerm };

    let newHash = `#${pageName}`;
    if (context) newHash += `/${context}`;
    if (searchTerm && searchTerm.trim() !== "") newHash += `?search=${encodeURIComponent(searchTerm.trim())}`;

    if (pageName === 'home' && !context && !(searchTerm && searchTerm.trim() !== "")) {
        newHash = history.pushState ? (window.location.pathname + window.location.search) : '#';
    }

    if ( (pageName === 'home' && newHash === (window.location.pathname + window.location.search) && window.location.hash === "") ) {
        // No change needed
    } else if (window.location.hash !== newHash.replace(window.location.pathname + window.location.search, '') || (newHash.startsWith('#') && window.location.hash !== newHash) || (pageName === 'home' && history.pushState) ) {
        try {
            if (history.pushState) {
                history.pushState({ page: pageName, context: context, searchTerm: searchTerm }, null, newHash);
            } else {
                window.location.hash = newHash.startsWith('#') ? newHash : '#';
            }
        } catch (e) {
            console.warn("URL change failed:", e);
            window.location.hash = newHash.startsWith('#') ? newHash : '#';
        }
    }

    if (pageName === 'product' && context) {
         let product = getProductBySlug(...context.split('/'));
         if (!product && (allProductsData.length === 0 || initialLoadPending)) {
             await fetchProducts(true);
             product = getProductBySlug(...context.split('/'));
         }
         if(product) {
            navigateToWithoutHistory(pageName, context, searchTerm);
         } else {
            if(typeof showToast === 'function') showToast(`Product details unavailable.`, 'error critical');
            navigateTo('products', 'all');
            return;
         }
    } else {
        navigateToWithoutHistory(pageName, context, searchTerm);
    }

    if (pageName === 'orders' && typeof markAllOrdersAsViewed === 'function') {
        markAllOrdersAsViewed();
    }
    if (pageName === 'home') {
        if (!allProductsData || allProductsData.length === 0) {
            if(typeof fetchProducts === 'function') await fetchProducts();
        } else {
            if(typeof displayActualContent === 'function') displayActualContent();
        }
    }
}

function goBack() {
    if (navigationHistory.length > 0) {
        navigationHistory.pop();
        history.back();
    } else {
        navigateTo('home');
    }
}

function handleHashChange(isInitialLoad = false) {
    const hash = window.location.hash.substring(1);
    if (!hash) {
        if (currentPage !== 'home' || isInitialLoad) {
            navigateTo('home', null, null, false);
        }
        return;
    }
    const hashParts = hash.split('?');
    const pathParts = hashParts[0].split('/');
    const pageName = pathParts[0];
    const context = pathParts.slice(1).join('/');
    let searchTerm = null;
    if (hashParts.length > 1) {
        const queryParams = new URLSearchParams(hashParts[1]);
        searchTerm = queryParams.get('search');
    }

    const validPages = ['home', 'products', 'product', 'cart', 'checkout', 'orderConfirmation', 'about', 'orders', 'terms', 'privacy', 'refund'];

    if (!validPages.includes(pageName)) {
        console.warn(`Page "${pageName}" from hash not found.`);
        if(typeof showToast === 'function') showToast(`Content for "${pageName}" not found.`, 'info');
        navigateTo('home', null, null, false);
        if (history.replaceState) {
            history.replaceState({ page: 'home', context: null, searchTerm: null }, null, '#home');
        } else {
            window.location.hash = '#home';
        }
        return;
    }

    if (isInitialLoad || currentPage !== (pageName === 'product' ? 'productDetail' : pageName) || currentNavigationContext?.id !== context || currentNavigationContext?.searchTerm !== searchTerm) {
        navigateTo(pageName, context || null, searchTerm, false);
    }
}

window.onpopstate = function(event) {
    if (event.state && event.state.page) {
        navigateToWithoutHistory(event.state.page, event.state.context, event.state.searchTerm);
    } else {
        handleHashChange(false);
    }
};

// --- Main App Initialization ---
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM fully loaded and parsed');

    // Call setup functions from other files
    if(typeof setupEventListeners === 'function') setupEventListeners();
    if(typeof loadCartFromLocalStorage === 'function') loadCartFromLocalStorage();
    if(typeof loadOrdersFromLocalStorage === 'function') loadOrdersFromLocalStorage();
    if(typeof fetchProducts === 'function') await fetchProducts(true);
    if(typeof fetchAndRenderCategories === 'function') await fetchAndRenderCategories();

    handleHashChange(true);
    if(typeof updateOrdersNotification === 'function') updateOrdersNotification();

    window.addEventListener('hashchange', () => handleHashChange(false));

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (localStorage.getItem('categories_updated') === 'true') {
                console.log('Categories updated in another tab. Refreshing categories...');
                localStorage.removeItem('categories_updated');
                if(typeof fetchAndRenderCategories === 'function') fetchAndRenderCategories();
            }
        }
    });
});
