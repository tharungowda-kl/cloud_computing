/**
 * GraminSeva - Authentication Handlers (Login & Register)
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Handle Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying credentials...';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setAuthSession(data.token, data.user);
          showToast(`Welcome back, ${data.user.name}!`, 'success');
          setTimeout(() => {
            if (data.user.role === 'admin') {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'dashboard.html';
            }
          }, 800);
        } else {
          showToast(data.message || 'Login failed. Please check credentials.', 'error');
        }
      } catch (err) {
        showToast('Server connection failed. Please ensure backend is running.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  // Handle Registration Form Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      const phone = document.getElementById('reg-phone').value.trim();
      const district = document.getElementById('reg-district').value.trim();
      const role = document.getElementById('reg-role') ? document.getElementById('reg-role').value : 'citizen';
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (!name || !email || !password) {
        showToast('Please fill in all mandatory fields.', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match. Please re-enter.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, district, role })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setAuthSession(data.token, data.user);
          showToast('Account registered successfully! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        } else {
          showToast(data.message || 'Registration failed.', 'error');
        }
      } catch (err) {
        showToast('Server communication error. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Free Account';
      }
    });
  }
});

// Quick 1-Click Demo Login Functions (For Evaluator Convenience)
function fillDemoLogin(role) {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  if (role === 'citizen') {
    if (emailInput) emailInput.value = 'citizen@rural.gov';
    if (passwordInput) passwordInput.value = 'citizen123';
    showToast('Loaded Demo Citizen credentials. Click Sign In or submit.', 'info');
  } else if (role === 'admin') {
    if (emailInput) emailInput.value = 'admin@rural.gov';
    if (passwordInput) passwordInput.value = 'admin123';
    showToast('Loaded Demo Admin credentials. Click Sign In or submit.', 'info');
  }
}
