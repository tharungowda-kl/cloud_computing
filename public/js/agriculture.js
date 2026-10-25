/**
 * GraminSeva - Agriculture Advisory & Farming Guide Script
 */

let allAgriArticles = [];
let activeAgriCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
  fetchAgriArticles();

  const searchInput = document.getElementById('agri-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterAndRenderAgri(e.target.value);
    });
  }

  const categoryPills = document.querySelectorAll('.agri-filter-btn');
  categoryPills.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeAgriCategory = btn.getAttribute('data-category') || 'All';
      filterAndRenderAgri(searchInput ? searchInput.value : '');
    });
  });
});

async function fetchAgriArticles() {
  const container = document.getElementById('agri-container');
  if (container) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">Loading agricultural advisories...</div>';
  }

  try {
    const res = await fetch('/api/agriculture');
    const data = await res.json();
    if (data.success) {
      allAgriArticles = data.data;
      filterAndRenderAgri();
    } else {
      if (container) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--accent-red);">Failed to load articles.</div>';
    }
  } catch (err) {
    console.error('Error fetching agri articles:', err);
    if (container) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--accent-red);">Server offline. Ensure backend is running.</div>';
  }
}

function filterAndRenderAgri(query = '') {
  const container = document.getElementById('agri-container');
  if (!container) return;

  const q = query.toLowerCase().trim();
  let filtered = allAgriArticles;

  if (activeAgriCategory !== 'All') {
    filtered = filtered.filter(a => a.category && a.category.toLowerCase() === activeAgriCategory.toLowerCase());
  }

  if (q) {
    filtered = filtered.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.summary && a.summary.toLowerCase().includes(q)) ||
      (a.content && a.content.toLowerCase().includes(q)) ||
      (a.cropType && a.cropType.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px dashed var(--border-color);">
        <h3 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 6px;">No Farming Articles Found</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try another search term or click 'All Topics'.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(art => {
    let badgeClass = 'badge-green';
    if (art.category === 'Irrigation Methods') badgeClass = 'badge-blue';
    else if (art.category === 'Pest & Disease Control') badgeClass = 'badge-red';
    else if (art.category === 'Soil Health & Fertilizer') badgeClass = 'badge-amber';
    else if (art.category === 'Modern Tools & Subsidies') badgeClass = 'badge-purple';

    const tipsCount = Array.isArray(art.tips) ? art.tips.length : 0;

    return `
      <div class="item-card">
        <div class="item-card-header">
          <span class="badge ${badgeClass}">${art.category}</span>
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-light);">
            🌱 ${art.cropType || 'General'}
          </span>
        </div>
        <h3 class="item-title">${escapeHtml(art.title)}</h3>
        <p class="item-subtext">Season: ${escapeHtml(art.season || 'All Year')}</p>
        <p class="item-desc">${escapeHtml(art.summary)}</p>

        <div style="background-color: var(--primary-50); border: 1px solid var(--primary-light); border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; font-size: 0.85rem; color: var(--primary-dark); font-weight: 600; display: flex; align-items: center; justify-content: space-between;">
          <span>💡 Practical Field Action Tips</span>
          <span>${tipsCount} Steps</span>
        </div>

        <div class="item-card-footer">
          <button onclick="openAgriModal('${art._id || art.id}')" class="btn btn-primary btn-sm" style="width: 100%;">
            Read Complete Practical Guide 📖
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openAgriModal(id) {
  const art = allAgriArticles.find(a => (a._id || a.id) === id);
  if (!art) return;

  const modal = document.getElementById('agri-modal');
  const modalBody = document.getElementById('agri-modal-body');
  if (!modal || !modalBody) return;

  const tipsList = Array.isArray(art.tips) ? art.tips : [];

  modalBody.innerHTML = `
    <div style="margin-bottom: 18px;">
      <span class="badge badge-green" style="margin-bottom: 8px;">${escapeHtml(art.category)}</span>
      <h2 style="font-size: 1.4rem; color: var(--text-main); font-weight: 800; margin-bottom: 6px;">${escapeHtml(art.title)}</h2>
      <div style="display: flex; gap: 14px; font-size: 0.85rem; color: var(--text-light); font-weight: 600;">
        <span>🌾 Crops: ${escapeHtml(art.cropType || 'All')}</span>
        <span>☀️ Season: ${escapeHtml(art.season || 'All Seasons')}</span>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Comprehensive Guide:</h4>
      <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.7; white-space: pre-line;">${escapeHtml(art.content)}</p>
    </div>

    ${tipsList.length > 0 ? `
      <div style="background-color: var(--primary-50); border: 1.5px solid var(--primary-light); border-radius: 10px; padding: 18px; margin-bottom: 20px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          Recommended Best Practices for High Yield:
        </h4>
        <ul style="padding-left: 20px; font-size: 0.9rem; color: var(--text-main); line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
          ${tipsList.map(tip => `<li>${escapeHtml(tip)}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div style="display: flex; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--border-color);">
      <button onclick="closeAgriModal()" class="btn btn-primary btn-sm">Close Article</button>
    </div>
  `;

  modal.classList.add('active');
}

function closeAgriModal() {
  const modal = document.getElementById('agri-modal');
  if (modal) modal.classList.remove('active');
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
