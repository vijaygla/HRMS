// auth.js - Authentication related functionality

// Authentication service
const AuthService = {
    // Login user
    login: async function(credentials) {
        try {
            const response = await HTTP.post('/auth/login', credentials);
            
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                return response;
            } else {
                throw new Error('Invalid login response');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    // Logout user
    logout: function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    // Check if user is authenticated
    isAuthenticated: function() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        return !!(token && user);
    },

    // Get current user
    getCurrentUser: function() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check user role
    hasRole: function(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    // Protect page - redirect to login if not authenticated
    protectPage: function() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Login form handler
function handleLogin() {
    const form = document.getElementById('loginForm');
    
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        // Validate form
        const errors = FormValidator.validateRequired(credentials, ['username', 'password']);
        
        if (errors.length > 0) {
            Utils.showError(errors.join(', '));
            return;
        }

        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            await AuthService.login(credentials);
            Utils.showSuccess('Login successful!');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            Utils.showError(error.message || 'Login failed. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Logout handler
function handleLogout() {
    const logoutBtns = document.querySelectorAll('.logout-btn, [data-action="logout"]');
    
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to logout?')) {
                AuthService.logout();
            }
        });
    });
}

// Initialize user display
function initializeUserDisplay() {
    const user = AuthService.getCurrentUser();
    
    if (!user) return;

    // Update user name displays
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = user.username || user.email;
    });

    // Update user role displays
    const userRoleElements = document.querySelectorAll('.user-role');
    userRoleElements.forEach(element => {
        element.textContent = user.role || 'User';
    });

    // Update user avatar/initials
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    userAvatarElements.forEach(element => {
        if (user.avatar) {
            element.src = user.avatar;
        } else {
            // Create initials
            const initials = (user.username || user.email || 'U')
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .substring(0, 2);
            
            element.textContent = initials;
            element.style.backgroundColor = '#007bff';
            element.style.color = 'white';
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
        }
    });
}

// Role-based access control
function initializeRoleBasedAccess() {
    const user = AuthService.getCurrentUser();
    
    if (!user) return;

    // Hide elements based on role
    const roleElements = document.querySelectorAll('[data-role]');
    roleElements.forEach(element => {
        const requiredRoles = element.dataset.role.split(',').map(r => r.trim());
        
        if (!requiredRoles.includes(user.role)) {
            element.style.display = 'none';
        }
    });

    // Disable features based on role
    const roleFeatures = document.querySelectorAll('[data-require-role]');
    roleFeatures.forEach(element => {
        const requiredRoles = element.dataset.requireRole.split(',').map(r => r.trim());
        
        if (!requiredRoles.includes(user.role)) {
            element.disabled = true;
            element.title = 'You do not have permission to access this feature';
        }
    });
}

// Password strength validator
const PasswordValidator = {
    validate: function(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            strength: this.calculateStrength(password)
        };
    },
    
    calculateStrength: function(password) {
        let score = 0;
        
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
        
        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
    }
};

// Password strength indicator
function initializePasswordStrength() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        const strengthIndicator = input.parentElement.querySelector('.password-strength');
        
        if (!strengthIndicator) return;
        
        input.addEventListener('input', function() {
            const password = this.value;
            
            if (!password) {
                strengthIndicator.style.display = 'none';
                return;
            }
            
            const result = PasswordValidator.validate(password);
            
            strengthIndicator.style.display = 'block';
            strengthIndicator.className = `password-strength strength-${result.strength}`;
            strengthIndicator.textContent = `Password strength: ${result.strength}`;
            
            if (result.errors.length > 0) {
                strengthIndicator.title = result.errors.join('\n');
            }
        });
    });
}

// Remember me functionality
function initializeRememberMe() {
    const rememberCheckbox = document.getElementById('rememberMe');
    const usernameInput = document.getElementById('username');
    
    if (!rememberCheckbox || !usernameInput) return;

    // Load remembered username
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
        usernameInput.value = rememberedUsername;
        rememberCheckbox.checked = true;
    }

    // Handle form submission
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', function() {
            if (rememberCheckbox.checked) {
                localStorage.setItem('rememberedUsername', usernameInput.value);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
        });
    }
}

// Initialize authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    if (window.location.pathname.includes('login.html')) {
        // Don't protect login page, but redirect if already authenticated
        if (AuthService.isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return;
        }
        
        handleLogin();
        initializePasswordStrength();
        initializeRememberMe();
    } else {
        // Protect all other pages
        if (!AuthService.protectPage()) {
            return;
        }
        
        initializeUserDisplay();
        initializeRoleBasedAccess();
        handleLogout();
    }
});

// Export AuthService for use in other files
window.AuthService = AuthService;
window.PasswordValidator = PasswordValidator;


