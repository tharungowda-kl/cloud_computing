/**
 * GraminSeva - Document Management Script with Amazon S3 & Local Storage Support
 */

let selectedFile = null;

document.addEventListener('DOMContentLoaded', () => {
  requireAuthPage();

  const dropzone = document.getElementById('document-dropzone');
  const fileInput = document.getElementById('document-file-input');
  const uploadForm = document.getElementById('document-upload-form');

  // Load storage provider status and documents list
  fetchStorageStatus();
  fetchDocuments();

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideUploadError();

      if (!selectedFile) {
        showToast('Please select a file to upload.', 'error');
        return;
      }

      const category = document.getElementById('doc-category-select').value;
      const submitBtn = document.getElementById('upload-submit-btn');

      const formData = new FormData();
      formData.append('documentFile', selectedFile);
      formData.append('category', category);

      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading Document...';

      try {
        const token = getAuthToken();
        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const providerText = data.storageProvider === 's3' ? 'Amazon S3 cloud bucket' : 'local server storage';
          showToast(`Document uploaded successfully to ${providerText}!`, 'success');
          
          // Reset file input & preview
          selectedFile = null;
          fileInput.value = '';
          const previewPill = document.getElementById('file-preview-pill');
          if (previewPill) previewPill.style.display = 'none';

          fetchDocuments();
          fetchStorageStatus();
        } else {
          showUploadError(data.message || 'Upload failed.');
          showToast(data.message || 'Upload failed.', 'error');
        }
      } catch (err) {
        console.error('Upload error:', err);
        showUploadError('Network communication failure. Please ensure the server is running.');
        showToast('Server error during document upload.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Document';
      }
    });
  }
});

/**
 * Fetch and display active storage provider status
 */
async function fetchStorageStatus() {
  try {
    const res = await fetch('/api/documents/storage-status');
    const json = await res.json();

    if (json.success && json.data) {
      const status = json.data;
      const titleEl = document.getElementById('storage-mode-title');
      const detailsEl = document.getElementById('storage-mode-details');
      const badgeEl = document.getElementById('storage-mode-badge');
      const iconEl = document.getElementById('storage-mode-icon');
      const tableNote = document.getElementById('table-storage-note');

      if (status.provider === 's3') {
        if (titleEl) titleEl.innerHTML = `Active Storage: <strong>Amazon S3 Cloud Object Storage</strong>`;
        if (detailsEl) detailsEl.textContent = `Bucket: ${status.bucketName} | Region: ${status.region} (Private Bucket, Presigned URLs enabled)`;
        if (badgeEl) {
          badgeEl.className = 'badge badge-blue';
          badgeEl.textContent = '☁️ Amazon S3 Active';
        }
        if (iconEl) {
          iconEl.textContent = '☁️';
          iconEl.style.backgroundColor = 'var(--secondary-light)';
          iconEl.style.color = 'var(--secondary-dark)';
        }
        if (tableNote) {
          tableNote.innerHTML = `☁️ Active Storage: <strong>Amazon S3 (${status.bucketName})</strong>`;
        }
      } else {
        if (titleEl) titleEl.innerHTML = `Active Storage: <strong>Local Server Storage</strong>`;
        if (detailsEl) detailsEl.textContent = `Folder: /uploads | AWS S3 not configured or set to local. Ready for S3 configuration.`;
        if (badgeEl) {
          badgeEl.className = 'badge badge-green';
          badgeEl.textContent = '📁 Local Storage Active';
        }
        if (iconEl) {
          iconEl.textContent = '📁';
          iconEl.style.backgroundColor = 'var(--primary-light)';
          iconEl.style.color = 'var(--primary-dark)';
        }
        if (tableNote) {
          tableNote.innerHTML = `📁 Active Storage: <strong>Local Server (/uploads)</strong>`;
        }
      }
    }
  } catch (err) {
    console.error('Failed to retrieve storage status:', err);
  }
}

function handleFileSelection(file) {
  hideUploadError();
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
  const ext = file.name.split('.').pop().toLowerCase();

  // Validate type
  if (!allowedExtensions.includes(ext)) {
    showUploadError(`Invalid file format (.${ext}). Only PDF, JPG, JPEG, and PNG files are accepted.`);
    showToast(`Invalid file type (.${ext}). Allowed: PDF, JPG, JPEG, PNG.`, 'error');
    return;
  }

  // Validate size (max 5 MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showUploadError(`File too large (${formatFileSize(file.size)}). The maximum permitted upload size is 5 MB.`);
    showToast(`File too large (${formatFileSize(file.size)}). Max allowed is 5 MB.`, 'error');
    return;
  }

  selectedFile = file;

  const previewPill = document.getElementById('file-preview-pill');
  const previewName = document.getElementById('file-preview-name');
  const previewSize = document.getElementById('file-preview-size');

  if (previewPill && previewName && previewSize) {
    previewName.textContent = file.name;
    previewSize.textContent = `(${formatFileSize(file.size)})`;
    previewPill.style.display = 'inline-flex';
  }
}

async function fetchDocuments() {
  const tableBody = document.getElementById('documents-table-body');
  const emptyState = document.getElementById('documents-empty-state');
  if (!tableBody) return;

  try {
    const token = getAuthToken();
    const res = await fetch('/api/documents', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      if (data.data.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
      } else {
        if (emptyState) emptyState.style.display = 'none';
        tableBody.innerHTML = data.data.map(doc => {
          const isS3 = doc.storageProvider === 's3';
          const storageBadge = isS3
            ? '<span class="badge badge-blue">☁️ Amazon S3</span>'
            : '<span class="badge badge-green">📁 Local</span>';

          const pathLabel = isS3
            ? `<div style="font-size: 0.75rem; color: var(--secondary-dark); font-family: monospace;">Key: ${escapeHtml(doc.s3Key || doc.fileName)}</div>`
            : `<div style="font-size: 0.75rem; color: var(--text-light); font-family: monospace;">Path: ${escapeHtml(doc.filePath || '/uploads/' + doc.fileName)}</div>`;

          return `
            <tr>
              <td>
                <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(doc.originalName)}</div>
                ${pathLabel}
              </td>
              <td>
                <span class="badge badge-green">${escapeHtml(doc.category)}</span>
              </td>
              <td>
                ${storageBadge}
              </td>
              <td>
                <span class="badge badge-blue">${escapeHtml(doc.fileType)}</span>
              </td>
              <td>${formatFileSize(doc.fileSize)}</td>
              <td style="font-size: 0.85rem; color: var(--text-muted);">
                ${new Date(doc.uploadDate).toLocaleDateString()}
              </td>
              <td>
                <div style="display: flex; gap: 8px;">
                  <button onclick="downloadDocument('${doc._id || doc.id}', '${escapeHtml(doc.originalName)}', '${doc.storageProvider}')" class="btn btn-outline-primary btn-sm" title="Download or view document">
                    📥 Download
                  </button>
                  <button onclick="deleteDocument('${doc._id || doc.id}')" class="btn btn-outline btn-sm" style="color: var(--accent-red);" title="Delete document">
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Fetch documents error:', err);
  }
}

/**
 * Handle authenticated document download
 * Supports both Amazon S3 Presigned URLs and Local file streams
 */
async function downloadDocument(id, originalName, storageProvider) {
  try {
    const token = getAuthToken();
    const res = await fetch(`/api/documents/${id}/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Check if JSON response (e.g. Presigned URL from S3)
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.downloadUrl) {
        showToast('Presigned S3 download URL generated (Valid for 15 minutes).', 'info');
        // Open presigned URL in new tab to trigger direct download from Amazon S3
        window.open(data.downloadUrl, '_blank');
        return;
      } else {
        showToast(data.message || 'Failed to download document.', 'error');
        return;
      }
    }

    // Direct binary stream from local server
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName || 'downloaded_document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      showToast('Document downloaded successfully.', 'success');
    } else {
      showToast('Failed to download file from server.', 'error');
    }
  } catch (err) {
    console.error('Download error:', err);
    showToast('Network error while downloading document.', 'error');
  }
}

async function deleteDocument(id) {
  if (!confirm('Are you sure you want to permanently delete this document?')) return;

  try {
    const token = getAuthToken();
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message || 'Document removed successfully.', 'success');
      fetchDocuments();
    } else {
      showToast(data.message || 'Failed to delete document.', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to server.', 'error');
  }
}

function showUploadError(msg) {
  const alertBox = document.getElementById('upload-error-alert');
  const alertText = document.getElementById('upload-error-text');
  if (alertBox && alertText) {
    alertText.textContent = msg;
    alertBox.style.display = 'block';
  }
}

function hideUploadError() {
  const alertBox = document.getElementById('upload-error-alert');
  if (alertBox) alertBox.style.display = 'none';
}

function formatFileSize(bytes) {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
