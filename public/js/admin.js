/**
 * GraminSeva - Admin Panel Management Script
 */

let editingSchemeId = null;
let editingScholarshipId = null;
let editingArticleId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure only authenticated admin accesses this page
  requireAdminPage();

  // Tab Switching
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.getAttribute('data-target'));
      if (targetPane) targetPane.classList.add('active');

      // Load tab-specific data
      const tabName = btn.getAttribute('data-target');
      if (tabName === 'tab-schemes') loadAdminSchemes();
      else if (tabName === 'tab-scholarships') loadAdminScholarships();
      else if (tabName === 'tab-agriculture') loadAdminAgri();
      else if (tabName === 'tab-users') loadAdminUsers();
      else if (tabName === 'tab-overview') loadAdminStats();
    });
  });

  // Load initial overview stats
  loadAdminStats();

  // Setup Form Listeners
  setupFormHandlers();
});

// Load System Overview and Aggregate Statistics
async function loadAdminStats() {
  try {
    const token = getAuthToken();
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      const stats = data.data;
      const elSchemes = document.getElementById('stat-schemes-count');
      const elSchol = document.getElementById('stat-scholarships-count');
      const elAgri = document.getElementById('stat-agri-count');
      const elUsers = document.getElementById('stat-users-count');
      const elDocs = document.getElementById('stat-docs-count');
      const elDbMode = document.getElementById('stat-db-mode');

      if (elSchemes) elSchemes.textContent = stats.totalSchemes;
      if (elSchol) elSchol.textContent = stats.totalScholarships;
      if (elAgri) elAgri.textContent = stats.totalAgri;
      if (elUsers) elUsers.textContent = stats.totalUsers;
      if (elDocs) elDocs.textContent = stats.totalDocs;
      if (elDbMode) elDbMode.textContent = stats.databaseMode;
    }
  } catch (err) {
    console.error('Admin stats error:', err);
  }
}

// ============================================================================
// GOVERNMENT SCHEMES MANAGEMENT (CRUD)
// ============================================================================
async function loadAdminSchemes() {
  const tbody = document.getElementById('admin-schemes-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading schemes...</td></tr>';

  try {
    const res = await fetch('/api/schemes');
    const data = await res.json();
    if (data.success) {
      if (data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No schemes in database. Click Add Scheme.</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.map(s => `
        <tr>
          <td>
            <strong>${escapeHtml(s.name)}</strong>
            <div style="font-size: 0.8rem; color: var(--text-light);">${escapeHtml(s.department)}</div>
          </td>
          <td><span class="badge badge-green">${escapeHtml(s.category)}</span></td>
          <td style="font-size: 0.85rem; max-width: 250px;">${escapeHtml(s.benefits)}</td>
          <td style="font-size: 0.85rem;">${escapeHtml(s.deadline || 'Ongoing')}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button onclick="openEditSchemeModal('${s._id || s.id}')" class="btn btn-outline-primary btn-sm">Edit</button>
              <button onclick="deleteScheme('${s._id || s.id}')" class="btn btn-outline btn-sm" style="color: var(--accent-red);">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--accent-red);">Error loading schemes.</td></tr>';
  }
}

function openAddSchemeModal() {
  editingSchemeId = null;
  document.getElementById('scheme-modal-form-title').textContent = 'Add Government Scheme';
  document.getElementById('admin-scheme-form').reset();
  document.getElementById('admin-scheme-modal').classList.add('active');
}

async function openEditSchemeModal(id) {
  editingSchemeId = id;
  document.getElementById('scheme-modal-form-title').textContent = 'Edit Government Scheme';

  try {
    const res = await fetch(`/api/schemes/${id}`);
    const data = await res.json();
    if (data.success) {
      const s = data.data;
      document.getElementById('scheme-form-name').value = s.name || '';
      document.getElementById('scheme-form-dept').value = s.department || '';
      document.getElementById('scheme-form-cat').value = s.category || 'Agriculture';
      document.getElementById('scheme-form-desc').value = s.description || '';
      document.getElementById('scheme-form-elig').value = s.eligibility || '';
      document.getElementById('scheme-form-bene').value = s.benefits || '';
      document.getElementById('scheme-form-link').value = s.applicationLink || '';
      document.getElementById('scheme-form-dead').value = s.deadline || '';
      document.getElementById('admin-scheme-modal').classList.add('active');
    }
  } catch (err) {
    showToast('Failed to load scheme details.', 'error');
  }
}

function closeAdminSchemeModal() {
  document.getElementById('admin-scheme-modal').classList.remove('active');
}

async function deleteScheme(id) {
  if (!confirm('Are you sure you want to permanently delete this scheme?')) return;
  try {
    const token = getAuthToken();
    const res = await fetch(`/api/schemes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Scheme deleted successfully.', 'success');
      loadAdminSchemes();
      loadAdminStats();
    } else {
      showToast(data.message || 'Failed to delete scheme.', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to server.', 'error');
  }
}

// ============================================================================
// SCHOLARSHIPS MANAGEMENT (CRUD)
// ============================================================================
async function loadAdminScholarships() {
  const tbody = document.getElementById('admin-scholarships-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading scholarships...</td></tr>';

  try {
    const res = await fetch('/api/scholarships');
    const data = await res.json();
    if (data.success) {
      if (data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No scholarships registered yet.</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.map(s => `
        <tr>
          <td>
            <strong>${escapeHtml(s.name)}</strong>
            <div style="font-size: 0.8rem; color: var(--text-light);">${escapeHtml(s.provider)}</div>
          </td>
          <td><span class="badge badge-blue">${escapeHtml(s.category)}</span></td>
          <td style="font-weight: 700; color: var(--secondary);">${escapeHtml(s.amount)}</td>
          <td style="font-size: 0.85rem; color: var(--accent-red); font-weight: 600;">${escapeHtml(s.deadline)}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button onclick="openEditScholarshipModal('${s._id || s.id}')" class="btn btn-outline-primary btn-sm">Edit</button>
              <button onclick="deleteScholarship('${s._id || s.id}')" class="btn btn-outline btn-sm" style="color: var(--accent-red);">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--accent-red);">Failed to load scholarships.</td></tr>';
  }
}

function openAddScholarshipModal() {
  editingScholarshipId = null;
  document.getElementById('scholarship-modal-form-title').textContent = 'Add Scholarship';
  document.getElementById('admin-scholarship-form').reset();
  document.getElementById('admin-scholarship-modal').classList.add('active');
}

async function openEditScholarshipModal(id) {
  editingScholarshipId = id;
  document.getElementById('scholarship-modal-form-title').textContent = 'Edit Scholarship';

  try {
    const res = await fetch(`/api/scholarships/${id}`);
    const data = await res.json();
    if (data.success) {
      const s = data.data;
      document.getElementById('schol-form-name').value = s.name || '';
      document.getElementById('schol-form-provider').value = s.provider || '';
      document.getElementById('schol-form-cat').value = s.category || 'Post-Matric';
      document.getElementById('schol-form-amount').value = s.amount || '';
      document.getElementById('schol-form-elig').value = s.eligibility || '';
      document.getElementById('schol-form-dead').value = s.deadline || '';
      document.getElementById('schol-form-link').value = s.applicationLink || '';
      document.getElementById('schol-form-desc').value = s.description || '';
      document.getElementById('admin-scholarship-modal').classList.add('active');
    }
  } catch (err) {
    showToast('Failed to load scholarship details.', 'error');
  }
}

function closeAdminScholarshipModal() {
  document.getElementById('admin-scholarship-modal').classList.remove('active');
}

async function deleteScholarship(id) {
  if (!confirm('Are you sure you want to delete this scholarship?')) return;
  try {
    const token = getAuthToken();
    const res = await fetch(`/api/scholarships/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Scholarship deleted successfully.', 'success');
      loadAdminScholarships();
      loadAdminStats();
    } else {
      showToast(data.message || 'Failed to delete scholarship.', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to server.', 'error');
  }
}

// ============================================================================
// AGRICULTURE ARTICLES MANAGEMENT (CRUD)
// ============================================================================
async function loadAdminAgri() {
  const tbody = document.getElementById('admin-agri-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading farming articles...</td></tr>';

  try {
    const res = await fetch('/api/agriculture');
    const data = await res.json();
    if (data.success) {
      if (data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No agriculture articles found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.map(a => `
        <tr>
          <td><strong>${escapeHtml(a.title)}</strong></td>
          <td><span class="badge badge-green">${escapeHtml(a.category)}</span></td>
          <td>${escapeHtml(a.cropType || 'General')}</td>
          <td>${escapeHtml(a.season || 'All')}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button onclick="openEditAgriModal('${a._id || a.id}')" class="btn btn-outline-primary btn-sm">Edit</button>
              <button onclick="deleteAgriArticle('${a._id || a.id}')" class="btn btn-outline btn-sm" style="color: var(--accent-red);">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--accent-red);">Failed to load articles.</td></tr>';
  }
}

function openAddAgriModal() {
  editingArticleId = null;
  document.getElementById('agri-modal-form-title').textContent = 'Add Agriculture Guide';
  document.getElementById('admin-agri-form').reset();
  document.getElementById('admin-agri-modal').classList.add('active');
}

async function openEditAgriModal(id) {
  editingArticleId = id;
  document.getElementById('agri-modal-form-title').textContent = 'Edit Agriculture Guide';

  try {
    const res = await fetch(`/api/agriculture/${id}`);
    const data = await res.json();
    if (data.success) {
      const a = data.data;
      document.getElementById('agri-form-title').value = a.title || '';
      document.getElementById('agri-form-cat').value = a.category || 'Crop Management';
      document.getElementById('agri-form-crop').value = a.cropType || '';
      document.getElementById('agri-form-season').value = a.season || '';
      document.getElementById('agri-form-summary').value = a.summary || '';
      document.getElementById('agri-form-content').value = a.content || '';
      document.getElementById('agri-form-tips').value = Array.isArray(a.tips) ? a.tips.join('\n') : (a.tips || '');
      document.getElementById('admin-agri-modal').classList.add('active');
    }
  } catch (err) {
    showToast('Failed to load article.', 'error');
  }
}

function closeAdminAgriModal() {
  document.getElementById('admin-agri-modal').classList.remove('active');
}

async function deleteAgriArticle(id) {
  if (!confirm('Are you sure you want to delete this farming article?')) return;
  try {
    const token = getAuthToken();
    const res = await fetch(`/api/agriculture/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Article deleted successfully.', 'success');
      loadAdminAgri();
      loadAdminStats();
    } else {
      showToast(data.message || 'Failed to delete article.', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to server.', 'error');
  }
}

// ============================================================================
// USER REGISTRY MANAGEMENT
// ============================================================================
async function loadAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading registered citizens...</td></tr>';

  try {
    const token = getAuthToken();
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      tbody.innerHTML = data.data.map(u => `
        <tr>
          <td><strong>${escapeHtml(u.name)}</strong></td>
          <td>${escapeHtml(u.email)}</td>
          <td>${escapeHtml(u.phone || 'N/A')}</td>
          <td>${escapeHtml(u.district || 'Rural')}</td>
          <td>
            <span class="badge ${u.role === 'admin' ? 'badge-purple' : 'badge-green'}">
              ${u.role}
            </span>
          </td>
          <td>
            ${u.role !== 'admin' ? `
              <button onclick="deleteUser('${u.id}')" class="btn btn-outline btn-sm" style="color: var(--accent-red);">
                Remove
              </button>
            ` : '<span style="font-size: 0.75rem; color: var(--text-light);">Admin</span>'}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--accent-red);">Failed to load user accounts.</td></tr>';
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    const token = getAuthToken();
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('User removed.', 'success');
      loadAdminUsers();
      loadAdminStats();
    } else {
      showToast(data.message || 'Failed to delete user.', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to server.', 'error');
  }
}

// ============================================================================
// FORM SUBMISSION EVENT HANDLERS
// ============================================================================
function setupFormHandlers() {
  // Scheme Form
  const schemeForm = document.getElementById('admin-scheme-form');
  if (schemeForm) {
    schemeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('scheme-form-name').value.trim(),
        department: document.getElementById('scheme-form-dept').value.trim(),
        category: document.getElementById('scheme-form-cat').value,
        description: document.getElementById('scheme-form-desc').value.trim(),
        eligibility: document.getElementById('scheme-form-elig').value.trim(),
        benefits: document.getElementById('scheme-form-bene').value.trim(),
        applicationLink: document.getElementById('scheme-form-link').value.trim(),
        deadline: document.getElementById('scheme-form-dead').value.trim()
      };

      const token = getAuthToken();
      const url = editingSchemeId ? `/api/schemes/${editingSchemeId}` : '/api/schemes';
      const method = editingSchemeId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast(editingSchemeId ? 'Scheme updated successfully!' : 'Scheme added to database!', 'success');
          closeAdminSchemeModal();
          loadAdminSchemes();
          loadAdminStats();
        } else {
          showToast(data.message || 'Failed to save scheme.', 'error');
        }
      } catch (err) {
        showToast('Server communication failed.', 'error');
      }
    });
  }

  // Scholarship Form
  const scholForm = document.getElementById('admin-scholarship-form');
  if (scholForm) {
    scholForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('schol-form-name').value.trim(),
        provider: document.getElementById('schol-form-provider').value.trim(),
        category: document.getElementById('schol-form-cat').value,
        amount: document.getElementById('schol-form-amount').value.trim(),
        eligibility: document.getElementById('schol-form-elig').value.trim(),
        deadline: document.getElementById('schol-form-dead').value.trim(),
        applicationLink: document.getElementById('schol-form-link').value.trim(),
        description: document.getElementById('schol-form-desc').value.trim()
      };

      const token = getAuthToken();
      const url = editingScholarshipId ? `/api/scholarships/${editingScholarshipId}` : '/api/scholarships';
      const method = editingScholarshipId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast(editingScholarshipId ? 'Scholarship updated!' : 'Scholarship added to database!', 'success');
          closeAdminScholarshipModal();
          loadAdminScholarships();
          loadAdminStats();
        } else {
          showToast(data.message || 'Failed to save scholarship.', 'error');
        }
      } catch (err) {
        showToast('Server communication failed.', 'error');
      }
    });
  }

  // Agriculture Form
  const agriForm = document.getElementById('admin-agri-form');
  if (agriForm) {
    agriForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('agri-form-title').value.trim(),
        category: document.getElementById('agri-form-cat').value,
        cropType: document.getElementById('agri-form-crop').value.trim(),
        season: document.getElementById('agri-form-season').value.trim(),
        summary: document.getElementById('agri-form-summary').value.trim(),
        content: document.getElementById('agri-form-content').value.trim(),
        tips: document.getElementById('agri-form-tips').value.trim()
      };

      const token = getAuthToken();
      const url = editingArticleId ? `/api/agriculture/${editingArticleId}` : '/api/agriculture';
      const method = editingArticleId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast(editingArticleId ? 'Article updated!' : 'Farming guide published!', 'success');
          closeAdminAgriModal();
          loadAdminAgri();
          loadAdminStats();
        } else {
          showToast(data.message || 'Failed to save article.', 'error');
        }
      } catch (err) {
        showToast('Server error while saving.', 'error');
      }
    });
  }

  // Broadcast Notification Form
  const notifForm = document.getElementById('admin-broadcast-form');
  if (notifForm) {
    notifForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('broadcast-title').value.trim();
      const category = document.getElementById('broadcast-category').value;
      const priority = document.getElementById('broadcast-priority').value;
      const message = document.getElementById('broadcast-message').value.trim();

      if (!title || !message) {
        showToast('Please provide a title and announcement message.', 'error');
        return;
      }

      const token = getAuthToken();
      try {
        const res = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, category, priority, message })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast('Announcement broadcasted to all citizens!', 'success');
          notifForm.reset();
          loadAdminStats();
        } else {
          showToast(data.message || 'Failed to broadcast.', 'error');
        }
      } catch (err) {
        showToast('Failed to connect to server.', 'error');
      }
    });
  }
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
