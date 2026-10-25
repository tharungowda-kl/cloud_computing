/**
 * GraminSeva - Notifications & Announcements Script
 */

let allNotifications = [];
let activeNotifCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
  fetchNotifications();

  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', markAllAsRead);
  }

  const categoryPills = document.querySelectorAll('.notif-filter-btn');
  categoryPills.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeNotifCategory = btn.getAttribute('data-category') || 'All';
      renderNotifications();
    });
  });
});

async function fetchNotifications() {
  const container = document.getElementById('notifications-container');
  if (container) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);">Loading announcements...</div>';
  }

  try {
    const token = getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch('/api/notifications', { headers });
    const data = await res.json();

    if (data.success) {
      allNotifications = data.data;
      renderNotifications();
      updateNotificationBadge();
    } else {
      if (container) container.innerHTML = '<div style="text-align: center; color: var(--accent-red);">Failed to load notifications.</div>';
    }
  } catch (err) {
    console.error('Fetch notifications error:', err);
    if (container) container.innerHTML = '<div style="text-align: center; color: var(--accent-red);">Server unavailable. Ensure backend is running.</div>';
  }
}

function renderNotifications() {
  const container = document.getElementById('notifications-container');
  if (!container) return;

  let filtered = allNotifications;
  if (activeNotifCategory !== 'All') {
    filtered = filtered.filter(n => n.category && n.category.toLowerCase() === activeNotifCategory.toLowerCase());
  }

  const unreadCount = filtered.filter(n => !n.isRead).length;
  const countEl = document.getElementById('unread-summary-text');
  if (countEl) {
    countEl.textContent = `${unreadCount} unread announcement${unreadCount === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px dashed var(--border-color);">
        <h3 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 6px;">No Notifications in this Category</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">You are up to date on all rural updates!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(notif => {
    let iconSvg = '';
    if (notif.category === 'Schemes') {
      iconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    } else if (notif.category === 'Scholarships') {
      iconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`;
    } else if (notif.category === 'Agriculture') {
      iconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 20h10"></path><path d="M10 20c0-5 3-7 5-14"></path><path d="M4 15c4 0 7-3 7-7"></path></svg>`;
    } else if (notif.category === 'Weather') {
      iconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>`;
    } else {
      iconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    let priorityBadge = '';
    if (notif.priority === 'Urgent') {
      priorityBadge = '<span class="badge badge-red">Urgent</span>';
    } else if (notif.priority === 'High') {
      priorityBadge = '<span class="badge badge-amber">High Priority</span>';
    }

    const timeAgo = formatTimeAgo(notif.createdAt);

    return `
      <div class="notification-item ${notif.isRead ? 'read' : 'unread'}">
        <div class="notif-icon-box">
          ${iconSvg}
        </div>
        <div class="notif-content">
          <div class="notif-title-row">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h4 class="notif-title">${escapeHtml(notif.title)}</h4>
              <span class="badge badge-blue">${escapeHtml(notif.category)}</span>
              ${priorityBadge}
            </div>
            <span class="notif-time">${timeAgo}</span>
          </div>
          <p class="notif-msg">${escapeHtml(notif.message)}</p>
          
          <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            ${!notif.isRead ? `
              <button onclick="markAsRead('${notif._id || notif.id}')" class="btn btn-outline-primary btn-sm">
                Mark as Read ✓
              </button>
            ` : `
              <span style="font-size: 0.8rem; color: var(--text-light); font-weight: 600;">✓ Read</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function markAsRead(id) {
  if (!isLoggedIn()) {
    showToast('Please login to track your notification read status.', 'info');
    return;
  }

  try {
    const token = getAuthToken();
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const item = allNotifications.find(n => (n._id || n.id) === id);
      if (item) item.isRead = true;
      renderNotifications();
      updateNotificationBadge();
    }
  } catch (err) {
    console.error('Error marking read:', err);
  }
}

async function markAllAsRead() {
  if (!isLoggedIn()) {
    showToast('Please login to update notifications.', 'info');
    return;
  }

  try {
    const token = getAuthToken();
    const res = await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast('All notifications marked as read.', 'success');
      allNotifications.forEach(n => n.isRead = true);
      renderNotifications();
      updateNotificationBadge();
    }
  } catch (err) {
    showToast('Server communication error.', 'error');
  }
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins <= 1 ? 'Just now' : mins + ' mins ago'}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
