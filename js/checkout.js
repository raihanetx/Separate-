// js/checkout.js

function updateCheckoutPageOrderSummary() {
    const orderItemsElement = domElements.orderItemsCheckout;
    const orderTotalElement = domElements.orderTotalCheckout;
    const submitButton = domElements.checkoutForm ? domElements.checkoutForm.querySelector('.submit-btn') : null;

    const subtotalRow = document.getElementById('subtotal-row');
    const discountRow = document.getElementById('discount-row');
    const orderSubtotalCheckout = document.getElementById('orderSubtotalCheckout');
    const orderDiscountCheckout = document.getElementById('orderDiscountCheckout');

    if (!orderItemsElement || !orderTotalElement) return;

    orderItemsElement.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        orderItemsElement.innerHTML = "<p>Your cart is empty.</p>";
        orderTotalElement.textContent = `৳0.00`;
        if (submitButton) submitButton.disabled = true;
        subtotalRow.style.display = 'none';
        discountRow.style.display = 'none';
        appliedCoupon = null; // Clear coupon if cart is empty
        return;
    }

    if (submitButton) submitButton.disabled = false;

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        const itemTotal = parseFloat(item.price) * (item.quantity || 1);
        const displayName = item.selectedDurationLabel ? `${item.name} (${item.selectedDurationLabel})` : item.name;
        itemDiv.innerHTML = `<span>${displayName} (x${item.quantity || 1})</span><span>৳${itemTotal.toFixed(2)}</span>`;
        orderItemsElement.appendChild(itemDiv);
        subtotal += itemTotal;
    });

    let total = subtotal;
    let discountAmount = 0;

    if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
            discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
        } else { // fixed
            discountAmount = appliedCoupon.discount_value;
        }
        total = subtotal - discountAmount;
        if (total < 0) total = 0;

        orderSubtotalCheckout.textContent = `৳${subtotal.toFixed(2)}`;
        orderDiscountCheckout.textContent = `- ৳${discountAmount.toFixed(2)}`;
        subtotalRow.style.display = 'flex';
        discountRow.style.display = 'flex';
    } else {
        subtotalRow.style.display = 'none';
        discountRow.style.display = 'none';
    }

    orderTotalElement.textContent = `৳${total.toFixed(2)}`;
    document.querySelectorAll('#payment-instructions .dynamic-amount').forEach(span => {
        span.textContent = `৳${total.toFixed(2)}`;
    });
}

async function applyCoupon() {
    const couponInput = document.getElementById('coupon');
    const couponCode = couponInput.value.trim();
    if (!couponCode) {
        showToast('Please enter a coupon code.', 'error');
        return;
    }

    try {
        const response = await fetch('api/apply_coupon.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coupon_code: couponCode })
        });
        const result = await response.json();

        if (result.success) {
            appliedCoupon = result;
            showToast(result.message, 'success');
            updateCheckoutPageOrderSummary();
            couponInput.disabled = true;
            document.querySelector('.apply-coupon-btn').disabled = true;
        } else {
            showToast(result.message, 'error');
            appliedCoupon = null;
            updateCheckoutPageOrderSummary();
        }
    } catch (error) {
        showToast('An error occurred while applying the coupon.', 'error');
    }
}

function updateOrderConfirmationMessage(orderId) {
    const orderIdDisplayElement = document.getElementById('orderIdDisplay');
    if (orderIdDisplayElement) {
        orderIdDisplayElement.textContent = orderId;
    }
}

async function placeOrder() {
    const form = domElements.checkoutForm;
    if (!form) {
        showToast('Checkout form unavailable.', 'error');
        return;
    }
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const phoneInput = form.querySelector('#number');
    const trxIdInput = form.querySelector('#transactionId');

    if (!nameInput || !emailInput || !phoneInput || !trxIdInput) {
        showToast('Form fields missing.', 'error');
        return;
    }
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const transactionId = trxIdInput.value.trim();

    if (!name || !email || !phone || !transactionId) {
        showToast('Please fill all fields.', 'error');
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        showToast('Invalid email.', 'error');
        emailInput.focus();
        return;
    }
    if (!/^01[3-9]\d{8}$/.test(phone)) {
        showToast('Invalid phone number.', 'error');
        phoneInput.focus();
        return;
    }
    if (transactionId.length < 5) {
        showToast('Invalid TrxID.', 'error');
        trxIdInput.focus();
        return;
    }
    if (cart.length === 0) {
        showToast('Cart is empty.', 'error');
        navigateTo('products', 'all');
        return;
    }
    const selectedPaymentMethodRadio = form.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedPaymentMethodRadio) {
        showToast('Select payment method.', 'error');
        const paymentTrigger = document.querySelector('.custom-select-trigger');
        if (paymentTrigger) paymentTrigger.focus();
        return;
    }
    const paymentMethod = selectedPaymentMethodRadio.value;
    const orderId = 'TPBD-' + Math.floor(100000 + Math.random() * 900000);

    let subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);
    let totalAmount = subtotal;
    let discountAmount = 0;
    if(appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
            discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
        } else { // fixed
            discountAmount = appliedCoupon.discount_value;
        }
        totalAmount = subtotal - discountAmount;
        if (totalAmount < 0) totalAmount = 0;
    }

    const orderPayload = {
        id: orderId,
        customer: { name: name, email: email, phone: phone, address: 'N/A' },
        items: JSON.parse(JSON.stringify(cart.map(item => ({ id: item.id, name: item.name, price: parseFloat(item.price), quantity: item.quantity || 1, selectedDurationLabel: item.selectedDurationLabel || null })))),
        subtotal: subtotal,
        discount: discountAmount,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        transactionId: transactionId,
        viewed: false
    };

    showToast('Submitting order...', 'info', 7000);
    try {
        const response = await fetch('api/save_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(orderPayload),
        });
        const result = await response.json();
        const finalOrderId = result.orderId || orderId;
        if (response.ok && result.success) {
            showToast(`Order ${finalOrderId} saved!`, 'success');
            console.log('Order Placed (server & local):', finalOrderId);
            loadOrdersFromLocalStorage();
            orders.unshift({ ...orderPayload, id: finalOrderId });
            saveOrdersToLocalStorage();
            updateOrderConfirmationMessage(finalOrderId);
            navigateTo('orderConfirmation');
        }
        else {
            showToast(`Order ${orderId} saved locally. Server: ${result.message || 'error'}`, 'error critical');
            console.error('Server save fail:', result.message);
            loadOrdersFromLocalStorage();
            orders.unshift(orderPayload);
            saveOrdersToLocalStorage();
            updateOrderConfirmationMessage(orderId);
            navigateTo('orderConfirmation');
        }
    } catch (error) {
        showToast(`Order ${orderId} saved locally. Network error.`, 'error critical');
        console.error('Network/server error:', error);
        loadOrdersFromLocalStorage();
        orders.unshift(orderPayload);
        saveOrdersToLocalStorage();
        updateOrderConfirmationMessage(orderId);
        navigateTo('orderConfirmation');
    }
    finally {
        if (typeof form.reset === 'function') form.reset();
        const selectedPaymentText = document.getElementById('selected-payment-method-text');
        if(selectedPaymentText) {
            selectedPaymentText.textContent = "Select payment gateway";
            selectedPaymentText.classList.remove('selected');
        }
        const paymentDetailsArea = document.getElementById('payment-details-area');
        if(paymentDetailsArea) paymentDetailsArea.style.display = 'none';
        document.querySelectorAll('.custom-option.selected-option-highlight').forEach(opt => opt.classList.remove('selected-option-highlight'));
        cart = [];
        appliedCoupon = null;
        updateCart();
    }
}

function setupEnglishCheckoutForm() {
    const paymentDetailsArea = document.getElementById('payment-details-area');
    const recipientNumberDisplay = document.getElementById('recipient-number-display');
    const paymentInstructionsDiv = document.getElementById('payment-instructions');
    const orderTotalElement = document.getElementById('orderTotalCheckout');
    const selectWrapper = document.querySelector('.custom-select-wrapper.payment-gateway-select');
    const selectTrigger = selectWrapper ? selectWrapper.querySelector('.custom-select-trigger') : null;
    const selectedTextElement = selectWrapper ? selectWrapper.querySelector('#selected-payment-method-text') : null;
    const customOptionsContainer = selectWrapper ? selectWrapper.querySelector('.custom-options') : null;
    const customOptions = customOptionsContainer ? Array.from(customOptionsContainer.querySelectorAll('.custom-option')) : [];

    if (!selectWrapper || !selectTrigger || !selectedTextElement || !customOptionsContainer || customOptions.length === 0) {
        console.error("Checkout custom select elements not found.");
        return;
    }

    const recipientNumber = "01757204719";
    const shieldIconSVG = `<svg class="instruction-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .9l-9 4v6.375c0 5.637 3.838 10.825 9 11.813 5.162-.988 9-6.176 9-11.812V4.9L12 .9zm0 2.113l7 3.111v5.251c0 3.938-2.588 7.938-7 8.938-4.413-1-7-5-7-8.938V6.125l7-3.111zm0 0"/></svg>`;

    function createInstructionListHTML(title, steps) {
        let html = `<h3 class="instruction-title">${shieldIconSVG} ${title}</h3><ul>`;
        steps.forEach(step => html += `<li>${step}</li>`);
        html += `</ul>`;
        return html;
    }

    function getPaymentInstructions() {
        const currentTotalAmountText = orderTotalElement ? orderTotalElement.textContent : '৳0.00';
        return {
            bkash: { title: "bKash Instructions", steps: [`Open bKash & select <strong class="highlight">'Send Money'</strong>.`, `Amount: <strong class="highlight"><span class="dynamic-amount">${currentTotalAmountText}</span></strong> to <strong class="highlight">${recipientNumber}</strong>.`, `Copy <strong class="highlight">TrxID</strong> & enter below.`] },
            nagad: { title: "Nagad Instructions", steps: [`Open Nagad & select <strong class="highlight">'Send Money'</strong>.`, `Amount: <strong class="highlight"><span class="dynamic-amount">${currentTotalAmountText}</span></strong> to <strong class="highlight">${recipientNumber}</strong>.`, `Copy <strong class="highlight">TrxID</strong> & enter below.`] },
            rocket: { title: "Rocket Instructions", steps: [`Dial <strong class="highlight">*322#</strong> or use App for <strong class="highlight">'Send Money'</strong>.`, `Amount: <strong class="highlight"><span class="dynamic-amount">${currentTotalAmountText}</span></strong> to <strong class="highlight">${recipientNumber}</strong>.`, `Copy <strong class="highlight">TrxID</strong> & enter below.`] },
            upay: { title: "Upay Instructions", steps: [`Open Upay & select <strong class="highlight">'Send Money'</strong>.`, `Amount: <strong class="highlight"><span class="dynamic-amount">${currentTotalAmountText}</span></strong> to <strong class="highlight">${recipientNumber}</strong>.`, `Copy <strong class="highlight">TrxID</strong> & enter below.`] }
        };
    }

    selectTrigger.addEventListener('click', () => selectWrapper.classList.toggle('open'));
    selectTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectWrapper.classList.toggle('open');
        } else if (e.key === "Escape" && selectWrapper.classList.contains('open')) {
            selectWrapper.classList.remove('open');
        }
    });

    customOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.dataset.value;
            const instructionType = this.dataset.instructionType;
            const textNode = Array.from(this.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            const displayText = textNode ? textNode.textContent.trim() : this.textContent.trim();
            const radioButton = document.getElementById(`${value}_radio`);
            if (radioButton) radioButton.checked = true;
            selectedTextElement.textContent = displayText;
            selectedTextElement.classList.add('selected');
            selectWrapper.classList.remove('open');
            customOptions.forEach(o => o.classList.remove('selected-option-highlight'));
            this.classList.add('selected-option-highlight');
            if (recipientNumberDisplay) {
                const numberSpan = recipientNumberDisplay.querySelector('#payment-number-text');
                if(numberSpan) numberSpan.textContent = recipientNumber;
            }
            const allInstructions = getPaymentInstructions();
            const selectedInstructionData = allInstructions[instructionType];
            if (selectedInstructionData && paymentInstructionsDiv) {
                paymentInstructionsDiv.innerHTML = createInstructionListHTML(selectedInstructionData.title, selectedInstructionData.steps);
            } else if (paymentInstructionsDiv) {
                paymentInstructionsDiv.innerHTML = "<p>Select payment method for instructions.</p>";
            }
            if (paymentDetailsArea) paymentDetailsArea.style.display = 'block';
        });
    });

    document.addEventListener('click', (e) => {
        if (!selectWrapper.contains(e.target)) {
            selectWrapper.classList.remove('open');
        }
    });

    const copyButton = document.getElementById('copy-payment-number');
    if (copyButton) {
        copyButton.addEventListener('click', function() {
            const numberTextElement = document.getElementById('payment-number-text');
            if (numberTextElement) {
                const numberToCopy = numberTextElement.textContent;
                navigator.clipboard.writeText(numberToCopy).then(() => {
                    showToast('Number copied!', 'success');
                }, () => {
                    showToast('Copy failed.', 'error');
                });
            }
        });
    }

    if (domElements.checkoutForm) {
        domElements.checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            placeOrder();
        });
    }

    const applyCouponBtn = document.querySelector('.apply-coupon-btn');
    if(applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
}
