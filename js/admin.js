/**
 * FoodExpress – Admin Dashboard & Management Module
 * (js/admin.js)
 */

// Initialize Dashboard Metrics & Recent Orders
function initAdminDashboard() {
  checkAdminAuth();

  const users = getStorage('users', []);
  const foodItems = getStorage('foodItems', []);
  const orders = getStorage('orders', []);

  // Compute metrics
  const totalUsers = users.length;
  const totalFoodItems = foodItems.length;
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Render Metric values
  const elUsers = document.getElementById('stat-total-users');
  const elFood = document.getElementById('stat-total-food');
  const elOrders = document.getElementById('stat-total-orders');
  const elPending = document.getElementById('stat-pending-orders');
  const elCompleted = document.getElementById('stat-completed-orders');
  const elRevenue = document.getElementById('stat-total-revenue');

  if (elUsers) elUsers.textContent = totalUsers;
  if (elFood) elFood.textContent = totalFoodItems;
  if (elOrders) elOrders.textContent = totalOrders;
  if (elPending) elPending.textContent = pendingOrders;
  if (elCompleted) elCompleted.textContent = completedOrders;
  if (elRevenue) elRevenue.textContent = formatCurrency(totalRevenue);

  // Render Recent Orders on Dashboard (first 5)
  const recentOrdersTable = document.getElementById('dashboard-recent-orders');
  if (recentOrdersTable) {
    if (orders.length === 0) {
      recentOrdersTable.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">No orders placed yet.</td></tr>`;
    } else {
      const topOrders = orders.slice(0, 6);
      recentOrdersTable.innerHTML = topOrders.map(order => `
        <tr>
          <td><strong>#${order.orderId}</strong></td>
          <td>
            <div style="font-weight:600;">${order.customerName}</div>
            <small style="color:var(--text-muted);">${order.phone}</small>
          </td>
          <td>${order.items.length} item(s)</td>
          <td style="font-weight:700;">${formatCurrency(order.total)}</td>
          <td>
            <select class="status-select status-${order.status.toLowerCase().replace(/\s+/g, '-')}" onchange="handleOrderStatusChange('${order.orderId}', this.value)">
              <option value="Order Placed" ${order.status === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
              <option value="Order Confirmed" ${order.status === 'Order Confirmed' ? 'selected' : ''}>Order Confirmed</option>
              <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
              <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td><small>${formatDateTime(order.date)}</small></td>
        </tr>
      `).join('');
    }
  }
}

// ==========================================
// FOOD MANAGEMENT (CRUD)
// ==========================================

let adminFoodList = [];

function loadAdminFoodItems() {
  checkAdminAuth();
  adminFoodList = getStorage('foodItems', INITIAL_FOOD_ITEMS);
  renderAdminFoodTable();
}

function renderAdminFoodTable() {
  const tableBody = document.getElementById('admin-food-table-body');
  if (!tableBody) return;

  const searchInput = document.getElementById('food-search-input');
  const catFilter = document.getElementById('food-category-filter');
  const availFilter = document.getElementById('food-avail-filter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const category = catFilter ? catFilter.value : 'All';
  const avail = availFilter ? availFilter.value : 'All';

  const filtered = adminFoodList.filter(item => {
    if (query && !item.name.toLowerCase().includes(query) && !(item.restaurant || '').toLowerCase().includes(query)) {
      return false;
    }
    if (category !== 'All' && item.category !== category) {
      return false;
    }
    if (avail !== 'All') {
      const isAvail = item.availability === 'Available' || item.availability === true;
      if (avail === 'Available' && !isAvail) return false;
      if (avail === 'Out of Stock' && isAvail) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">No matching food items found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(item => {
    const isAvail = item.availability === 'Available' || item.availability === true;
    return `
      <tr>
        <td>
          <img src="${item.image}" alt="${item.name}" class="table-food-img" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'">
        </td>
        <td>
          <div style="font-weight:700; display:flex; align-items:center; gap:6px;">
            <span class="diet-indicator ${item.isVeg ? 'veg' : 'non-veg'}"></span>
            ${item.name}
          </div>
          <small style="color:var(--text-muted); font-size:0.75rem;">ID: ${item.id}</small>
        </td>
        <td>${item.restaurant || 'FoodExpress'}</td>
        <td><span class="badge" style="background:#F1F5F9; color:#475569;">${item.category}</span></td>
        <td style="font-weight:700;">${formatCurrency(item.price)}</td>
        <td>
          <label class="switch" title="Toggle Availability">
            <input type="checkbox" ${isAvail ? 'checked' : ''} onchange="toggleFoodAvailability('${item.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick="openEditFoodModal('${item.id}')" title="Edit Item">✏️</button>
            <button class="btn-icon btn-icon-danger" onclick="deleteFoodItem('${item.id}')" title="Delete Item">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle Food Availability
function toggleFoodAvailability(foodId, isAvailable) {
  const items = getStorage('foodItems', []);
  const itemIndex = items.findIndex(i => i.id === foodId);
  if (itemIndex > -1) {
    items[itemIndex].availability = isAvailable ? 'Available' : 'Out of Stock';
    setStorage('foodItems', items);
    adminFoodList = items;
    showToast(`Updated availability for ${items[itemIndex].name}`, 'info');
  }
}

// Delete Food Item
function deleteFoodItem(foodId) {
  const item = adminFoodList.find(i => i.id === foodId);
  const name = item ? item.name : 'this item';
  if (confirm(`Are you sure you want to delete "${name}"?`)) {
    adminFoodList = adminFoodList.filter(i => i.id !== foodId);
    setStorage('foodItems', adminFoodList);
    showToast(`Deleted "${name}"`, 'success');
    renderAdminFoodTable();
  }
}

// Open Food Modal for Add / Edit
let editingFoodId = null;

function openAddFoodModal() {
  editingFoodId = null;
  document.getElementById('modal-food-title').textContent = 'Add New Food Item';
  document.getElementById('food-form').reset();
  document.getElementById('food-id-input').value = 'FD' + Math.floor(100 + Math.random() * 900);
  document.getElementById('food-modal').classList.add('active');
}

function openEditFoodModal(foodId) {
  editingFoodId = foodId;
  const item = adminFoodList.find(i => i.id === foodId);
  if (!item) return;

  document.getElementById('modal-food-title').textContent = 'Edit Food Item';
  document.getElementById('food-id-input').value = item.id;
  document.getElementById('food-name-input').value = item.name;
  document.getElementById('food-restaurant-input').value = item.restaurant || '';
  document.getElementById('food-category-input').value = item.category;
  document.getElementById('food-price-input').value = item.price;
  document.getElementById('food-desc-input').value = item.description || '';
  document.getElementById('food-image-input').value = item.image || '';
  document.getElementById('food-veg-input').checked = !!item.isVeg;
  document.getElementById('food-avail-input').value = item.availability === 'Out of Stock' ? 'Out of Stock' : 'Available';

  document.getElementById('food-modal').classList.add('active');
}

function closeFoodModal() {
  document.getElementById('food-modal').classList.remove('active');
}

// Save Food (Create or Update)
function handleFoodFormSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('food-id-input').value.trim();
  const name = document.getElementById('food-name-input').value.trim();
  const restaurant = document.getElementById('food-restaurant-input').value.trim() || 'FoodExpress Special';
  const category = document.getElementById('food-category-input').value;
  const price = Number(document.getElementById('food-price-input').value);
  const description = document.getElementById('food-desc-input').value.trim();
  let image = document.getElementById('food-image-input').value.trim();
  const isVeg = document.getElementById('food-veg-input').checked;
  const availability = document.getElementById('food-avail-input').value;

  if (!name || isNaN(price) || price <= 0) {
    showToast('Please provide a valid food name and price', 'error');
    return;
  }

  if (!image) {
    image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  }

  let items = getStorage('foodItems', []);

  if (editingFoodId) {
    // Edit existing
    const idx = items.findIndex(i => i.id === editingFoodId);
    if (idx > -1) {
      items[idx] = {
        ...items[idx],
        name,
        restaurant,
        category,
        price,
        description,
        image,
        isVeg,
        availability
      };
      showToast('Food item updated successfully!', 'success');
    }
  } else {
    // Add new
    const newItem = {
      id: id || ('FD' + Math.floor(100 + Math.random() * 900)),
      name,
      restaurant,
      category,
      price,
      description,
      image,
      isVeg,
      availability,
      rating: 4.8
    };
    items.unshift(newItem);
    showToast('New food item added successfully!', 'success');
  }

  setStorage('foodItems', items);
  adminFoodList = items;
  closeFoodModal();
  renderAdminFoodTable();
}

// ==========================================
// ORDER MANAGEMENT
// ==========================================

let adminOrdersList = [];

function loadAdminOrders() {
  checkAdminAuth();
  adminOrdersList = getStorage('orders', []);
  renderAdminOrdersTable();
}

function renderAdminOrdersTable() {
  const tableBody = document.getElementById('admin-orders-table-body');
  if (!tableBody) return;

  const searchInput = document.getElementById('order-search-input');
  const statusFilter = document.getElementById('order-status-filter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const status = statusFilter ? statusFilter.value : 'All';

  const filtered = adminOrdersList.filter(order => {
    if (query) {
      const matchId = order.orderId.toLowerCase().includes(query);
      const matchName = order.customerName.toLowerCase().includes(query);
      const matchPhone = (order.phone || '').includes(query);
      if (!matchId && !matchName && !matchPhone) return false;
    }

    if (status !== 'All' && order.status !== status) {
      return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">No matching customer orders found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(order => {
    const statusClass = order.status.toLowerCase().replace(/\s+/g, '-');
    return `
      <tr>
        <td><strong>#${order.orderId}</strong></td>
        <td>
          <div style="font-weight:700;">${order.customerName}</div>
          <small style="color:var(--text-muted);">${order.phone} • ${order.userEmail}</small>
        </td>
        <td style="max-width:240px;">
          <div style="font-size:0.85rem;">
            ${order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}
          </div>
        </td>
        <td style="font-weight:800; font-family:var(--font-heading);">${formatCurrency(order.total)}</td>
        <td>
          <small style="color:var(--text-muted);">${order.address}, ${order.city || ''}</small>
        </td>
        <td>
          <select 
            class="status-select status-${statusClass}" 
            onchange="handleOrderStatusChange('${order.orderId}', this.value)">
            <option value="Order Placed" ${order.status === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
            <option value="Order Confirmed" ${order.status === 'Order Confirmed' ? 'selected' : ''}>Order Confirmed</option>
            <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
            <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td><small>${formatDateTime(order.date)}</small></td>
      </tr>
    `;
  }).join('');
}

// Handle Order Status Change by Admin
function handleOrderStatusChange(orderId, newStatus) {
  const orders = getStorage('orders', []);
  const orderIdx = orders.findIndex(o => o.orderId === orderId);

  if (orderIdx > -1) {
    orders[orderIdx].status = newStatus;
    setStorage('orders', orders);
    adminOrdersList = orders;
    showToast(`Order #${orderId} status updated to: ${newStatus}`, 'success');

    // Re-render table if on manage-orders or dashboard
    if (document.getElementById('admin-orders-table-body')) {
      renderAdminOrdersTable();
    }
    if (document.getElementById('dashboard-recent-orders')) {
      initAdminDashboard();
    }
  }
}

// ==========================================
// USER MANAGEMENT
// ==========================================

let adminUsersList = [];

function loadAdminUsers() {
  checkAdminAuth();
  adminUsersList = getStorage('users', []);
  renderAdminUsersTable();
}

function renderAdminUsersTable() {
  const tableBody = document.getElementById('admin-users-table-body');
  if (!tableBody) return;

  const searchInput = document.getElementById('user-search-input');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const orders = getStorage('orders', []);

  const filtered = adminUsersList.filter(user => {
    if (query) {
      const matchName = user.name.toLowerCase().includes(query);
      const matchEmail = user.email.toLowerCase().includes(query);
      const matchPhone = (user.phone || '').includes(query);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">No users found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(user => {
    const userOrderCount = orders.filter(o => o.userEmail && o.userEmail.toLowerCase() === user.email.toLowerCase()).length;
    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="user-avatar-sm">${user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div style="font-weight:700;">${user.name}</div>
              <small style="color:var(--text-muted);">ID: ${user.id || 'USR'}</small>
            </div>
          </div>
        </td>
        <td>${user.email}</td>
        <td>${user.phone || 'N/A'}</td>
        <td>${user.city || user.address || 'Bengaluru'}</td>
        <td><span class="badge" style="background:#E0E7FF; color:#3730A3;">${userOrderCount} Orders</span></td>
        <td>
          <button class="btn-icon btn-icon-danger" onclick="deleteUser('${user.email}')" title="Delete User">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Delete User
function deleteUser(email) {
  const currentUser = getStorage('currentUser');
  if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
    showToast('Cannot delete currently active logged in user session!', 'warning');
    return;
  }

  if (confirm(`Are you sure you want to delete user with email "${email}"?`)) {
    adminUsersList = adminUsersList.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    setStorage('users', adminUsersList);
    showToast(`User deleted`, 'info');
    renderAdminUsersTable();
  }
}
