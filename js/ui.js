// js/ui.js

function showToast(message, type = 'info', duration = 3000) {
    const toastElement = domElements.toast;
    if (!toastElement) return;
    if (toastElement.timerId) {
        clearTimeout(toastElement.timerId);
    }
    toastElement.textContent = message;
    toastElement.className = 'toast show';
    if (type === 'success') toastElement.classList.add('success');
    else if (type === 'error') toastElement.classList.add('error');
    else if (type === 'error critical') toastElement.classList.add('error', 'critical');
    else if (type === 'info') toastElement.classList.add('info');
    toastElement.offsetHeight; // Trigger reflow
    toastElement.timerId = setTimeout(() => {
        toastElement.className = 'toast';
        toastElement.timerId = null;
    }, duration);
}

function openOffCanvasMenu() {
    if(domElements.offCanvasMenu) domElements.offCanvasMenu.classList.add('active');
    if(domElements.offCanvasOverlay) domElements.offCanvasOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOffCanvasMenu() {
    if(domElements.offCanvasMenu) domElements.offCanvasMenu.classList.remove('active');
    if(domElements.offCanvasOverlay) domElements.offCanvasOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function updateBodyClassForSearchVisibility(pageName) {
    const body = document.body;
    body.classList.remove('on-home-page', 'on-products-page', 'on-product-detail-page');
    if (pageName === 'home') body.classList.add('on-home-page');
    else if (pageName === 'products') body.classList.add('on-products-page');
    else if (pageName === 'productDetail') body.classList.add('on-product-detail-page');

    const searchableMobilePages = ['home', 'products'];
    if (!searchableMobilePages.includes(pageName) && body.classList.contains('show-mobile-search')) {
        body.classList.remove('show-mobile-search');
    }
}

function updateBottomNavActiveState(activePage) {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === activePage || (activePage === 'productDetail' && item.dataset.page === 'products') || (activePage === 'cart' && item.dataset.page === 'products') ) {
            item.classList.add('active');
        }
    });
}

function handleSearch(term) {
    const lowerCaseTerm = term.toLowerCase().trim();
    const body = document.body;
    if (lowerCaseTerm === "") {
        if (body.classList.contains('show-mobile-search')) {
            body.classList.remove('show-mobile-search');
        }
        if (currentPage === 'products') {
            filterProducts(currentNavigationContext?.id || 'all', null);
        }
        return;
    }
    navigateTo('products', 'all', lowerCaseTerm);
    if (window.innerWidth <= 768 && body.classList.contains('show-mobile-search')) {
        body.classList.remove('show-mobile-search');
    }
}

function setupSingleImageLoading(imgElement, onImageLoadCallback) {
    if (!imgElement) return;
    const container = imgElement.closest('.banner-image-container, .product-card-image-container, .product-detail-main-image-container, .related-product-image-container');
    if (!container) {
        if (imgElement.complete && imgElement.naturalHeight !== 0) {
            imgElement.classList.add('loaded');
        } else {
            imgElement.onload = () => imgElement.classList.add('loaded');
        }
        if (typeof onImageLoadCallback === 'function') {
            onImageLoadCallback();
        }
        return;
    }
    const skeleton = container.querySelector('.skeleton');
    const placeholderText = container.querySelector('.image-placeholder-text');
    const handleLoad = () => {
        if (skeleton) { skeleton.style.display = 'none'; }
        imgElement.classList.add('loaded');
        if (placeholderText) placeholderText.style.display = 'none';
        if (typeof onImageLoadCallback === 'function') { onImageLoadCallback(); }
    };
    const handleError = () => {
        if (skeleton) { skeleton.style.display = 'none'; }
        imgElement.style.display = 'none';
        if (placeholderText) placeholderText.style.display = 'block';
        if (typeof onImageLoadCallback === 'function') { onImageLoadCallback(); }
    };
    if (imgElement.complete && imgElement.naturalHeight !== 0) {
        handleLoad();
    } else {
        imgElement.onload = handleLoad;
        imgElement.onerror = handleError;
        if (imgElement.complete && imgElement.naturalHeight !== 0) { // Double check for cached images
            handleLoad();
        }
    }
}

function setupImageLoading() {
    document.querySelectorAll('img.image-fade-in').forEach(img => setupSingleImageLoading(img));
}

function setupCategorySlider() {
    const categoriesContainer = document.querySelector('.categories');
    if (!categoriesContainer) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    categoriesContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        categoriesContainer.classList.add('active');
        startX = e.pageX - categoriesContainer.offsetLeft;
        scrollLeft = categoriesContainer.scrollLeft;
    });
    categoriesContainer.addEventListener('mouseleave', () => {
        isDown = false;
        categoriesContainer.classList.remove('active');
    });
    categoriesContainer.addEventListener('mouseup', () => {
        isDown = false;
        categoriesContainer.classList.remove('active');
    });
    categoriesContainer.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - categoriesContainer.offsetLeft;
        const walk = (x - startX) * 3; //scroll-fast
        categoriesContainer.scrollLeft = scrollLeft - walk;
    });
}

function adjustProductDetailHeight() {
    const gallery = document.querySelector('#productDetailPage .product-detail-gallery');
    const mainInfo = document.querySelector('#productDetailPage .product-detail-main');

    if (gallery && mainInfo && window.innerWidth >= 769) {
        if (mainInfo.classList.contains('no-duration')) {
            mainInfo.style.height = '';
            return;
        }
        requestAnimationFrame(() => {
            const galleryHeight = gallery.offsetHeight;
            if (galleryHeight > 0) {
                mainInfo.style.height = `${galleryHeight}px`;
            }
        });
    } else if (mainInfo) {
        mainInfo.style.height = ''; // Reset on mobile
    }
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function toggleSeeMore(btn, seeLess) {
    const tabContent = btn.closest('.tab-content');
    const expandableContent = tabContent.querySelector('.expandable-content');
    const seeMoreBtn = tabContent.querySelector('.see-more-btn');
    const seeLessBtn = tabContent.querySelector('.see-less-btn');

    const isExpanded = expandableContent.classList.contains('expanded');

    if (seeLess) { // "See Less" was clicked
        expandableContent.classList.remove('expanded');
        seeLessBtn.style.display = 'none';
        seeMoreBtn.style.display = 'block';
    } else { // "Show More" was clicked
        expandableContent.classList.add('expanded');
        seeMoreBtn.style.display = 'none';
        seeLessBtn.style.display = 'block';
    }
}

// --- Review Modal ---
function openReviewModal(productId) {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.dataset.productId = productId;
        modal.classList.add('active');
    }
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function submitReview() {
    const modal = document.getElementById('review-modal');
    if (!modal) return;

    const productId = parseInt(modal.dataset.productId, 10);
    const name = document.getElementById('review-name').value.trim();
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const reviewText = document.getElementById('review-text').value.trim();

    if (!name || !ratingInput || !reviewText) {
        showToast('Please fill in all fields and select a rating.', 'error');
        return;
    }

    const rating = parseInt(ratingInput.value, 10);

    const reviewData = {
        productId: productId,
        author: name,
        rating: rating,
        text: reviewText
    };

    try {
        const response = await fetch('api/add_review.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        const result = await response.json();

        if (result.success) {
            showToast('Thank you! Your review has been submitted for approval.', 'success');
        } else {
            showToast(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        showToast('An error occurred while submitting your review.', 'error');
    } finally {
        closeReviewModal();
        // Reset form fields
        document.getElementById('review-name').value = '';
        document.getElementById('review-text').value = '';
        const checkedRating = document.querySelector('input[name="rating"]:checked');
        if (checkedRating) checkedRating.checked = false;
        document.querySelectorAll("#star-rating label").forEach(l => l.classList.remove("selected"));
    }
}

function setupEventListeners() {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    window.addEventListener('resize', adjustProductDetailHeight);

    if (domElements.cartIcon) { domElements.cartIcon.addEventListener('click', () => { navigateTo('cart'); }); }
    if (domElements.cartClose) { domElements.cartClose.addEventListener('click', () => { domElements.cartModal.style.display = 'none'; }); }
    if (domElements.checkoutBtnCart) {
        domElements.checkoutBtnCart.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty! Cannot proceed to checkout.', 'error');
                return;
            }
            domElements.cartModal.style.display = 'none';
            navigateTo('checkout', null, null, true);
        });
    }

    window.addEventListener('click', (event) => {
        if (domElements.cartModal && event.target === domElements.cartModal) {
            domElements.cartModal.style.display = 'none';
        }
    });

    if (domElements.contactFabMain) {
        domElements.contactFabMain.addEventListener('click', (e) => {
            e.stopPropagation();
            domElements.fabContainer.classList.toggle('active');
        });
    }
    document.addEventListener('click', (e) => {
        if (domElements.fabContainer && !domElements.fabContainer.contains(e.target) && domElements.fabContainer.classList.contains('active')) {
            domElements.fabContainer.classList.remove('active');
        }
    });

    if (domElements.menuIcon) domElements.menuIcon.addEventListener('click', openOffCanvasMenu);
    if (domElements.offCanvasClose) domElements.offCanvasClose.addEventListener('click', closeOffCanvasMenu);
    if (domElements.offCanvasOverlay) domElements.offCanvasOverlay.addEventListener('click', closeOffCanvasMenu);

    if (domElements.allProductsIcon) { domElements.allProductsIcon.addEventListener('click', () => navigateTo('products', 'all')); }
    if (domElements.ordersIcon) { domElements.ordersIcon.addEventListener('click', () => navigateTo('orders')); }

    window.addEventListener('resize', () => {
        updateBodyClassForSearchVisibility(currentPage);
        if (currentPage === 'home') {
            showGuaranteedSkeletonForHomepage();
            displayActualContent();
        }
        if (window.innerWidth > 768 && document.body.classList.contains('show-mobile-search')) {
            document.body.classList.remove('show-mobile-search');
        }
    });

    if (domElements.desktopSearchButton && domElements.searchInput) {
        domElements.desktopSearchButton.addEventListener('click', () => { handleSearch(domElements.searchInput.value); });
    }
    if (domElements.searchInput) {
        domElements.searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch(this.value);
            }
        });
    }

    if (domElements.mobileHeaderSearchIcon && domElements.mobileSearchContainer) {
        domElements.mobileHeaderSearchIcon.addEventListener('click', () => {
            const body = document.body;
            const searchableMobilePages = ['home', 'products'];
            if (searchableMobilePages.includes(currentPage)) {
                body.classList.toggle('show-mobile-search');
                if (body.classList.contains('show-mobile-search') && domElements.mobileSearchInput) {
                    domElements.mobileSearchInput.focus();
                }
            } else {
                showToast("Search is available on Home and Products pages.", "info");
                body.classList.remove('show-mobile-search');
            }
        });
    }

    if (domElements.mobileBoxSearchButton && domElements.mobileSearchInput) {
        domElements.mobileBoxSearchButton.addEventListener('click', () => { handleSearch(domElements.mobileSearchInput.value); });
    }
    if (domElements.mobileSearchInput) {
        domElements.mobileSearchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch(this.value);
                this.blur();
            }
        });
    }

    const reviewModal = document.getElementById('review-modal');
    const starRatingContainer = document.getElementById('star-rating');

    if (reviewModal) {
        reviewModal.addEventListener('click', function(e) {
            if (e.target === this) closeReviewModal();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && reviewModal && reviewModal.classList.contains('active')) {
            closeReviewModal();
        }
    });

    if (starRatingContainer) {
        const labels = starRatingContainer.querySelectorAll('label');
        labels.forEach(label => {
            label.addEventListener('click', () => {
                labels.forEach(l => l.classList.remove('selected'));
                let currentLabel = label;
                while(currentLabel) {
                    currentLabel.classList.add('selected');
                    currentLabel = currentLabel.previousElementSibling;
                    if (currentLabel && currentLabel.tagName !== 'LABEL') {
                        currentLabel = currentLabel.previousElementSibling;
                    }
                }
            });

            label.addEventListener('mouseover', () => {
                let currentLabel = label;
                while(currentLabel) {
                    currentLabel.classList.add('hovered');
                    currentLabel = currentLabel.previousElementSibling;
                    if (currentLabel && currentLabel.tagName !== 'LABEL') {
                        currentLabel = currentLabel.previousElementSibling;
                    }
                }
            });

            label.addEventListener('mouseout', () => {
                labels.forEach(l => l.classList.remove('hovered'));
            });
        });
    }

    setupImageLoading();
    setupCategorySlider();
}
