// js/orders.js

function loadOrdersFromLocalStorage() {
    const storedOrders = localStorage.getItem('thinkPlusBDLocalOrders');
    if (storedOrders) {
        try {
            orders = JSON.parse(storedOrders);
            if (!Array.isArray(orders)) orders = [];
            orders = orders.map(o => ({ ...o, viewed: o.viewed === true, timestamp: o.timestamp || new Date(0).toISOString() }))
                           .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                           .slice(0, 5);
        } catch (e) {
            console.error("Error parsing orders:", e);
            orders = [];
            localStorage.removeItem('thinkPlusBDLocalOrders');
        }
    } else {
        orders = [];
    }
    updateOrdersNotification();
}

function saveOrdersToLocalStorage() {
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (orders.length > 5) {
        orders = orders.slice(0, 5);
    }
    localStorage.setItem('thinkPlusBDLocalOrders', JSON.stringify(orders));
    updateOrdersNotification();
}

function saveUpdatedOrdersToLocalStorage(updatedServerOrders) {
    const serverOrdersMap = new Map(updatedServerOrders.map(so => [so.id, so]));
    let processedOrders = orders.map(localOrder => {
        const serverOrder = serverOrdersMap.get(localOrder.id);
        if (serverOrder) {
            return { ...localOrder, ...serverOrder, viewed: localOrder.viewed || (serverOrder.status && serverOrder.status.toLowerCase() !== 'pending') };
        }
        return localOrder;
    });
    updatedServerOrders.forEach(serverOrder => {
        if (!processedOrders.some(po => po.id === serverOrder.id)) {
            processedOrders.push({ ...serverOrder, viewed: (serverOrder.status && serverOrder.status.toLowerCase() !== 'pending') });
        }
    });
    processedOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (processedOrders.length > 5) {
        processedOrders = processedOrders.slice(0, 5);
    }
    localStorage.setItem('thinkPlusBDLocalOrders', JSON.stringify(processedOrders));
    orders = JSON.parse(JSON.stringify(processedOrders));
    updateOrdersNotification();
}

function updateOrdersNotification() {
    const unreadCount = orders.filter(order => order.viewed === false).length;
    const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();
    [domElements.ordersNotification, document.getElementById('bottomNavOrdersNotification')].forEach(el => {
        if (el) {
            el.style.display = unreadCount > 0 ? 'flex' : 'none';
            if(unreadCount > 0) el.textContent = displayCount;
        }
    });
}

function markAllOrdersAsViewed() {
    let changed = false;
    orders = orders.map(order => {
        if (order.viewed === false) {
            changed = true;
            return { ...order, viewed: true };
        }
        return order;
    });
    if (changed) {
        saveOrdersToLocalStorage();
    } else {
        updateOrdersNotification();
    }
}

async function displayOrdersPage() {
    const container = domElements.ordersListContainer;
    const noOrdersMsg = domElements.noOrdersMessage;
    if (!container || !noOrdersMsg) return;
    container.innerHTML = '';
    loadOrdersFromLocalStorage();
    if (orders.length === 0) {
        noOrdersMsg.style.display = 'block';
        container.style.display = 'none';
        markAllOrdersAsViewed();
        return;
    }
    noOrdersMsg.style.display = 'none';
    container.style.display = 'block';

    const localOrderIds = orders.map(o => o.id);
    if (localOrderIds.length > 0) {
        try {
            const response = await fetch('api/fetch_user_orders_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_ids: localOrderIds })
            });
            const serverData = await response.json();
            if (response.ok && serverData.success && Array.isArray(serverData.orders)) {
                saveUpdatedOrdersToLocalStorage(serverData.orders);
            } else if (!serverData.success) {
                console.warn("Server status fetch fail:", serverData.message);
            }
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    }

    const sortedOrdersToDisplay = [...orders].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

    sortedOrdersToDisplay.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        const itemsHTML = (Array.isArray(order.items) ? order.items : []).map(item => {
            const displayName = item.selectedDurationLabel ? `${item.name} (${item.selectedDurationLabel})` : item.name;
            return `<li>${displayName} (x${item.quantity || 1}) - ৳${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}</li>`;
        }).join('');

        let statusClass = `status-${(order.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`;
        if (statusClass === 'status-canceled') statusClass = 'status-cancelled';
        if (!['status-pending', 'status-confirmed', 'status-cancelled'].includes(statusClass)) {
            statusClass = 'status-unknown';
        }

        let displayDate = order.timestamp ? new Date(order.timestamp) : new Date(0);
        let dateLabel = "Placed:";
        if (order.status && order.status.toLowerCase() === 'confirmed' && order.confirmed_at) {
            displayDate = new Date(order.confirmed_at);
            dateLabel = "Confirmed:";
        } else if (order.status && order.status.toLowerCase() === 'cancelled' && order.cancelled_at) {
            displayDate = new Date(order.cancelled_at);
            dateLabel = "Cancelled:";
        }
        const formattedDate = displayDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + displayDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-id">Order ID: ${order.id}</span>
                    <span class="order-date">${dateLabel} ${formattedDate}</span>
                </div>
                <span class="order-status ${statusClass}">${order.status || 'Unknown'}</span>
            </div>
            <div class="order-body">
                <p><strong>Customer:</strong> ${order.customer && order.customer.name ? order.customer.name : 'N/A'}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
                ${order.transactionId ? `<p><strong>TrxID:</strong> ${order.transactionId}</p>` : ''}
                <p><strong>Items:</strong></p>
                <ul class="order-items-list">${itemsHTML}</ul>
            </div>
            <div class="order-footer">
                <span>Total Amount:</span>
                <span class="order-total-amount">৳${parseFloat(order.totalAmount || 0).toFixed(2)}</span>
            </div>`;
        container.appendChild(orderCard);
    });
    markAllOrdersAsViewed();
}
