// js/products.js

function createSlug(name) {
    if (!name) return '';
    return name.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function getProductBySlug(category, slug) {
    const productsToSearch = (allProductsData && allProductsData.length > 0) ? allProductsData : generateDemoProducts();
    return productsToSearch.find(p => p.category === category && p.slug === slug);
}

function getProductById(id) {
    const productsToSearch = (allProductsData && allProductsData.length > 0) ? allProductsData : generateDemoProducts();
    return productsToSearch.find(product => product.id === parseInt(id, 10));
}

function startGuaranteedSkeletonDisplay() {
    showGuaranteedSkeletonForHomepage();
    const bannerImageContainer = document.querySelector('#homePage .banner-image-container');
    if (bannerImageContainer) {
        const skeleton = bannerImageContainer.querySelector('.skeleton');
        if (skeleton) skeleton.style.display = 'block';
        const img = bannerImageContainer.querySelector('img.image-fade-in');
        if (img) img.classList.remove('loaded');
    }
}

function showGuaranteedSkeletonForHomepage() {
    const gridsToSkeletonize = [
        domElements.featuredCoursesGrid, domElements.popularSubscriptionsGrid,
        domElements.topSoftwareGrid, domElements.latestEbooksGrid, domElements.featuredResourcesGrid
    ];
    gridsToSkeletonize.forEach(grid => {
        if (grid) {
            const existingContent = grid.querySelectorAll('.product-card:not(.skeleton-card)');
            existingContent.forEach(content => content.style.display = 'none');
            showSkeletonCards(grid, window.innerWidth <= 768 ? 2 : 3, true);
        }
    });
}

function displayActualContent() {
    const gridsToUpdate = [
        domElements.featuredCoursesGrid, domElements.popularSubscriptionsGrid,
        domElements.topSoftwareGrid, domElements.latestEbooksGrid, domElements.featuredResourcesGrid
    ];
    gridsToUpdate.forEach(grid => {
        if (grid) {
            removeSkeletonCards(grid);
            const hiddenContent = grid.querySelectorAll('.product-card:not(.skeleton-card)');
            hiddenContent.forEach(content => content.style.display = 'flex');
        }
    });

    if (allProductsData && allProductsData.length > 0) {
        populateFeaturedProducts();
    } else {
        populateFeaturedProducts();
    }

    const bannerImg = document.querySelector('#homePage .banner-image-container img.image-fade-in');
    if (bannerImg) {
        setupSingleImageLoading(bannerImg, () => {
            const bannerContainer = bannerImg.closest('.banner-image-container');
            if (bannerContainer) {
                const skeleton = bannerContainer.querySelector('.skeleton');
                if (skeleton) skeleton.style.display = 'none';
            }
        });
    } else {
        const bannerImageContainer = document.querySelector('#homePage .banner-image-container');
        if (bannerImageContainer) {
            const skeleton = bannerImageContainer.querySelector('.skeleton');
            if (skeleton) skeleton.style.display = 'none';
            const placeholder = bannerImageContainer.querySelector('.image-placeholder-text');
            if (placeholder) placeholder.style.display = 'block';
        }
    }
}

function generateDemoProducts() {
    return [
      // Courses (at least 4)
      {
        id: 101,
        name: `Advanced Web Development Bootcamp`,
        description: `Master front-end and back-end technologies. Become a full-stack developer in 12 weeks.`,
        longDescription: `An intensive course covering HTML5, CSS3, JavaScript, React, Node.js, MongoDB and more. Includes real-world projects and a final capstone project. Perfect for career switchers.`,
        category: "course",
        price: 4999,
        image: "product_images/course1.png",
        isFeatured: true,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 4999 }]
      },
      {
        id: 102,
        name: `Digital Marketing Masterclass`,
        description: `Learn SEO, SEM, social media marketing, and content strategy from industry experts.`,
        longDescription: `This masterclass covers all aspects of digital marketing. You'll learn to create and implement effective marketing strategies, analyze campaign performance, and grow an online business.`,
        category: "course",
        price: 2499,
        image: "product_images/course2.png",
        isFeatured: true,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 2499 }]
      },
      {
        id: 103,
        name: `Graphic Design for Beginners`,
        description: `Learn the fundamentals of graphic design using Canva and Adobe Photoshop.`,
        longDescription: `A beginner-friendly course that teaches the principles of design, color theory, typography, and how to use popular design tools like Canva and Photoshop to create stunning visuals.`,
        category: "course",
        price: 1499,
        image: "product_images/course3.png",
        isFeatured: false,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 1499 }]
      },
      {
        id: 104,
        name: `Freelancing Success Blueprint`,
        description: `A step-by-step guide to building a successful freelancing career on platforms like Upwork and Fiverr.`,
        longDescription: `Learn how to find clients, price your services, manage projects, and build a strong reputation as a freelancer. This course is packed with practical tips and templates.`,
        category: "course",
        price: 999,
        image: "product_images/course4.png",
        isFeatured: false,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 999 }]
      },

      // Subscriptions (already have enough)
      {
        id: 4,
        name: `CANVA PRO (official)`,
        description: `আপনার ডিজাইনের মুক্ত জগতে প্রবেশ করুন! Watermark ছাড়া HD এক্সপোর্ট, হাজারো প্রিমিয়াম টেমপ্লেট, Background Remover, Magic Resize সহ অসাধারণ সব ফিচারে`,
        longDescription: ` আপনার ডিজাইনিং অভিজ্ঞতাকে করে আরও সহজ, স্মার্ট এবং প্রফেশনাল। ক্যানভা প্রো আপনাকে দেবে ক্রিয়েটিভিটির নতুন স্বাধীনতা।`,
        category: "subscription",
        price: 0,
        image: "product_images/CANVAPRO.png",
        isFeatured: true,
        durations: [ { label: `6 MONTH`, price: 49 }, { label: `1 YEAR`, price: 99 }, { label: `3 YEARS`, price: 149 } ],
        reviews: []
      },
      {
        id: 6,
        name: `CHAT-GPT (personal)`,
        description: `GPT‑4o, 4.1, 4.5 সহ আনলিমিটেড প্রিমিয়াম ফিচার আগে এক্সেস দেখে নিন, তারপর পেমেন্ট!`,
        longDescription: `💡আপনি এখন পাচ্ছেন ChatGPT‑র সর্বশেষ ও সবচেয়ে পাওয়ারফুল ভার্সন – GPT‑4o, GPT‑4.1, এবং GPT‑4.5 সহ ফুল ফিচার আনলকড!`,
        category: "subscription",
        price: 0,
        image: "product_images/Chatgpt1.png",
        isFeatured: true,
        durations: [ { label: `1 MONTH`, price: 499 } ]
      },
      {
        id: 11,
        name: `WASENDER (official licensekey)`,
        description: `WhatsApp Marketing Software – আপনার বিক্রি বাড়ানোর সহজ সমাধান!`,
        longDescription: `✅ WhatsApp Marketing Software কেন ব্যবহার করবেন? 🔹 ১২০০+ ইউজারকে একদিনেই ফ্রি মেসেজ করুন!`,
        category: "subscription",
        price: 0,
        image: "product_images/WASENDERR.png",
        isFeatured: true,
        durations: [ { label: `6 MONTH`, price: 699 }, { label: `1 YEAR`, price: 999 }, { label: `LIFETIME`, price: 1999 } ]
      },
      {
        id: 23,
        name: `WINDOWS 10 PRODUCT KEY`,
        description: `💻 Windows 10 লাইসেন্স কী – 100% জেনুইন ও আজীবনের এক্টিভেশন!`,
        longDescription: `আজীবনের পার্মানেন্ট এক্টিভেশন. Microsoft Windows 10-এর অফিশিয়াল Activation/Product Key`,
        category: "subscription",
        price: 0,
        image: "product_images/windows10pro.png",
        isFeatured: false,
        durations: [ { label: `Windows 10 Pro Key`, price: 399 }, { label: `Windows 10 Home Key`, price: 399 } ]
      },

      // Software (at least 4)
      {
        id: 1,
        name: `CAPCUT PRO (pc version)`,
        description: `Watermark ছাড়া Full HD/4K Export, আনলকড প্রিমিয়াম ফিচার, Smooth Slow Motion, এবং আরো অনেক কিছু!`,
        longDescription: `🔥 প্রো-লেভেলের ভিডিও এডিটিং এখন আরও সহজ ও স্মার্ট!`,
        category: "software",
        price: 249,
        image: "product_images/CAPCUT PRO.png",
        isFeatured: true,
        stock: 15,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 249 }]
      },
      {
        id: 201,
        name: `Adobe Photoshop 2024`,
        description: `Lifetime activation for the world's best imaging and graphic design software.`,
        longDescription: `Get the latest version of Adobe Photoshop with lifetime access. Includes all features, updates, and is compatible with Windows and macOS.`,
        category: "software",
        price: 799,
        image: "product_images/software1.png",
        isFeatured: true,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 799 }]
      },
      {
        id: 202,
        name: `Microsoft Office 2021 Pro`,
        description: `Lifetime license for Word, Excel, PowerPoint, Outlook, and more.`,
        longDescription: `A one-time purchase of the classic Office apps for one PC or Mac. Includes Word, Excel, PowerPoint, and Outlook.`,
        category: "software",
        price: 999,
        image: "product_images/software2.png",
        isFeatured: true,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 999 }]
      },
      {
        id: 203,
        name: `IDM Optimizer Pro`,
        description: `Increase your download speeds with the Internet Download Manager optimizer.`,
        longDescription: `This tool optimizes your IDM settings to give you the maximum possible download speed from any server. Easy to use and very effective.`,
        category: "software",
        price: 199,
        image: "product_images/software3.png",
        isFeatured: false,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 199 }]
      },

      // Ebooks (at least 4)
      {
        id: 301,
        name: `The Freelancer's Bible`,
        description: `Everything you need to know to start, manage, and grow your freelancing business.`,
        longDescription: `This ebook covers topics like finding clients, creating a portfolio, negotiating rates, managing finances, and much more. A must-read for any freelancer.`,
        category: "ebook",
        price: 149,
        image: "product_images/ebook1.png",
        isFeatured: true,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 149 }]
      },
      {
        id: 302,
        name: `Facebook Ads Secrets`,
        description: `Unlock the secrets to creating highly profitable Facebook ad campaigns.`,
        longDescription: `Learn how to target the right audience, write compelling ad copy, create eye-catching visuals, and optimize your campaigns for maximum ROI.`,
        category: "ebook",
        price: 299,
        image: "product_images/ebook2.png",
        isFeatured: true,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 299 }]
      },
      {
        id: 303,
        name: `Content Creation Guide`,
        description: `A practical guide to creating engaging content that attracts and converts.`,
        longDescription: `This ebook provides a framework for planning, creating, and distributing content that resonates with your target audience and helps you achieve your business goals.`,
        category: "ebook",
        price: 99,
        image: "product_images/ebook3.png",
        isFeatured: false,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 99 }]
      },
      {
        id: 304,
        name: `Passive Income Streams`,
        description: `Discover 10 proven ways to generate passive income online.`,
        longDescription: `From affiliate marketing to selling digital products, this ebook explores various passive income models and provides actionable steps to get started.`,
        category: "ebook",
        price: 199,
        image: "product_images/ebook4.png",
        isFeatured: false,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 199 }]
      },

      // Resources (at least 4)
      {
        id: 401,
        name: `500+ Social Media Templates`,
        description: `A bundle of 500+ professionally designed, editable social media templates for Canva.`,
        longDescription: `Save time and create a stunning, cohesive social media presence with this bundle of templates for Instagram, Facebook, Pinterest, and more.`,
        category: "resource",
        price: 399,
        image: "product_images/resource1.png",
        isFeatured: true,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 399 }]
      },
      {
        id: 402,
        name: `Professional Resume Templates`,
        description: `A collection of modern, professional resume templates for Word and Google Docs.`,
        longDescription: `Make a great first impression with these easy-to-edit resume templates. Designed to be clean, professional, and ATS-friendly.`,
        category: "resource",
        price: 149,
        image: "product_images/resource2.png",
        isFeatured: true,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 149 }]
      },
      {
        id: 403,
        name: `Business Plan Template`,
        description: `A comprehensive business plan template to help you launch your startup.`,
        longDescription: `This template guides you through every section of a professional business plan, from executive summary to financial projections.`,
        category: "resource",
        price: 249,
        image: "product_images/resource3.png",
        isFeatured: false,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 249 }]
      },
      {
        id: 404,
        name: `100+ Lightroom Presets`,
        description: `A collection of 100+ premium presets for Adobe Lightroom to enhance your photos.`,
        longDescription: `Transform your photos with one click. This pack includes presets for various styles, including travel, portrait, landscape, and food photography.`,
        category: "resource",
        price: 299,
        image: "product_images/resource4.png",
        isFeatured: false,
        stock: 0,
        reviews: [],
        durations: [{ label: 'Lifetime Access', price: 299 }]
      }
    ];
}

async function fetchProducts(forceRefresh = false) {
    if (isLoadingProducts || (allProductsData.length > 0 && !forceRefresh && !initialLoadPending)) {
        return;
    }
    isLoadingProducts = true;
    try {
        const response = await fetch('api/get_products.php?view=public&t=' + new Date().getTime());
        const products = await response.json();
        allProductsData = products.map(p => ({...p, slug: createSlug(p.name)}));

        if (!Array.isArray(allProductsData)) {
            throw new Error("Invalid product data format.");
        }
        updateCategoryCountsInDOM();
        if (currentPage === 'home') {
            displayActualContent();
        }
        if (domElements.pages.products.classList.contains('active')) {
            filterProducts(currentNavigationContext?.id || 'all', currentNavigationContext?.searchTerm);
        }
    } catch (error) {
        console.error("Could not load products:", error);
        allProductsData = [];
        showToast('Error loading products.', 'error critical');
        const gridsToClearOnError = [
            domElements.featuredCoursesGrid, domElements.popularSubscriptionsGrid,
            domElements.topSoftwareGrid, domElements.latestEbooksGrid, domElements.allProductsGrid
        ];
        gridsToClearOnError.forEach(grid => {
            if(grid) removeSkeletonCards(grid);
        });
        allProductsData = generateDemoProducts().map(p => ({...p, slug: createSlug(p.name)})); // Fallback
        if (currentPage === 'home') {
            displayActualContent();
        }
    } finally {
        isLoadingProducts = false;
        if (initialLoadPending) initialLoadPending = false;
    }
}

function createSkeletonCard(isFeaturedCard = false) {
    const skeletonCard = document.createElement('div');
    skeletonCard.className = 'skeleton-card';
    skeletonCard.setAttribute('data-skeleton', 'true');
    let buttonsHTML = isFeaturedCard ?
        `<div class="skeleton-card-button skeleton-loading full-width"></div>` :
        `<div class="skeleton-card-button skeleton-loading"></div><div class="skeleton-card-button skeleton-loading"></div>`;
    skeletonCard.innerHTML = `
        <div class="skeleton-card-image"><div class="skeleton-loading"></div></div>
        <div class="skeleton-card-content">
            <div class="skeleton-card-title skeleton-loading"></div>
            <div class="skeleton-card-description skeleton-loading"></div>
            <div class="skeleton-card-description skeleton-loading"></div>
            <div class="skeleton-card-price skeleton-loading"></div>
            <div class="skeleton-card-buttons">${buttonsHTML}</div>
        </div>`;
    return skeletonCard;
}

function showSkeletonCards(container, count = 6, isFeaturedCard = false) {
    if (!container) return;
    removeSkeletonCards(container);
    for (let i = 0; i < count; i++) {
        container.appendChild(createSkeletonCard(isFeaturedCard));
    }
}

function removeSkeletonCards(container) {
    if (!container) return;
    container.querySelectorAll('[data-skeleton="true"]').forEach(card => card.remove());
}

function showSkeletonForProductsPage() {
    if (isLoadingProducts || !domElements.allProductsGrid) return;
    showSkeletonCards(domElements.allProductsGrid, window.innerWidth <= 768 ? 6 : 9, false);
    if (domElements.noProductsMessage) domElements.noProductsMessage.style.display = 'none';
}

function renderProductCard(product, isFeaturedCard = false) {
    if (!product || typeof product.id === 'undefined') {
        console.error("Invalid product data for card:", product);
        const e = document.createElement('div');
        e.innerHTML = "<p>Err</p>";
        return e;
    }
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-card-image-container';
    const skeletonDiv = document.createElement('div');
    skeletonDiv.className = 'skeleton';
    imageContainer.appendChild(skeletonDiv);
    const placeholderTextSpan = document.createElement('span');
    placeholderTextSpan.className = 'image-placeholder-text';
    placeholderTextSpan.style.display = 'none';
    placeholderTextSpan.textContent = `Image for ${product.name}`;
    imageContainer.appendChild(placeholderTextSpan);

    if (product.image && product.image !== 'path/to/default-product-image.jpg') {
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        img.className = 'image-fade-in';
        imageContainer.appendChild(img);
        setupSingleImageLoading(img);
    } else {
        skeletonDiv.style.display = 'none';
        placeholderTextSpan.style.display = 'block';
    }

    const showStockOutLabel = localStorage.getItem('showStockOutLabel') === 'true';
    if (showStockOutLabel && product.stock === 0) {
        const stockBadge = document.createElement('div');
        stockBadge.className = 'stock-badge';
        stockBadge.textContent = 'Stock Out';
        imageContainer.appendChild(stockBadge);
    }

    let buttonsHTML = isFeaturedCard ?
        `<button class="view-details-card full-width-button">View Details</button>` :
        `<button class="buy-now-card">Buy Now</button><button class="view-details-card">View Details</button>`;

    let priceToDisplayNum;
    if (product.category === 'subscription' && Array.isArray(product.durations) && product.durations.length > 0) {
        priceToDisplayNum = Math.min(...product.durations.map(d => parseFloat(d.price)));
    } else {
        priceToDisplayNum = parseFloat(product.price);
    }
    const formattedPrice = Math.floor(priceToDisplayNum);
    let priceDisplay = `৳${formattedPrice}`;

    const tempDiv = document.createElement('div');
    tempDiv.appendChild(imageContainer);

    card.innerHTML = `
        ${tempDiv.innerHTML}
        <div class="product-card-content">
            <div class="product-card-header"><h3>${product.name || 'Unnamed Product'}</h3></div>
            <p class="description">${product.description || 'No description available.'}</p>
            <div class="price">${priceDisplay}</div>
            <div class="product-actions">${buttonsHTML}</div>
        </div>`;

    const buyNowButton = card.querySelector('.buy-now-card');
    if (buyNowButton) {
        buyNowButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleProductCardBuyNow(product.id);
        });
    }
    const viewDetailsButton = card.querySelector('.view-details-card');
    if (viewDetailsButton) {
        viewDetailsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateTo('product', `${product.category}/${product.slug}`);
        });
    }
    const titleElement = card.querySelector('h3');
    if (titleElement) {
        titleElement.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateTo('product', `${product.category}/${product.slug}`);
        });
    }
    const cardImageContainerInCard = card.querySelector('.product-card-image-container');
    if (cardImageContainerInCard) {
        cardImageContainerInCard.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateTo('product', `${product.category}/${product.slug}`);
        });
    }
    return card;
}

function populateFeaturedProducts() {
    const dataToUse = (allProductsData && allProductsData.length > 0) ? allProductsData : generateDemoProducts();
    const featuredGrids = {
        course: domElements.featuredCoursesGrid,
        subscription: domElements.popularSubscriptionsGrid,
        software: domElements.topSoftwareGrid,
        ebook: domElements.latestEbooksGrid,
        resource: domElements.featuredResourcesGrid
    };

    if (!dataToUse || dataToUse.length === 0) {
        Object.values(featuredGrids).forEach(grid => {
            if (grid) {
                removeSkeletonCards(grid);
                grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;">No featured products.</p>';
            }
        });
        return;
    }

    for (const category in featuredGrids) {
        const grid = featuredGrids[category];
        if (grid) {
            removeSkeletonCards(grid);
            grid.innerHTML = '';
            const productsForCategory = dataToUse.filter(p => p.category === category);

            if (productsForCategory.length > 0) {
                productsForCategory.forEach(product => grid.appendChild(renderProductCard(product, true)));
            } else {
                grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#999;">No featured ${category}s.</p>`;
            }
        }
    }
    setupImageLoading();
}

function filterProducts(category, searchTerm = null) {
    const grid = domElements.allProductsGrid;
    const noProductsMsg = domElements.noProductsMessage;
    if (!grid || !noProductsMsg) return;
    removeSkeletonCards(grid);
    grid.innerHTML = '';
    const dataToUse = (allProductsData && allProductsData.length > 0) ? allProductsData : generateDemoProducts();
    if ((!dataToUse || dataToUse.length === 0) && !isLoadingProducts) {
        noProductsMsg.textContent = 'Products unavailable.';
        noProductsMsg.style.display = 'block';
        return;
    }
    if (isLoadingProducts) {
        showSkeletonForProductsPage();
        return;
    }
    let tempFilteredProducts;
    if (category === 'all') {
        tempFilteredProducts = [...dataToUse];
        if(domElements.productsPageTitle) domElements.productsPageTitle.textContent = "All Our Products";
    } else {
        tempFilteredProducts = dataToUse.filter(p => p.category === category);
        if(domElements.productsPageTitle) domElements.productsPageTitle.textContent = `Our ${category.charAt(0).toUpperCase() + category.slice(1)}s`;
    }
    if (searchTerm && searchTerm.trim() !== "") {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        tempFilteredProducts = tempFilteredProducts.filter(product =>
            (product.name && product.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (product.description && product.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (product.category && product.category.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }
    currentFilteredProducts = [...tempFilteredProducts];
    if (tempFilteredProducts.length === 0) {
        noProductsMsg.textContent = 'No products found.';
        noProductsMsg.style.display = 'block';
    } else {
        noProductsMsg.style.display = 'none';
        tempFilteredProducts.forEach(product => grid.appendChild(renderProductCard(product, false)));
    }
    setupImageLoading();
}

function renderHomepageCategories(categories) {
    const container = document.querySelector('.categories.container');
    if (!container) return;
    container.innerHTML = ''; // Clear existing categories
    if (!categories || categories.length === 0) {
        container.innerHTML = '<p>No categories found.</p>';
        return;
    }
    categories.forEach(cat => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category';
        categoryElement.setAttribute('onclick', `navigateTo('products', '${cat.id}')`);
        categoryElement.innerHTML = `
            <div class="category-icon-wrapper"><i class="${cat.icon} category-icon-fa" aria-hidden="true"></i></div>
            <span class="category-name">${cat.name}</span>
        `;
        container.appendChild(categoryElement);
    });
}

async function fetchAndRenderCategories() {
    try {
        const response = await fetch('api/get_categories.php?t=' + new Date().getTime());
        const categories = await response.json();
        if (Array.isArray(categories)) {
            renderHomepageCategories(categories);
        }
    } catch (error) {
        console.error("Could not fetch or render categories:", error);
        const container = document.querySelector('.categories.container');
        if(container) container.innerHTML = '<p style="color:red;">Error loading categories.</p>';
    }
}

function updateCategoryCountsInDOM() {
    const dataToUse = (allProductsData && allProductsData.length > 0) ? allProductsData : generateDemoProducts();
    const categoryCounts = {
        course: 0,
        subscription: 0,
        software: 0,
        ebook: 0,
    };
    dataToUse.forEach(product => {
        if (categoryCounts.hasOwnProperty(product.category)) {
            categoryCounts[product.category]++;
        }
    });
    const categoryDisplayMap = {
        course: { id: 'category-count-course', singular: 'Premium Course', plural: 'Premium Courses' },
        subscription: { id: 'category-count-subscription', singular: 'Premium Service', plural: 'Premium Services' },
        software: { id: 'category-count-software', singular: 'Bundle Package', plural: 'Bundle Packages' },
        ebook: { id: 'category-count-ebook', singular: 'Digital Guide', plural: 'Digital Guides' }
    };
    for (const key in categoryCounts) {
        const element = document.getElementById(categoryDisplayMap[key].id);
        if (element) {
            const count = categoryCounts[key];
            element.textContent = `${count} ${count === 1 ? categoryDisplayMap[key].singular : categoryDisplayMap[key].plural}`;
        }
    }
}
