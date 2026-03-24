// Authentication JavaScript
let users = JSON.parse(localStorage.getItem('voiceAI_users') || '[]');

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) strength++;
    else feedback.push('Lowercase letter');

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('Uppercase letter');

    if (/[0-9]/.test(password)) strength++;
    else feedback.push('Number');

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('Special character');

    return { strength, feedback };
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (!strengthFill || !strengthText) return;

    const { strength } = checkPasswordStrength(password);

    strengthFill.className = 'strength-fill';

    if (password.length === 0) {
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Password strength';
        return;
    }

    const percentage = (strength / 5) * 100;
    strengthFill.style.width = percentage + '%';

    if (strength <= 2) {
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength <= 3) {
        strengthFill.classList.add('medium');
        strengthText.textContent = 'Medium password';
    } else {
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
}

// Show message
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Toggle password visibility
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const isVisible = input.type === 'text';

    input.type = isVisible ? 'password' : 'text';
    button.textContent = isVisible ? '👁️' : '🙈';
}

// Login form handler
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const togglePassword = document.getElementById('togglePassword');

    togglePassword.addEventListener('click', () => {
        togglePasswordVisibility('password', togglePassword);
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Show loading
        loginBtn.disabled = true;
        loginBtn.querySelector('.btn-text').textContent = 'Signing in...';
        loginBtn.querySelector('.btn-loader').style.display = 'block';

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check credentials
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Store session
                localStorage.setItem('voiceAI_currentUser', JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email
                }));

                if (rememberMe) {
                    localStorage.setItem('voiceAI_rememberMe', 'true');
                }

                showMessage('Login successful! Redirecting...', 'success');

                // Redirect to main app
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage('Invalid email or password', 'error');
            }
        } catch (error) {
            showMessage('Login failed. Please try again.', 'error');
        } finally {
            // Hide loading
            loginBtn.disabled = false;
            loginBtn.querySelector('.btn-text').textContent = 'Sign In';
            loginBtn.querySelector('.btn-loader').style.display = 'none';
        }
    });
}

// Register form handler
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    togglePassword.addEventListener('click', () => {
        togglePasswordVisibility('password', togglePassword);
    });

    passwordInput.addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value);
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        const { strength } = checkPasswordStrength(password);
        if (strength < 3) {
            showMessage('Password is too weak. Please choose a stronger password.', 'error');
            return;
        }

        // Check if user already exists
        if (users.some(u => u.email === email)) {
            showMessage('Email already registered', 'error');
            return;
        }

        // Show loading
        registerBtn.disabled = true;
        registerBtn.querySelector('.btn-text').textContent = 'Creating account...';
        registerBtn.querySelector('.btn-loader').style.display = 'block';

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name: fullName,
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('voiceAI_users', JSON.stringify(users));

            // Auto login
            localStorage.setItem('voiceAI_currentUser', JSON.stringify({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }));

            showMessage('Account created successfully! Redirecting...', 'success');

            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            showMessage('Registration failed. Please try again.', 'error');
        } finally {
            // Hide loading
            registerBtn.disabled = false;
            registerBtn.querySelector('.btn-text').textContent = 'Create Account';
            registerBtn.querySelector('.btn-loader').style.display = 'none';
        }
    });
}

// Forgot password form handler
if (document.getElementById('forgotForm')) {
    const forgotForm = document.getElementById('forgotForm');
    const resetBtn = document.getElementById('resetBtn');

    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;

        // Show loading
        resetBtn.disabled = true;
        resetBtn.querySelector('.btn-text').textContent = 'Sending...';
        resetBtn.querySelector('.btn-loader').style.display = 'block';

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if email exists
            const user = users.find(u => u.email === email);

            if (user) {
                // In a real app, this would send an email
                showMessage('Password reset link sent to your email!', 'success');
            } else {
                showMessage('Email not found in our records', 'error');
            }
        } catch (error) {
            showMessage('Failed to send reset email. Please try again.', 'error');
        } finally {
            // Hide loading
            resetBtn.disabled = false;
            resetBtn.querySelector('.btn-text').textContent = 'Send Reset Link';
            resetBtn.querySelector('.btn-loader').style.display = 'none';
        }
    });
}

// Check if user is already logged in
const currentUser = JSON.parse(localStorage.getItem('voiceAI_currentUser') || 'null');
const rememberMe = localStorage.getItem('voiceAI_rememberMe') === 'true';

// If on login page and user is logged in, redirect to main app
if (window.location.pathname.includes('login.html') && currentUser && rememberMe) {
    window.location.href = 'index.html';
}

// If on main app and user is not logged in, redirect to login
if (window.location.pathname.includes('index.html') && !currentUser) {
    window.location.href = 'login.html';
}