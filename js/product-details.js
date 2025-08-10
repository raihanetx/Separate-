// js/product-details.js

function renderReviews(product) {
    const reviewsTab = document.getElementById('reviewsTab');
    if (!reviewsTab) return;

    reviewsTab.innerHTML = ''; // Clear previous content

    const reviewInputHTML = `
        <div class="review-input-section">
            <div class="user-avatar"></div>
            <div class="comment-box" tabindex="0" onclick="openReviewModal(${product.id})">Write a review...</div>
        </div>
    `;
    reviewsTab.insertAdjacentHTML('beforeend', reviewInputHTML);

    if (!product.reviews || product.reviews.length === 0) {
        reviewsTab.insertAdjacentHTML('beforeend', '<p style="padding: 1rem 0; text-align: center; color: #777;">There are no approved reviews for this product yet. Be the first to write one!</p>');
        return;
    }

    const reviewsContainer = document.createElement('div');
    reviewsContainer.className = 'reviews-list';

    // Separate featured reviews and sort them by date
    const featuredReviews = product.reviews.filter(r => r.featured).sort((a, b) => new Date(b.date) - new Date(a.date));
    // Filter non-featured reviews and sort them by date
    const otherReviews = product.reviews.filter(r => !r.featured).sort((a, b) => new Date(b.date) - new Date(a.date));

    const allSortedReviews = [...featuredReviews, ...otherReviews];

    allSortedReviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';
        if (review.featured) {
            reviewElement.style.border = '2px solid var(--primary-color)';
        }

        const authorInitials = review.author.split(' ').map(n => n[0]).join('').toUpperCase();
        const avatarHTML = review.avatar
            ? `<img src="${review.avatar}" alt="${review.author}" class="review-avatar">`
            : `<div class="review-avatar-initials"><span>${authorInitials}</span></div>`;

        const ratingHTML = Array(5).fill(0).map((_, i) =>
            `<i class="fas fa-star ${i < review.rating ? 'filled' : ''}"></i>`
        ).join('');

        reviewElement.innerHTML = `
            <div class="review-header">
                ${review.featured ? '<i class="fas fa-thumbtack" style="color: var(--primary-color); position: absolute; top: 10px; right: 10px;" title="Featured Review"></i>' : ''}
                <div class="review-avatar-wrapper">${avatarHTML}</div>
                <div class="review-author-details">
                    <span class="review-author">${review.author}</span>
                    <div class="review-rating">${ratingHTML}</div>
                </div>
                <span class="review-date">${new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div class="review-body">
                 <p class="review-text">${review.text}</p>
            </div>
        `;
        reviewsContainer.appendChild(reviewElement);
    });

    reviewsTab.appendChild(reviewsContainer);
}

function showProductDetail(productId) {
    let product = getProductById(productId);
    const detailPageElement = domElements.pages.productDetail;
    if (!product || !detailPageElement) {
        console.error(`Product ${productId} not found or detail page missing.`);
        showToast('Product details unavailable.', 'error');
        navigateTo('products', 'all');
        return;
    }

    product = { ...product };
    delete product.currentSelectedPrice;

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-detail-main-image-container';
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

    // Duration selector and price
    let durationSelectorHTML = '';
    let currentPrice = parseFloat(product.price);
    const hasDuration = Array.isArray(product.durations) && product.durations.length > 0;

    if (hasDuration) {
        currentPrice = parseFloat(product.durations[0].price);
        durationSelectorHTML = `
            <div class="duration-selector" style="display:block;">
                <label for="duration-detail-${product.id}" style="font-weight:600;margin-bottom:0.5rem;display:block;">Select Duration:</label>
                <select id="duration-detail-${product.id}" data-product-id="${product.id}" style="width:100%;padding:0.7rem;border:1px solid #ccc;border-radius:6px;font-size:1rem;">
                    ${product.durations.map(d => `<option value="${parseFloat(d.price)}" ${parseFloat(d.price) === currentPrice ? 'selected' : ''}>${d.label} - ৳${parseFloat(d.price).toFixed(2)}</option>`).join('')}
                </select>
            </div>`;
    }

    // Tabs for description and reviews
    const longDesc = (product.longDescription || product.description || 'An exceptional digital product.').trim();
    const processedDesc = longDesc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const tabsHTML = `
        <div class="product-info-tabs">
            <div class="tab-headers">
                <button class="tab-link active" onclick="openTab(event, 'descriptionTab')">Description</button>
                <button class="tab-link" onclick="openTab(event, 'reviewsTab')">Reviews (${product.reviews ? product.reviews.length : 0})</button>
            </div>
            <div id="descriptionTab" class="tab-content" style="display:block;">
                <div class="expandable-content">
                    <p>${processedDesc}</p>
                </div>
                <button class="see-more-btn" onclick="toggleSeeMore(this, false)">Show More</button>
                <button class="see-less-btn" onclick="toggleSeeMore(this, true)">See Less</button>
            </div>
            <div id="reviewsTab" class="tab-content" style="display:none;">
                <!-- Reviews content will be rendered here by renderReviews() -->
            </div>
        </div>`;

    // Related products
    const relatedProductsHTML = renderRelatedProductsSection(product.id, product.category);

    const tempImageDiv = document.createElement('div');
    tempImageDiv.appendChild(imageContainer);

    detailPageElement.innerHTML = `
        <div class="product-detail-layout">
            <div class="product-detail-gallery">
                ${tempImageDiv.innerHTML}
            </div>
            <div class="product-detail-main${!hasDuration ? ' no-duration' : ''}">
                <h2 class="product-detail-title">${product.name || 'N/A'}</h2>
                <p class="product-short-description">${product.description || ''}</p>
                <div class="product-detail-price">৳${currentPrice.toFixed(2)}</div>
                ${durationSelectorHTML}
                <div class="product-detail-actions">
                    <button class="buy-now-detail" data-id="${product.id}"><i class="fas fa-bolt"></i> Buy Now</button>
                    <button class="add-to-cart-detail" data-id="${product.id}"><i class="fas fa-cart-plus"></i> Add to Cart</button>
                </div>
            </div>
        </div>
        ${tabsHTML}
        ${relatedProductsHTML}`;

    renderReviews(product);

    // Event listeners
    const detailDurationSelector = detailPageElement.querySelector(`#duration-detail-${product.id}`);
    if (detailDurationSelector) {
        detailDurationSelector.addEventListener('change', (e) => {
            const newPrice = parseFloat(e.target.value);
            const priceElement = detailPageElement.querySelector('.product-detail-price');
            if (priceElement) priceElement.textContent = `৳${newPrice.toFixed(2)}`;
        });
    }

    const buyNowDetailButton = detailPageElement.querySelector('.buy-now-detail');
    if (buyNowDetailButton) {
        buyNowDetailButton.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.id);
            const productForCart = getProductById(productId);
            if (productForCart) {
                const productToBuy = { ...productForCart };
                const durationSel = document.getElementById(`duration-detail-${productId}`);
                if (durationSel && durationSel.value) {
                    const selectedOption = durationSel.options[durationSel.selectedIndex];
                    productToBuy.price = parseFloat(selectedOption.value);
                    productToBuy.selectedDurationLabel = selectedOption.text.split(' - ')[0];
                } else if (Array.isArray(productToBuy.durations) && productToBuy.durations.length > 0) {
                    productToBuy.price = parseFloat(productToBuy.durations[0].price);
                    productToBuy.selectedDurationLabel = productToBuy.durations[0].label;
                }
                cart = [{ ...productToBuy, quantity: 1 }];
                updateCart();
                navigateTo('checkout', null, null, true);
            }
        });
    }

    const addToCartDetailButton = detailPageElement.querySelector('.add-to-cart-detail');
    if (addToCartDetailButton) {
        addToCartDetailButton.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.id);
            const productForCart = getProductById(productId);
            if(productForCart) {
                const productToAdd = { ...productForCart };
                const durationSel = document.getElementById(`duration-detail-${productId}`);
                if (durationSel && durationSel.value) {
                    const selectedOption = durationSel.options[durationSel.selectedIndex];
                    productToAdd.price = parseFloat(selectedOption.value);
                } else if (Array.isArray(productToAdd.durations) && productToAdd.durations.length > 0) {
                    productToAdd.price = parseFloat(productToAdd.durations[0].price);
                }
                addToCart(productToAdd);
            }
        });
    }

    adjustProductDetailHeight();
}

function getRelatedProducts(currentProductId, category, limit = 4) {
    const dataToUse = (allProductsData && allProductsData.length > 0) ? allProductsData : generateDemoProducts();
    if (!dataToUse || dataToUse.length === 0) return [];
    const relatedProducts = dataToUse.filter(product => product.category === category && product.id !== currentProductId);
    const shuffled = relatedProducts.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
}

function renderRelatedProductsSection(currentProductId, category) {
    const relatedProducts = getRelatedProducts(currentProductId, category, window.innerWidth <= 768 ? 2 : 3);
    if (relatedProducts.length === 0) return '';

    const relatedProductsHTML = relatedProducts.map(product => {
        let price = parseFloat(product.price);
        if (product.category === 'subscription' && Array.isArray(product.durations) && product.durations.length > 0) {
            price = parseFloat(product.durations[0].price);
        }
        const formattedPrice = !isNaN(price) ? `৳${Math.floor(price)}` : 'Price unavailable';
        const imageSrc = product.image && product.image !== 'path/to/default-product-image.jpg' ? product.image : '';

        return `
            <div class="related-product-card" data-id="${product.id}" onclick="navigateTo('product', '${product.category}/${product.slug}')">
                <div class="related-product-image-container">
                    <div class="skeleton"></div>
                    ${imageSrc ? `<img src="${imageSrc}" alt="${product.name || 'Product Image'}" class="image-fade-in" />` : ''}
                    <span class="image-placeholder-text" style="display:${imageSrc ? 'none' : 'block'};">Image for ${product.name || 'Product'}</span>
                </div>
                <div class="related-product-content">
                    <h4 class="related-product-title">${product.name || 'N/A'}</h4>
                    <p class="related-product-description">${product.description || ''}</p>
                    <div class="related-product-price">${formattedPrice}</div>
                </div>
            </div>`;
    }).join('');

    return `
        <div class="related-products-section">
            <div class="related-products-header">
                <h3 class="related-products-title">Related Products</h3>
            </div>
            <div class="related-products-grid">${relatedProductsHTML}</div>
        </div>`;
}

function setupRelatedProductImages() {
    const relatedImages = document.querySelectorAll('.related-product-image-container img.image-fade-in');
    relatedImages.forEach(img => {
        setupSingleImageLoading(img);
    });
}
