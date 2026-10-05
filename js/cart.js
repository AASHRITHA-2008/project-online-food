/**
 * FoodExpress – Shopping Cart Operations
 * (js/cart.js)
 */

// Get current cart from localStorage
function getCart() {
  return getStorage('cart', []);
}

// Save cart to localStorage
function saveCart(cart) {
  setStorage('cart', cart);
  updateNavbarCartCount();
}

// Add item to cart
function addToCart(foodId, quantity = 1) {
  const foodItem = getFoodItemById(foodId);
  if (!foodItem) {
    showToast('Food item not found!', 'error');
    return;
  }

  if (foodItem.availability === 'Out of Stock') {
    showToast('Sorry, this item is currently out of stock!', 'warning');
    return;
  }

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.foodId === foodId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      foodId: foodItem.id,
      name: foodItem.name,
      restaurant: foodItem.restaurant,
      price: foodItem.price,
      image: foodItem.image,
      isVeg: foodItem.isVeg,
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added ${foodItem.name} to cart! 🛒`, 'success');
}

// Update item quantity
function updateQuantity(foodId, delta) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.foodId === foodId);

  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
      showToast('Item removed from cart', 'info');
    }
    saveCart(cart);
    renderCartPage();
  }
}

// Remove item from cart
function removeFromCart(foodId) {
  let cart = getCart();
  const item = cart.find(i => i.foodId === foodId);
  cart = cart.filter(i => i.foodId !== foodId);
  saveCart(cart);
  showToast(item ? `Removed ${item.name} from cart` : 'Item removed', 'info');
  renderCartPage();
}

// Clear all items in cart
function clearCart() {
  saveCart([]);
  renderCartPage();
}

// Calculate Cart Totals
function calculateCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Delivery Fee: ₹40 if subtotal > 0, free delivery over ₹500
  let deliveryFee = 0;
  if (subtotal > 0) {
    deliveryFee = subtotal >= 500 ? 0 : 40;
  }
  
  const grandTotal = subtotal + deliveryFee;

  return {
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    deliveryFee,
    grandTotal
  };
}

// Render Cart Page Elements
function renderCartPage() {
  const cartContainer = document.getElementById('cart-items-container');
  const summaryContainer = document.getElementById('cart-summary-container');
  if (!cartContainer) return;

  const cart = getCart();
  const totals = calculateCartTotals();

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <h3>Your Cart is Empty</h3>
        <p class="text-muted" style="margin-bottom: 1.5rem;">Looks like you haven't added anything to your cart yet.</p>
        <a href="menu.html" class="btn btn-primary btn-lg">Browse Menu & Order Now 🚀</a>
      </div>
    `;

    if (summaryContainer) {
      summaryContainer.style.display = 'none';
    }
    return;
  }

  if (summaryContainer) {
    summaryContainer.style.display = 'block';
  }

  // Render items
  cartContainer.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <h3>Your Items (${totals.itemCount})</h3>
      <button class="btn btn-secondary btn-sm" onclick="clearCart()">Clear All</button>
    </div>
    <div class="cart-items-list">
      ${cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'">
          
          <div class="cart-item-details">
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span class="diet-indicator ${item.isVeg ? 'veg' : 'non-veg'}"></span>
              <h4>${item.name}</h4>
            </div>
            <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.4rem;">${item.restaurant || 'FoodExpress'}</p>
            <div class="cart-item-price">${formatCurrency(item.price)} each</div>
          </div>

          <div class="quantity-control">
            <button class="quantity-btn" onclick="updateQuantity('${item.foodId}', -1)" title="Decrease quantity">−</button>
            <span class="quantity-input">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity('${item.foodId}', 1)" title="Increase quantity">+</button>
          </div>

          <div style="text-align: right; min-width: 80px;">
            <div style="font-weight: 800; font-size: 1.1rem; color: var(--dark); margin-bottom: 0.35rem;">
              ${formatCurrency(item.price * item.quantity)}
            </div>
            <button class="btn-remove" onclick="removeFromCart('${item.foodId}')" title="Remove item">
              🗑️ Remove
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Render Order Summary
  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div class="order-summary-card">
        <h3>Order Summary</h3>

        <div class="summary-line">
          <span>Subtotal</span>
          <strong>${formatCurrency(totals.subtotal)}</strong>
        </div>

        <div class="summary-line">
          <span>Delivery Fee</span>
          <strong>${totals.deliveryFee === 0 ? '<span style="color:var(--status-delivered)">FREE</span>' : formatCurrency(totals.deliveryFee)}</strong>
        </div>

        ${totals.subtotal < 500 && totals.subtotal > 0 ? `
          <div style="background:#FFF8E1; border:1px solid #FFE082; padding:0.6rem 0.8rem; border-radius:var(--radius-md); font-size:0.8rem; color:#8D6E63; margin-bottom:1rem;">
            💡 Add ${formatCurrency(500 - totals.subtotal)} more to get <strong>FREE delivery</strong>!
          </div>
        ` : ''}

        <div class="summary-total">
          <span>Grand Total</span>
          <span style="color: var(--primary);">${formatCurrency(totals.grandTotal)}</span>
        </div>

        <div style="margin-top: 1.75rem;">
          <a href="checkout.html" class="btn btn-primary btn-lg btn-block">
            Proceed to Checkout →
          </a>
          <a href="menu.html" class="btn btn-secondary btn-block" style="margin-top: 0.75rem;">
            Add More Items
          </a>
        </div>
      </div>
    `;
  }
}
