// js/add-to-cart.js

function addToCart(productData) {
    if (!productData || typeof productData.id === 'undefined') {
        console.error("Invalid product data to addToCart:", productData);
        showToast('Invalid product.', 'error');
        return;
    }
    let priceToAdd = parseFloat(productData.price);
    let selectedDurationLabel = null;

    const detailDurationSelector = document.getElementById(`duration-detail-${productData.id}`);
    if (detailDurationSelector && detailDurationSelector.value) {
        const selectedOption = detailDurationSelector.options[detailDurationSelector.selectedIndex];
        priceToAdd = parseFloat(selectedOption.value);
        selectedDurationLabel = selectedOption.text.split(' - ')[0];
    } else if (productData.currentSelectedPrice) {
        priceToAdd = parseFloat(productData.currentSelectedPrice);
        if (Array.isArray(productData.durations)) {
            const durationInfo = productData.durations.find(d => parseFloat(d.price) === priceToAdd);
            if (durationInfo) selectedDurationLabel = durationInfo.label;
        }
    }

    const existingItem = cart.find(item =>
        item.id === productData.id &&
        parseFloat(item.price) === priceToAdd &&
        (item.selectedDurationLabel || null) === (selectedDurationLabel || null)
    );

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
        showToast(`${productData.name}${selectedDurationLabel ? ` (${selectedDurationLabel})` : ''} quantity updated!`, 'info');
    } else {
        cart.push({ ...productData, price: priceToAdd, quantity: 1, selectedDurationLabel: selectedDurationLabel });
        showToast(`${productData.name}${selectedDurationLabel ? ` (${selectedDurationLabel})` : ''} added to cart!`, 'success');
    }
    updateCart();
}

function updateCart() {
    updateCartCount();
    if(typeof updateCheckoutPageOrderSummary === 'function') updateCheckoutPageOrderSummary();
    updateCartPage();
    saveCartToLocalStorage();
}

function updateCartCount() {
    if (!domElements.cartCount) return;
    domElements.cartCount.textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    domElements.cartCount.style.display = parseInt(domElements.cartCount.textContent) > 0 ? 'flex' : 'none';
}

function updateCartPage() {
    if (!domElements.cartPageContent || !domElements.emptyCartPage) return;

    if (cart.length === 0) {
        domElements.cartPageContent.innerHTML = '';
        domElements.cartPageContent.style.display = 'none';
        domElements.emptyCartPage.style.display = 'flex';
        return;
    }

    domElements.emptyCartPage.style.display = 'none';
    domElements.cartPageContent.style.display = 'block';
    let total = 0;

    domElements.cartPageContent.innerHTML = `
        <h2 class="section-title">Your Shopping Cart</h2>
        <div class="cart-items-list" id="cartPageItemsList"></div>
        <div class="cart-summary">
            <div class="cart-total-row">
                <span>Total Amount:</span>
                <span id="cartPageTotal">৳0.00</span>
            </div>
        </div>
        <div class="cart-actions">
            <button class="cart-checkout-btn" id="cartPageCheckoutBtn"><i class="fas fa-credit-card"></i> Proceed to Checkout</button>
            <button class="continue-shopping" onclick="navigateTo('products', 'all')"><i class="fas fa-store"></i> Continue Shopping</button>
        </div>`;

    const cartItemsListElement = document.getElementById('cartPageItemsList');
    cart.forEach(item => {
        const itemTotal = parseFloat(item.price) * (item.quantity || 1);
        const displayName = item.selectedDurationLabel ? `${item.name} (${item.selectedDurationLabel})` : item.name;
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item-row';
        itemRow.innerHTML = `
            <div class="cart-item-details">
                <div class="cart-item-name">${displayName}</div>
                <div class="cart-item-price">৳${parseFloat(item.price).toFixed(2)} each</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, -1, ${item.price}, '${item.selectedDurationLabel || ''}')"><i class="fas fa-minus"></i></button>
                    <span class="quantity-display">${item.quantity || 1}</span>
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, 1, ${item.price}, '${item.selectedDurationLabel || ''}')"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            <div class="cart-item-actions">
                <div style="font-weight:600;margin-bottom:1rem;color:var(--primary-color);">৳${itemTotal.toFixed(0)}</div>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id}, ${item.price}, '${item.selectedDurationLabel || ''}')"><i class="fas fa-trash"></i> Remove</button>
            </div>`;
        cartItemsListElement.appendChild(itemRow);
        total += itemTotal;
    });

    document.getElementById('cartPageTotal').textContent = `৳${total.toFixed(2)}`;
    const cartPageCheckoutBtn = document.getElementById('cartPageCheckoutBtn');
    if (cartPageCheckoutBtn) {
        cartPageCheckoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                navigateTo('checkout', null, null, true);
            } else {
                showToast("Your cart is empty.", 'error');
            }
        });
    }
}

function updateCartItemQuantity(productId, change, itemPrice, itemDurationLabel) {
    const durationToMatch = itemDurationLabel === 'null' || itemDurationLabel === '' ? null : itemDurationLabel;
    const itemIndex = cart.findIndex(item =>
        item.id === productId &&
        parseFloat(item.price) === parseFloat(itemPrice) &&
        (item.selectedDurationLabel || null) === durationToMatch
    );
    if (itemIndex > -1) {
        cart[itemIndex].quantity = Math.max(1, (cart[itemIndex].quantity || 1) + change);
        updateCart();
        const displayName = cart[itemIndex].selectedDurationLabel ? `${cart[itemIndex].name} (${cart[itemIndex].selectedDurationLabel})` : cart[itemIndex].name;
        showToast(`${displayName} quantity ${change > 0 ? 'increased' : 'decreased'}!`, 'info');
    }
}

function removeFromCart(productId, itemPrice, itemDurationLabel) {
    const durationToMatch = itemDurationLabel === 'null' || itemDurationLabel === '' ? null : itemDurationLabel;
    const itemIndex = cart.findIndex(item =>
        item.id === productId &&
        parseFloat(item.price) === parseFloat(itemPrice) &&
        (item.selectedDurationLabel || null) === durationToMatch
    );
    if (itemIndex > -1) {
        const itemName = cart[itemIndex].name;
        const itemDuration = cart[itemIndex].selectedDurationLabel;
        cart.splice(itemIndex, 1);
        updateCart();
        const displayName = itemDuration ? `${itemName} (${itemDuration})` : itemName;
        showToast(`${displayName} removed from cart.`, 'info');
    }
}

function saveCartToLocalStorage() {
    localStorage.setItem('thinkPlusBDCart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('thinkPlusBDCart');
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
            if (!Array.isArray(cart)) cart = [];
        } catch (e) {
            console.error("Error parsing cart:", e);
            cart = [];
        }
    }
    updateCart();
}

function handleProductCardBuyNow(productId) {
    const product = getProductById(productId);
    if (product) {
        const productForCart = { ...product };
        if (product.category === 'subscription' && Array.isArray(product.durations) && product.durations.length > 0) {
            productForCart.price = parseFloat(product.durations[0].price);
            productForCart.selectedDurationLabel = product.durations[0].label;
        } else {
            productForCart.price = parseFloat(product.price);
            delete productForCart.selectedDurationLabel;
        }
        delete productForCart.currentSelectedPrice;
        cart = [{ ...productForCart, quantity: 1 }];
        updateCart();
        navigateTo('checkout', null, null, true);
    }
}
