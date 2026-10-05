/**
 * FoodExpress – Core Main Utilities & Data Initialization
 * (js/main.js)
 */

// Local Storage Helper Functions
function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event to notify other scripts on same page if needed
    window.dispatchEvent(new Event('storageUpdated'));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Initial Sample Food Data (Mandatory 8 items + bonuses)
const INITIAL_FOOD_ITEMS = [
  {
    id: "FD101",
    name: "Chicken Biryani",
    restaurant: "Paradise Biryani",
    category: "Biryani",
    price: 180,
    description: "Aromatic basmati rice cooked with tender chicken pieces, saffron, and authentic spices.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: false,
    rating: 4.8
  },
  {
    id: "FD102",
    name: "Veg Biryani",
    restaurant: "Royal Veg Court",
    category: "Biryani",
    price: 140,
    description: "Fragrant rice layered with fresh seasonal vegetables, mint, and royal Mughlai spices.",
    image: "https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: true,
    rating: 4.6
  },
  {
    id: "FD103",
    name: "Chicken Pizza",
    restaurant: "Pizza Hub",
    category: "Pizza",
    price: 250,
    description: "Crispy crust topped with seasoned grilled chicken, mozzarella, bell peppers, and oregano.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: false,
    rating: 4.7
  },
  {
    id: "FD104",
    name: "Veg Burger",
    restaurant: "Burger Joint",
    category: "Burgers",
    price: 120,
    description: "Crispy vegetable patty with lettuce, tomatoes, creamy mayo, and molten cheese in a toasted bun.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: true,
    rating: 4.5
  },
  {
    id: "FD105",
    name: "Chicken Noodles",
    restaurant: "Wok Express",
    category: "Chinese",
    price: 160,
    description: "Stir-fried Hakka noodles tossed with tender shredded chicken, crunchy vegetables, and savory soy sauce.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: false,
    rating: 4.6
  },
  {
    id: "FD106",
    name: "Masala Dosa",
    restaurant: "Udupi Bhavan",
    category: "South Indian",
    price: 90,
    description: "Golden crispy fermented crepe stuffed with spiced mashed potatoes, served with coconut chutney & sambar.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: true,
    rating: 4.9
  },
  {
    id: "FD107",
    name: "Paneer Butter Masala",
    restaurant: "Punjabi Rasoi",
    category: "North Indian",
    price: 190,
    description: "Soft cottage cheese cubes cooked in a rich, buttery tomato gravy with cream and aromatic herbs.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: true,
    rating: 4.8
  },
  {
    id: "FD108",
    name: "Chocolate Cake",
    restaurant: "Sweet Treats",
    category: "Desserts",
    price: 130,
    description: "Decadent Dutch chocolate sponge cake layered with rich dark chocolate fudge and ganache.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: true,
    rating: 4.9
  },
  {
    id: "FD109",
    name: "Tandoori Chicken",
    restaurant: "Punjab Grill",
    category: "North Indian",
    price: 220,
    description: "Succulent chicken leg quarters marinated in spiced yogurt and roasted to smoky perfection in clay oven.",
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: false,
    rating: 4.8
  },
  {
    id: "FD110",
    name: "Butter Naan (2 pcs)",
    restaurant: "Punjab Grill",
    category: "North Indian",
    price: 60,
    description: "Fluffy leavened flatbread brushed with luscious melted butter, freshly baked in tandoor.",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: true,
    rating: 4.7
  },
  {
    id: "FD111",
    name: "Cold Coffee with Ice Cream",
    restaurant: "Cafe Delight",
    category: "Desserts",
    price: 110,
    description: "Thick creamy chilled coffee blended with espresso and topped with a scoop of vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: true,
    rating: 4.6
  },
  {
    id: "FD112",
    name: "Veg Manchurian Gravy",
    restaurant: "Wok Express",
    category: "Chinese",
    price: 150,
    description: "Crispy vegetable dumplings simmered in tangy, spicy garlic and ginger Manchurian sauce.",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80",
    availability: "Available",
    isVeg: true,
    rating: 4.5
  }
];

// Initial Demo User for seamless testing
const INITIAL_DEMO_USERS = [
  {
    id: "USR101",
    name: "Aashritha",
    email: "user@example.com",
    phone: "9876543210",
    password: "password123",
    address: "Plot 42, Green Valley Apartments, Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    createdAt: "2026-10-01T10:00:00.000Z"
  }
];

// Initialize Data if Missing
function initApplicationData() {
  if (!localStorage.getItem('foodItems')) {
    setStorage('foodItems', INITIAL_FOOD_ITEMS);
    console.log("Initialized sample food items in localStorage");
  }

  if (!localStorage.getItem('users')) {
    setStorage('users', INITIAL_DEMO_USERS);
    console.log("Initialized demo users in localStorage");
  }

  if (!localStorage.getItem('cart')) {
    setStorage('cart', []);
  }

  if (!localStorage.getItem('orders')) {
    // Seed 1 sample past order for immediate demonstration
    const sampleOrders = [
      {
        orderId: "FE10001",
        userEmail: "user@example.com",
        customerName: "Aashritha",
        phone: "9876543210",
        address: "Plot 42, Green Valley Apartments, Indiranagar",
        city: "Bengaluru",
        pincode: "560038",
        paymentMethod: "Cash on Delivery",
        items: [
          {
            foodId: "FD101",
            name: "Chicken Biryani",
            price: 180,
            quantity: 2,
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
          },
          {
            foodId: "FD108",
            name: "Chocolate Cake",
            price: 130,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80"
          }
        ],
        subtotal: 490,
        deliveryFee: 40,
        total: 530,
        date: "2026-10-05 14:30",
        status: "Preparing"
      }
    ];
    setStorage('orders', sampleOrders);
    console.log("Initialized sample orders in localStorage");
  }
}

// Toast Notifications System
function showToast(message, type = 'info', duration = 3200) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-weight: 800; font-size: 1.1rem; line-height: 1;">${icons[type] || '•'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOutRight 0.3s forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Format Currency
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toFixed(0)}`;
}

// Format Date
function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Update Cart Badge on Navbar
function updateNavbarCartCount() {
  const cart = getStorage('cart', []);
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badgeElements = document.querySelectorAll('.cart-badge');
  badgeElements.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Setup Mobile Navigation Toggle
function setupNavToggle() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initApplicationData();
  updateNavbarCartCount();
  setupNavToggle();

  // Listen for storage events (e.g. from other tabs or actions)
  window.addEventListener('storage', () => {
    updateNavbarCartCount();
  });
  window.addEventListener('storageUpdated', () => {
    updateNavbarCartCount();
  });
});
