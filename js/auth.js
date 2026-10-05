/**
 * FoodExpress – Authentication & Session Management
 * (js/auth.js)
 */

// Helper to determine path prefix depending on current page folder
function getPathPrefix() {
  const path = window.location.pathname.replace(/\\/g, '/');
  if (path.includes('/user/') || path.includes('/admin/')) {
    return '../';
  }
  return './';
}

// Check User Authentication Protection
function checkUserAuth() {
  const currentUser = getStorage('currentUser');
  if (!currentUser) {
    const prefix = getPathPrefix();
    window.location.replace(`${prefix}login.html?redirect=unauthorized`);
    return false;
  }
  return currentUser;
}

// Check Admin Authentication Protection
function checkAdminAuth() {
  const isAdmin = localStorage.getItem('adminLoggedIn');
  if (isAdmin !== 'true') {
    const prefix = getPathPrefix();
    window.location.replace(`${prefix}admin/login.html?redirect=unauthorized`);
    return false;
  }
  return true;
}

// User Registration
function registerUser(name, email, phone, password, confirmPassword) {
  // Input Trimming
  name = (name || '').trim();
  email = (email || '').trim().toLowerCase();
  phone = (phone || '').trim();
  password = (password || '').trim();
  confirmPassword = (confirmPassword || '').trim();

  // Validation
  if (!name || !email || !phone || !password || !confirmPassword) {
    showToast('Please fill in all fields', 'error');
    return { success: false, message: 'All fields are required.' };
  }

  // Email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Please enter a valid email address', 'error');
    return { success: false, message: 'Invalid email address.' };
  }

  // Phone number (10 digits)
  const phoneClean = phone.replace(/[^0-9]/g, '');
  if (phoneClean.length < 10) {
    showToast('Please enter a valid 10-digit phone number', 'error');
    return { success: false, message: 'Invalid phone number.' };
  }

  // Password length
  if (password.length < 6) {
    showToast('Password must be at least 6 characters long', 'error');
    return { success: false, message: 'Password too short.' };
  }

  // Password match
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return { success: false, message: 'Passwords do not match.' };
  }

  // Check duplicate email in localStorage users
  const users = getStorage('users', []);
  const existingUser = users.find(u => u.email.toLowerCase() === email);
  if (existingUser) {
    showToast('An account with this email already exists', 'error');
    return { success: false, message: 'Email already registered.' };
  }

  // Create new user object
  const newUser = {
    id: 'USR' + Math.floor(1000 + Math.random() * 9000),
    name: name,
    email: email,
    phone: phoneClean,
    password: password,
    address: '',
    city: '',
    pincode: '',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  setStorage('users', users);

  showToast('Account created successfully! Redirecting...', 'success');

  setTimeout(() => {
    const prefix = getPathPrefix();
    window.location.href = `${prefix}login.html?registered=true`;
  }, 1000);

  return { success: true };
}

// User Login
function loginUser(email, password) {
  email = (email || '').trim().toLowerCase();
  password = (password || '').trim();

  if (!email || !password) {
    showToast('Please enter your email and password', 'error');
    return { success: false, message: 'Please enter both email and password.' };
  }

  const users = getStorage('users', []);
  const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

  if (!user) {
    showToast('Invalid email or password', 'error');
    return { success: false, message: 'Invalid credentials.' };
  }

  // Store currentUser in localStorage
  setStorage('currentUser', user);
  showToast(`Welcome back, ${user.name}!`, 'success');

  setTimeout(() => {
    const prefix = getPathPrefix();
    window.location.href = `${prefix}user/home.html`;
  }, 800);

  return { success: true, user };
}

// User Logout
function logoutUser() {
  localStorage.removeItem('currentUser');
  showToast('You have been logged out', 'info');
  setTimeout(() => {
    const prefix = getPathPrefix();
    window.location.href = `${prefix}login.html`;
  }, 500);
}

// Admin Login
function loginAdmin(username, password) {
  username = (username || '').trim();
  password = (password || '').trim();

  if (!username || !password) {
    showToast('Please enter admin credentials', 'error');
    return { success: false };
  }

  // Required credentials: admin / admin123
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('adminLoggedIn', 'true');
    showToast('Admin logged in successfully!', 'success');

    setTimeout(() => {
      const prefix = getPathPrefix();
      // If we are already inside admin/ folder:
      if (window.location.pathname.includes('/admin/')) {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = `${prefix}admin/dashboard.html`;
      }
    }, 800);

    return { success: true };
  } else {
    showToast('Invalid Admin credentials! Use admin / admin123', 'error');
    return { success: false, message: 'Invalid admin credentials.' };
  }
}

// Admin Logout
function logoutAdmin() {
  localStorage.removeItem('adminLoggedIn');
  showToast('Admin logged out', 'info');
  setTimeout(() => {
    const prefix = getPathPrefix();
    if (window.location.pathname.includes('/admin/')) {
      window.location.href = 'login.html';
    } else {
      window.location.href = `${prefix}admin/login.html`;
    }
  }, 500);
}

// Update User Profile
function updateUserProfile(updatedData) {
  const currentUser = getStorage('currentUser');
  if (!currentUser) return false;

  const users = getStorage('users', []);
  const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());

  const mergedUser = {
    ...currentUser,
    name: updatedData.name || currentUser.name,
    phone: updatedData.phone || currentUser.phone,
    address: updatedData.address !== undefined ? updatedData.address : currentUser.address,
    city: updatedData.city !== undefined ? updatedData.city : currentUser.city,
    pincode: updatedData.pincode !== undefined ? updatedData.pincode : currentUser.pincode
  };

  if (updatedData.newPassword) {
    if (updatedData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return false;
    }
    mergedUser.password = updatedData.newPassword;
  }

  // Save to both currentUser and users collection
  setStorage('currentUser', mergedUser);
  if (userIndex !== -1) {
    users[userIndex] = mergedUser;
    setStorage('users', users);
  }

  showToast('Profile updated successfully!', 'success');
  return true;
}

// Populate user details in navbar if logged in
function renderUserNavbarInfo() {
  const currentUser = getStorage('currentUser');
  const userProfileEl = document.getElementById('nav-user-info');
  if (userProfileEl && currentUser) {
    userProfileEl.innerHTML = `
      <div class="user-profile-menu">
        <div class="user-avatar-sm">${currentUser.name.charAt(0).toUpperCase()}</div>
        <span>${currentUser.name.split(' ')[0]}</span>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderUserNavbarInfo();
});
