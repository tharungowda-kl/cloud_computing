/**
 * GraminSeva - Student Scholarships Page Script
 */

let allScholarships = [];
let activeCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
  fetchScholarships();

  const searchInput = document.getElementById('scholarship-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterAndRenderScholarships(e.target.value);
    });
  }

  const categoryPills = document.querySelectorAll('.scholarship-filter-btn');
  categoryPills.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'All';
      filterAndRenderScholarships(searchInput ? searchInput.value : '');
    });
  });
});

async function fetchScholarships() {
  const container = document.getElementById('scholarships-container');
  if (container) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">Loading scholarships...</div>';
  }

  try {
    const res = await fetch('/api/scholarships');
    const data = await res.json();
    if (data.success) {
      allScholarships = data.data;
      filterAndRenderScholarships();
    } else {
      if (container) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--accent-red);">Failed to load scholarships.</div>';
    }
  } catch (err) {
    console.error('Error fetching scholarships:', err);
    if (container) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--accent-red);">Server offline. Ensure backend is running.</div>';
  }
}

function filterAndRenderScholarships(query = '') {
  const container = document.getElementById('scholarships-container');
  if (!container) return;

  const q = query.toLowerCase().trim();
  let filtered = allScholarships;

  if (activeCategory !== 'All') {
    filtered = filtered.filter(s => s.category && s.category.toLowerCase() === activeCategory.toLowerCase());
  }

  if (q) {
    filtered = filtered.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.provider && s.provider.toLowerCase().includes(q)) ||
      (s.eligibility && s.eligibility.toLowerCase().includes(q)) ||
      (s.amount && s.amount.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  }

  const countBadge = document.getElementById('scholarship-count-badge');
  if (countBadge) {
    countBadge.textContent = `${filtered.length} Scholarship${filtered.length === 1 ? '' : 's'} Listed`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px dashed var(--border-color);">
        <h3 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 6px;">No Scholarships Found</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try another keyword or click 'All Categories'.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(sch => {
    let badgeClass = 'badge-blue';
    if (sch.category === 'Girls Education') badgeClass = 'badge-purple';
    else if (sch.category === 'Merit-Based') badgeClass = 'badge-amber';
    else if (sch.category === 'Pre-Matric') badgeClass = 'badge-green';

    return `
      <div class="item-card">
        <div class="item-card-header">
          <span class="badge ${badgeClass}">${sch.category || 'Scholarship'}</span>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-red);">
            ⏱ Deadline: ${escapeHtml(sch.deadline)}
          </span>
        </div>
        <h3 class="item-title">${escapeHtml(sch.name)}</h3>
        <p class="item-subtext">${escapeHtml(sch.provider)}</p>
        <p class="item-desc">${escapeHtml(sch.description || 'Government backed scholarship aid for underprivileged rural students.')}</p>
        
        <div class="item-highlight-box">
          <div style="margin-bottom: 6px;">
            <strong>Grant Amount:</strong> <span style="color: var(--secondary); font-weight: 700;">${escapeHtml(sch.amount)}</span>
          </div>
          <div>
            <strong>Eligibility:</strong> ${escapeHtml(sch.eligibility)}
          </div>
        </div>

        <div class="item-card-footer">
          <button onclick="openScholarshipModal('${sch._id || sch.id}')" class="btn btn-outline-primary btn-sm">
            Criteria & Guidelines
          </button>
          <a href="${sch.applicationLink || 'https://scholarships.gov.in'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
            NSP Portal ↗
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function openScholarshipModal(id) {
  const sch = allScholarships.find(s => (s._id || s.id) === id);
  if (!sch) return;

  const modal = document.getElementById('scholarship-modal');
  const modalBody = document.getElementById('scholarship-modal-body');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div style="margin-bottom: 16px;">
      <span class="badge badge-blue" style="margin-bottom: 8px;">${escapeHtml(sch.category)}</span>
      <h2 style="font-size: 1.35rem; color: var(--text-main); font-weight: 800; margin-bottom: 4px;">${escapeHtml(sch.name)}</h2>
      <p style="color: var(--text-light); font-size: 0.9rem; font-weight: 600;">Awarded by: ${escapeHtml(sch.provider)}</p>
    </div>

    <div style="background-color: var(--secondary-50); border: 1px solid var(--secondary-light); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--secondary-dark); margin-bottom: 4px;">Scholarship Award / Financial Aid:</h4>
      <p style="font-size: 1.1rem; color: var(--secondary-dark); font-weight: 700;">${escapeHtml(sch.amount)}</p>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Detailed Eligibility Criteria:</h4>
      <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6;">${escapeHtml(sch.eligibility)}</p>
    </div>

    <div style="background-color: var(--accent-amber-light); border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
      <p style="font-size: 0.9rem; color: #92400e; font-weight: 600;">
        ⚠️ Application Submission Deadline: <strong>${escapeHtml(sch.deadline)}</strong>. Ensure caste and income certificates are renewed prior to submission.
      </p>
    </div>

    <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--border-color);">
      <button onclick="closeScholarshipModal()" class="btn btn-outline btn-sm">Close</button>
      <a href="${sch.applicationLink || 'https://scholarships.gov.in'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
        Apply on National Scholarship Portal ↗
      </a>
    </div>
  `;

  modal.classList.add('active');
}

function closeScholarshipModal() {
  const modal = document.getElementById('scholarship-modal');
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
