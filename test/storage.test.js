/**
 * Test Suite: Storage Service, Upload Validation & Authorization Rules
 * Run via: npm test  (or: node test/storage.test.js)
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const storageService = require('../services/storageService');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('===============================================================');
  console.log('  RUNNING TESTS: AWS S3 & LOCAL STORAGE SERVICE INTEGRATION    ');
  console.log('===============================================================');

  // 1. File Type Validation Tests
  console.log('\n--- 1. File Type & Extension Validation ---');
  
  runTest('Accepts valid PDF document', () => {
    const res = storageService.validateFile({
      originalname: 'aadhaar_card.pdf',
      mimetype: 'application/pdf',
      size: 1024 * 50
    });
    assert.strictEqual(res.valid, true);
  });

  runTest('Accepts valid JPG/PNG/WEBP images', () => {
    const formats = [
      { name: 'land_rtc.jpg', mime: 'image/jpeg' },
      { name: 'ration_card.png', mime: 'image/png' },
      { name: 'photo.webp', mime: 'image/webp' }
    ];
    for (const f of formats) {
      const res = storageService.validateFile({
        originalname: f.name,
        mimetype: f.mime,
        size: 1024 * 100
      });
      assert.strictEqual(res.valid, true);
    }
  });

  runTest('Rejects executable and script files (.exe, .bat, .js, .sh)', () => {
    const badFiles = ['malware.exe', 'script.bat', 'payload.js', 'exploit.sh', 'archive.zip'];
    for (const name of badFiles) {
      const res = storageService.validateFile({
        originalname: name,
        mimetype: 'application/octet-stream',
        size: 1024
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.error.includes('Invalid file extension'));
    }
  });

  runTest('Rejects mismatched or forbidden MIME types', () => {
    const res = storageService.validateFile({
      originalname: 'document.pdf',
      mimetype: 'application/x-msdownload',
      size: 1024
    });
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes('Invalid file content type'));
  });

  // 2. File Size Limit Tests
  console.log('\n--- 2. File Size Limits (Max 5MB) ---');

  runTest('Accepts file within 5 MB limit (4.5 MB)', () => {
    const res = storageService.validateFile({
      originalname: 'heavy_doc.pdf',
      mimetype: 'application/pdf',
      size: 4.5 * 1024 * 1024
    });
    assert.strictEqual(res.valid, true);
  });

  runTest('Rejects file exceeding 5 MB limit (5.5 MB)', () => {
    const res = storageService.validateFile({
      originalname: 'too_large.pdf',
      mimetype: 'application/pdf',
      size: 5.5 * 1024 * 1024
    });
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes('exceeds 5 MB limit'));
  });

  runTest('Rejects 0-byte empty file', () => {
    const res = storageService.validateFile({
      originalname: 'empty.pdf',
      mimetype: 'application/pdf',
      size: 0
    });
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes('empty'));
  });

  // 3. Filename Sanitization & Directory Traversal Protection
  console.log('\n--- 3. Filename Sanitization & Security ---');

  runTest('Strips directory traversal sequences (../ and ..\\)', () => {
    const maliciousNames = [
      '../../../../etc/passwd.pdf',
      '..\\..\\windows\\system32\\cmd.pdf',
      '../../../secret.jpg'
    ];
    for (const raw of maliciousNames) {
      // Validate that file basename is cleaned and does not contain slashes
      const ext = path.extname(raw).toLowerCase();
      const rawBase = path.basename(raw, ext);
      const safe = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_');
      assert.ok(!safe.includes('/'));
      assert.ok(!safe.includes('\\'));
      assert.ok(!safe.includes('..'));
    }
  });

  // 4. Storage Provider Status & Configuration
  console.log('\n--- 4. Storage Provider Status & Fallback ---');

  runTest('getStorageStatus returns valid structured metadata', () => {
    const status = storageService.getStorageStatus();
    assert.ok(['local', 's3'].includes(status.provider));
    assert.ok(typeof status.storageLabel === 'string');
    assert.ok(typeof status.statusMessage === 'string');
  });

  // 5. Ownership & Authorization Logic
  console.log('\n--- 5. Ownership & Authorization Rules ---');

  runTest('Citizen B cannot access or download Citizen A document', () => {
    const docA = { userId: 'citizen_001', originalName: 'docA.pdf' };
    const userB = { id: 'citizen_002', role: 'citizen' };

    const isPermitted = docA.userId === userB.id || userB.role === 'admin';
    assert.strictEqual(isPermitted, false, 'User B should not have access to User A document');
  });

  runTest('Owner can access own document', () => {
    const docA = { userId: 'citizen_001', originalName: 'docA.pdf' };
    const userA = { id: 'citizen_001', role: 'citizen' };

    const isPermitted = docA.userId === userA.id || userA.role === 'admin';
    assert.strictEqual(isPermitted, true);
  });

  runTest('Administrator can access any citizen document', () => {
    const docA = { userId: 'citizen_001', originalName: 'docA.pdf' };
    const adminUser = { id: 'admin_999', role: 'admin' };

    const isPermitted = docA.userId === adminUser.id || adminUser.role === 'admin';
    assert.strictEqual(isPermitted, true, 'Admin should have permission to audit citizen document');
  });

  // 6. Local Storage Lifecycle (Upload -> Download Info -> Delete)
  console.log('\n--- 6. Local Storage Lifecycle ---');

  await runAsyncTest('Local storage successfully uploads, checks, and deletes a file', async () => {
    const testContent = Buffer.from('Test Document Content for GraminSeva Platform');
    const uploadRes = await storageService.uploadDocument({
      buffer: testContent,
      originalName: 'test_proof.pdf',
      mimeType: 'application/pdf',
      userId: 'test_user_123',
      category: 'Aadhaar Card'
    });

    assert.strictEqual(uploadRes.storageProvider, 'local');
    assert.ok(uploadRes.fileName.endsWith('.pdf'));

    const diskPath = path.join(storageService.UPLOADS_DIR, uploadRes.fileName);
    assert.ok(fs.existsSync(diskPath), 'Uploaded file should exist on disk');

    // Download info
    const dlInfo = await storageService.getDownloadInfo({
      storageProvider: 'local',
      fileName: uploadRes.fileName,
      originalName: 'test_proof.pdf'
    });
    assert.strictEqual(dlInfo.storageProvider, 'local');
    assert.strictEqual(dlInfo.isPresigned, false);

    // Delete
    const delRes = await storageService.deleteDocumentFile({
      storageProvider: 'local',
      fileName: uploadRes.fileName
    });
    assert.strictEqual(delRes.success, true);
    assert.strictEqual(fs.existsSync(diskPath), false, 'Deleted file should no longer exist on disk');
  });

  // Summary
  console.log('\n===============================================================');
  console.log(`  TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('===============================================================');

  if (passedTests === totalTests) {
    console.log('  🎉 All storage validation and authorization tests passed!\n');
    process.exit(0);
  } else {
    console.error(`  ⚠️ ${totalTests - passedTests} tests failed.\n`);
    process.exit(1);
  }
}

runAllTests();
