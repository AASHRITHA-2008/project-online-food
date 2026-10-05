/**
 * FoodExpress – Orders Management & Real-Time Tracking
 * (js/orders.js)
 */

// Order Status Steps Order
const ORDER_STATUS_STEPS = [
  'Order Placed',
  'Order Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered'
];

// Status details and helpful descriptions
const STATUS_DESCRIPTIONS = {
  'Order Placed': 'Your order has been received and is waiting for restaurant confirmation.',
  'Order Confirmed': 'The restaurant has accepted your order and started planning preparation.',
  'Preparing': 'Chef is preparing your delicious meal with fresh ingredients!',
  'Out for Delivery': 'Our delivery partner has picked up your food and is on the way!',
  'Delivered': 'Your food has been delivered! Enjoy your meal! 🎉',
  'Cancelled': 'This order was cancelled.'
};

// Retrieve all orders from localStorage
function getAllOrders() {
  return getStorage('orders', []);
}

// Save all orders to localStorage
function saveOrders(orders) {
  setStorage('orders', orders);
}

// Get orders for a specific user email
function getUserOrders(userEmail) {
  if (!userEmail) return [];
  const orders = getAllOrders();
  return orders
    .filter(order => order.userEmail && order.userEmail.toLowerCase() === userEmail.toLowerCase())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get single order by Order ID
function getOrderById(orderId) {
  if (!orderId) return null;
  const orders = getAllOrders();
  return orders.find(order => order.orderId.toUpperCase() === orderId.toUpperCase()) || null;
}

// Generate Unique Order ID (e.g., FE10001)
function generateOrderId() {
  const orders = getAllOrders();
  let nextNumber = 10001 + orders.length;
  let orderId = `FE${nextNumber}`;

  // Ensure uniqueness
  while (orders.some(o => o.orderId === orderId)) {
    nextNumber++;
    orderId = `FE${nextNumber}`;
  }
  return orderId;
}

// Create and Place a New Order
function placeOrder(orderData) {
  const currentUser = getStorage('currentUser');
  if (!currentUser) {
    showToast('Please log in to place an order', 'error');
    return null;
  }

  const cart = getCart();
  if (!cart || cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return null;
  }

  const totals = calculateCartTotals();
  const orderId = generateOrderId();

  const now = new Date();
  const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);

  const newOrder = {
    orderId: orderId,
    userEmail: currentUser.email,
    customerName: orderData.customerName || currentUser.name,
    phone: orderData.phone || currentUser.phone,
    address: orderData.address,
    city: orderData.city || 'Bengaluru',
    pincode: orderData.pincode || '',
    paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
    items: [...cart],
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.grandTotal,
    date: formattedDate,
    status: 'Order Placed'
  };

  const orders = getAllOrders();
  orders.unshift(newOrder); // Add to beginning
  saveOrders(orders);

  // Clear cart upon successful order
  saveCart([]);

  showToast(`Order #${orderId} placed successfully! 🎉`, 'success');
  return newOrder;
}

// Render My Orders Page (orders.html)
function renderUserOrdersPage() {
  const container = document.getElementById('user-orders-container');
  if (!container) return;

  const currentUser = checkUserAuth();
  if (!currentUser) return;

  const orders = getUserOrders(currentUser.email);

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No Orders Yet</h3>
        <p class="text-muted" style="margin-bottom: 1.5rem;">You haven't placed any food orders yet. Ready to taste something delicious?</p>
        <a href="menu.html" class="btn btn-primary btn-lg">Explore Menu & Order Now 🚀</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => {
    const statusClass = order.status.toLowerCase().replace(/\s+/g, '-');
    return `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.25rem;">
              <h3 style="font-size:1.25rem; font-family:var(--font-heading);">#${order.orderId}</h3>
              <span class="badge badge-${statusClass}">${order.status}</span>
            </div>
            <p class="text-muted" style="font-size:0.85rem;">Placed on: ${formatDateTime(order.date)} • Payment: ${order.paymentMethod}</p>
          </div>

          <div style="text-align: right;">
            <div style="font-size:1.35rem; font-weight:800; color:var(--dark); font-family:var(--font-heading);">
              ${formatCurrency(order.total)}
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted);">${order.items.length} item(s)</span>
          </div>
        </div>

        <div style="padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            ${order.items.map(item => `
              <div style="display:flex; justify-content:space-between; font-size:0.92rem;">
                <div>
                  <span class="diet-indicator ${item.isVeg ? 'veg' : 'non-veg'}" style="margin-right:6px;"></span>
                  <strong>${item.name}</strong> × ${item.quantity}
                </div>
                <span>${formatCurrency(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; flex-wrap:wrap; gap:0.75rem;">
          <div style="font-size:0.85rem; color:var(--text-muted);">
            📍 Delivered to: <strong>${order.address}, ${order.city || ''}</strong>
          </div>
          <div style="display:flex; gap:0.75rem;">
            <a href="track-order.html?orderId=${order.orderId}" class="btn btn-primary btn-sm">
              Track Order 📍
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Order Success Page (order-success.html)
function renderOrderSuccessPage() {
  const container = document.getElementById('order-success-details');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  const order = getOrderById(orderId);
  if (!order) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Order Not Found</h3>
        <p class="text-muted">Could not find order details. Please check your order history.</p>
        <a href="orders.html" class="btn btn-primary" style="margin-top:1rem;">Go to My Orders</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card" style="padding: 2rem; max-width: 640px; margin: 0 auto; text-align: left;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
        <div>
          <span style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">Order Reference</span>
          <h2 style="font-size:1.75rem; color:var(--primary);">#${order.orderId}</h2>
        </div>
        <span class="badge badge-placed" style="font-size:0.85rem; padding: 0.4rem 0.8rem;">${order.status}</span>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.25rem; margin-bottom: 1.5rem;">
        <div>
          <span class="text-muted" style="font-size:0.85rem;">Customer Name:</span>
          <p style="font-weight:700;">${order.customerName}</p>
        </div>
        <div>
          <span class="text-muted" style="font-size:0.85rem;">Phone Number:</span>
          <p style="font-weight:700;">${order.phone}</p>
        </div>
        <div style="grid-column: 1 / -1;">
          <span class="text-muted" style="font-size:0.85rem;">Delivery Address:</span>
          <p style="font-weight:600;">${order.address}, ${order.city || ''} - ${order.pincode || ''}</p>
        </div>
      </div>

      <h4 style="margin-bottom:0.75rem;">Ordered Items:</h4>
      <div style="background:#F8FAFC; border-radius:var(--radius-md); padding:1rem; margin-bottom:1.5rem;">
        ${order.items.map(item => `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.9rem;">
            <span>${item.name} × ${item.quantity}</span>
            <strong>${formatCurrency(item.price * item.quantity)}</strong>
          </div>
        `).join('')}
        <div style="border-top: 1px solid var(--border-color); padding-top:0.6rem; margin-top:0.6rem; display:flex; justify-content:space-between; font-weight:800; font-size:1.1rem;">
          <span>Grand Total Paid (${order.paymentMethod})</span>
          <span style="color:var(--primary);">${formatCurrency(order.total)}</span>
        </div>
      </div>

      <div style="display:flex; gap:1rem; flex-wrap:wrap;">
        <a href="track-order.html?orderId=${order.orderId}" class="btn btn-primary" style="flex:1;">
          Track Live Order 📍
        </a>
        <a href="orders.html" class="btn btn-secondary" style="flex:1;">
          My Orders 📋
        </a>
        <a href="menu.html" class="btn btn-outline" style="width:100%;">
          Continue Shopping 🍔
        </a>
      </div>
    </div>
  `;
}

// Render Order Tracking Page (track-order.html)
function renderOrderTrackingPage() {
  const container = document.getElementById('tracking-container');
  if (!container) return;

  const currentUser = checkUserAuth();
  if (!currentUser) return;

  const urlParams = new URLSearchParams(window.location.search);
  let orderId = urlParams.get('orderId');

  const userOrders = getUserOrders(currentUser.email);
  if (userOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📍</div>
        <h3>No Orders to Track</h3>
        <p class="text-muted">You haven't placed any orders yet.</p>
        <a href="menu.html" class="btn btn-primary btn-lg" style="margin-top:1rem;">Order Food Now</a>
      </div>
    `;
    return;
  }

  // If no orderId in URL, default to the most recent order
  if (!orderId) {
    orderId = userOrders[0].orderId;
  }

  const order = getOrderById(orderId);
  if (!order) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Order #${orderId} Not Found</h3>
        <p class="text-muted">Please select another order from your order list.</p>
        <a href="orders.html" class="btn btn-primary">View My Orders</a>
      </div>
    `;
    return;
  }

  // Determine current step index
  const currentStatus = order.status;
  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === 'Cancelled';

  // Calculate percentage for progress fill line
  let fillPercentage = 0;
  if (!isCancelled && currentStepIndex >= 0) {
    fillPercentage = (currentStepIndex / (ORDER_STATUS_STEPS.length - 1)) * 100;
  }

  container.innerHTML = `
    <div class="track-order-card">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding-bottom:1.5rem; border-bottom:1px solid var(--border-color);">
        <div>
          <span style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">Tracking Order</span>
          <h2 style="font-size:1.85rem; margin-top:0.2rem;">#${order.orderId}</h2>
          <p class="text-muted" style="font-size:0.85rem;">Placed at: ${formatDateTime(order.date)}</p>
        </div>

        <div style="display:flex; align-items:center; gap:0.75rem;">
          <select id="order-selector" class="form-control" style="width:auto; font-weight:600;" onchange="window.location.href='track-order.html?orderId=' + this.value">
            ${userOrders.map(o => `
              <option value="${o.orderId}" ${o.orderId === order.orderId ? 'selected' : ''}>
                #${o.orderId} (${o.status})
              </option>
            `).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" onclick="renderOrderTrackingPage(); showToast('Status refreshed!','info');" title="Refresh Live Status">
            🔄 Refresh
          </button>
        </div>
      </div>

      ${isCancelled ? `
        <div style="margin: 2rem 0; padding: 1.5rem; background: #FEE2E2; border-radius: var(--radius-lg); border: 1.5px solid #EF4444; text-align:center;">
          <h3 style="color:#991B1B; margin-bottom:0.5rem;">❌ This Order Has Been Cancelled</h3>
          <p style="color:#B91C1C;">If you have any questions or concerns, please contact FoodExpress support.</p>
        </div>
      ` : `
        <!-- Visual Progress Tracker -->
        <div class="tracking-stepper">
          <div class="tracking-progress-bar">
            <div class="tracking-progress-fill" style="width: ${fillPercentage}%;"></div>
          </div>

          ${ORDER_STATUS_STEPS.map((stepName, idx) => {
            let stepClass = '';
            let icon = idx + 1;

            if (idx < currentStepIndex) {
              stepClass = 'completed';
              icon = '✓';
            } else if (idx === currentStepIndex) {
              stepClass = 'active';
              icon = '⏳';
            }

            return `
              <div class="step-node ${stepClass}">
                <div class="step-circle">${icon}</div>
                <div class="step-label">${stepName}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Current Status Banner -->
        <div style="background:var(--primary-subtle); border-left:4px solid var(--primary); padding:1.25rem; border-radius:var(--radius-md); margin-bottom:2rem; display:flex; align-items:center; gap:1rem;">
          <div style="font-size:2rem;">🛵</div>
          <div>
            <h4 style="color:var(--dark); margin-bottom:0.2rem;">Current Status: <span style="color:var(--primary); font-weight:800;">${order.status}</span></h4>
            <p style="color:var(--text-muted); font-size:0.9rem;">${STATUS_DESCRIPTIONS[order.status] || 'Processing your order.'}</p>
          </div>
        </div>
      `}

      <!-- Delivery Details & Items Breakdown -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:2rem;">
        <div class="card" style="padding:1.5rem; background:#F8FAFC; border:none;">
          <h4 style="margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
            <span>📍</span> Delivery Information
          </h4>
          <p style="font-weight:700; margin-bottom:0.25rem;">${order.customerName}</p>
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:0.25rem;">📞 ${order.phone}</p>
          <p style="font-size:0.9rem; color:var(--text-main); margin-bottom:0.75rem;">🏠 ${order.address}, ${order.city || ''} - ${order.pincode || ''}</p>
          <p style="font-size:0.85rem; color:var(--text-muted);">Payment Method: <strong>${order.paymentMethod}</strong></p>
        </div>

        <div class="card" style="padding:1.5rem; background:#F8FAFC; border:none;">
          <h4 style="margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
            <span>🛍️</span> Order Summary (${order.items.length} items)
          </h4>
          <div style="max-height:160px; overflow-y:auto; margin-bottom:1rem; padding-right:0.5rem;">
            ${order.items.map(item => `
              <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.88rem;">
                <span>${item.name} × ${item.quantity}</span>
                <strong>${formatCurrency(item.price * item.quantity)}</strong>
              </div>
            `).join('')}
          </div>
          <div style="border-top:1px solid var(--border-color); padding-top:0.75rem; display:flex; justify-content:space-between; font-weight:800; font-size:1.15rem;">
            <span>Total Amount</span>
            <span style="color:var(--primary); font-family:var(--font-heading);">${formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Auto-Listen for order status updates from Admin in another tab or same window
window.addEventListener('storage', (event) => {
  if (event.key === 'orders' && window.location.pathname.includes('track-order.html')) {
    renderOrderTrackingPage();
  }
});
window.addEventListener('storageUpdated', () => {
  if (window.location.pathname.includes('track-order.html')) {
    renderOrderTrackingPage();
  }
});
