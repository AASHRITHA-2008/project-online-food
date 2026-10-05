/**
 * FoodExpress – Food Catalog, Search & Filtering
 * (js/food.js)
 */

// Retrieve all food items from localStorage
function getAllFoodItems() {
  return getStorage('foodItems', INITIAL_FOOD_ITEMS);
}

// Get single food item by ID
function getFoodItemById(id) {
  const items = getAllFoodItems();
  return items.find(item => item.id === id) || null;
}

// Render a single Food Card HTML
function createFoodCardHTML(item) {
  const isAvailable = item.availability === 'Available' || item.availability === true;
  const dietClass = item.isVeg ? 'veg' : 'non-veg';
  const dietTitle = item.isVeg ? 'Vegetarian' : 'Non-Vegetarian';

  return `
    <div class="food-card" data-id="${item.id}" data-category="${item.category}" data-veg="${item.isVeg}">
      <div class="food-card-img-wrap">
        <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'">
        <span class="food-status-badge ${isAvailable ? 'in-stock' : 'out-stock'}">
          ${isAvailable ? 'In Stock' : 'Out of Stock'}
        </span>
        <div class="food-rating-pill">
          <span class="star-icon">★</span>
          <span>${item.rating || '4.5'}</span>
        </div>
      </div>

      <div class="food-card-body">
        <div class="food-card-header">
          <h3 class="food-name">${item.name}</h3>
          <span class="diet-indicator ${dietClass}" title="${dietTitle}"></span>
        </div>

        <div class="food-restaurant">
          <span>🏪</span>
          <span>${item.restaurant || 'FoodExpress Special'}</span>
          <span style="margin: 0 4px;">•</span>
          <span class="badge" style="background:#F1F5F9; color:#475569; font-size:0.7rem; padding: 2px 6px;">${item.category}</span>
        </div>

        <p class="food-desc">${item.description || 'Delicious freshly prepared dish made with authentic ingredients.'}</p>

        <div class="food-card-footer">
          <div class="food-price">${formatCurrency(item.price)}</div>
          <button 
            type="button"
            class="btn btn-primary btn-sm btn-add-cart" 
            onclick="handleAddToCartClick('${item.id}')"
            ${!isAvailable ? 'disabled' : ''}>
            ${isAvailable ? 'Add to Cart 🛒' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// Render list of food items into a container
function renderFoodGrid(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🍽️</div>
        <h3>No Food Items Found</h3>
        <p class="text-muted">Try adjusting your search or category filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => createFoodCardHTML(item)).join('');
}

// Global Filter & Search state for menu
let currentFoodFilters = {
  category: 'All',
  searchQuery: '',
  diet: 'All', // All, veg, nonveg
  sortBy: 'default' // default, price-asc, price-desc, rating
};

// Filter & Sort Food Items
function filterAndSortFood(items, filters = currentFoodFilters) {
  return items.filter(item => {
    // Category filter
    if (filters.category && filters.category !== 'All' && item.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }

    // Diet filter
    if (filters.diet === 'veg' && !item.isVeg) return false;
    if (filters.diet === 'nonveg' && item.isVeg) return false;

    // Search query (search in name, restaurant, or category)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchRest = (item.restaurant || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      if (!matchName && !matchRest && !matchCat) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });
}

// Handle Add to Cart button click
function handleAddToCartClick(foodId) {
  if (typeof addToCart === 'function') {
    addToCart(foodId, 1);
  } else {
    console.warn("addToCart function not loaded yet");
  }
}
