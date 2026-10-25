/**
 * GraminSeva - Shared Frontend Application Utilities
 */

// Local Storage Keys
const TOKEN_KEY = 'gramin_auth_token';
const USER_KEY = 'gramin_user_profile';

// Auth State Helpers
function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isLoggedIn() {
  return !!getAuthToken();
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

function logout() {
  clearAuthSession();
  showToast('You have been logged out.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// Global Toast Notification Helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Fetch Unread Notifications Count for Navigation Badges
async function updateNotificationBadge() {
  try {
    const token = getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch('/api/notifications', { headers });
    const data = await res.json();
    if (data.success) {
      const badgeElements = document.querySelectorAll('.notif-badge-count');
      badgeElements.forEach(el => {
        if (data.unreadCount > 0) {
          el.textContent = data.unreadCount;
          el.style.display = 'inline-block';
        } else {
          el.style.display = 'none';
        }
      });
    }
  } catch (err) {
    // Silently ignore if server unavailable
  }
}

// Setup Shared Navigation Bar State
function initializeNavigation() {
  const authNav = document.getElementById('nav-auth-actions');
  const user = getCurrentUser();

  if (authNav) {
    if (isLoggedIn() && user) {
      authNav.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <a href="dashboard.html" class="btn btn-outline-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>
          ${user.role === 'admin' ? `
            <a href="admin.html" class="btn btn-secondary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Admin Panel
            </a>
          ` : ''}
          <button onclick="logout()" class="btn btn-outline btn-sm" title="Log out of account">
            Log out
          </button>
        </div>
      `;
    } else {
      authNav.innerHTML = `
        <a href="login.html" class="btn btn-outline-primary btn-sm">Sign In</a>
        <a href="register.html" class="btn btn-primary btn-sm">Register</a>
      `;
    }
  }

  // Update notification badge if present
  updateNotificationBadge();
}

// Guard page: Require Authentication
function requireAuthPage() {
  if (!isLoggedIn()) {
    showToast('Please log in to access this page.', 'error');
    window.location.href = 'login.html';
  }
}

// Guard page: Require Administrator Role
function requireAdminPage() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  if (!isAdmin()) {
    alert('Access Restricted: This section requires Administrator permissions.');
    window.location.href = 'dashboard.html';
  }
}

// Auto run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
});
