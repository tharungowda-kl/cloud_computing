/**
 * GraminSeva - Government Schemes Page Script
 */

let allSchemes = [];
let activeCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
  fetchSchemes();

  const searchInput = document.getElementById('scheme-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterAndRenderSchemes(e.target.value);
    });
  }

  const categoryPills = document.querySelectorAll('.category-filter-btn');
  categoryPills.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'All';
      filterAndRenderSchemes(searchInput ? searchInput.value : '');
    });
  });
});

async function fetchSchemes() {
  const container = document.getElementById('schemes-container');
  if (container) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">Loading government schemes...</div>';
  }

  try {
    const res = await fetch('/api/schemes');
    const data = await res.json();
    if (data.success) {
      allSchemes = data.data;
      filterAndRenderSchemes();
    } else {
      if (container) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--accent-red);">Failed to load schemes.</div>';
    }
  } catch (err) {
    console.error('Error fetching schemes:', err);
    if (container) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--accent-red);">Server unavailable. Ensure node server.js is running.</div>';
  }
}

function filterAndRenderSchemes(query = '') {
  const container = document.getElementById('schemes-container');
  if (!container) return;

  const q = query.toLowerCase().trim();
  let filtered = allSchemes;

  if (activeCategory !== 'All') {
    filtered = filtered.filter(s => s.category && s.category.toLowerCase() === activeCategory.toLowerCase());
  }

  if (q) {
    filtered = filtered.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      (s.benefits && s.benefits.toLowerCase().includes(q))
    );
  }

  const countBadge = document.getElementById('scheme-count-badge');
  if (countBadge) {
    countBadge.textContent = `${filtered.length} Scheme${filtered.length === 1 ? '' : 's'} Available`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px dashed var(--border-color);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-light); margin-bottom: 12px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 6px;">No Government Schemes Found</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try adjusting your search keywords or clear the category filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(scheme => {
    let badgeClass = 'badge-green';
    if (scheme.category === 'Healthcare') badgeClass = 'badge-red';
    else if (scheme.category === 'Housing') badgeClass = 'badge-blue';
    else if (scheme.category === 'Employment') badgeClass = 'badge-purple';
    else if (scheme.category === 'Financial Support') badgeClass = 'badge-amber';

    return `
      <div class="item-card">
        <div class="item-card-header">
          <span class="badge ${badgeClass}">${scheme.category || 'General'}</span>
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-light);">
            ${scheme.deadline || 'Ongoing'}
          </span>
        </div>
        <h3 class="item-title">${escapeHtml(scheme.name)}</h3>
        <p class="item-subtext">${escapeHtml(scheme.department)}</p>
        <p class="item-desc">${escapeHtml(scheme.description)}</p>
        
        <div class="item-highlight-box">
          <div style="margin-bottom: 6px;">
            <strong>Benefit:</strong> <span style="color: var(--primary); font-weight: 700;">${escapeHtml(scheme.benefits)}</span>
          </div>
          <div>
            <strong>Eligibility:</strong> ${escapeHtml(scheme.eligibility)}
          </div>
        </div>

        <div class="item-card-footer">
          <button onclick="openSchemeModal('${scheme._id || scheme.id}')" class="btn btn-outline-primary btn-sm">
            View Details
          </button>
          <a href="${scheme.applicationLink || 'https://services.india.gov.in'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            Apply Online ↗
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function openSchemeModal(id) {
  const scheme = allSchemes.find(s => (s._id || s.id) === id);
  if (!scheme) return;

  const modal = document.getElementById('scheme-modal');
  const modalBody = document.getElementById('scheme-modal-body');
  if (!modal || !modalBody) return;

  const docs = Array.isArray(scheme.documentsRequired) 
    ? scheme.documentsRequired 
    : (typeof scheme.documentsRequired === 'string' ? scheme.documentsRequired.split(',') : ['Aadhaar Card', 'Bank Passbook']);

  modalBody.innerHTML = `
    <div style="margin-bottom: 16px;">
      <span class="badge badge-green" style="margin-bottom: 8px;">${escapeHtml(scheme.category)}</span>
      <h2 style="font-size: 1.4rem; color: var(--text-main); font-weight: 800; margin-bottom: 4px;">${escapeHtml(scheme.name)}</h2>
      <p style="color: var(--text-light); font-size: 0.9rem; font-weight: 600;">${escapeHtml(scheme.department)}</p>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Description:</h4>
      <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6;">${escapeHtml(scheme.description)}</p>
    </div>

    <div style="background-color: var(--primary-50); border: 1px solid var(--primary-light); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 4px;">Financial & Welfare Benefits:</h4>
      <p style="font-size: 0.95rem; color: var(--primary-dark); font-weight: 600;">${escapeHtml(scheme.benefits)}</p>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Eligibility Criteria:</h4>
      <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5;">${escapeHtml(scheme.eligibility)}</p>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Required Verification Documents:</h4>
      <ul style="padding-left: 20px; font-size: 0.9rem; color: var(--text-muted); display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        ${docs.map(d => `<li>${escapeHtml(d.trim())}</li>`).join('')}
      </ul>
    </div>

    <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--border-color);">
      <button onclick="closeSchemeModal()" class="btn btn-outline btn-sm">Close</button>
      <a href="${scheme.applicationLink || 'https://services.india.gov.in'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        Go to Official Application Portal ↗
      </a>
    </div>
  `;

  modal.classList.add('active');
}

function closeSchemeModal() {
  const modal = document.getElementById('scheme-modal');
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
