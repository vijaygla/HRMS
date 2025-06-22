// main.js - Common utilities and configurations

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Common utility functions
const Utils = {
    // Show loading spinner
    showLoading: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading-spinner">Loading...</div>';
        }
    },

    // Hide loading spinner
    hideLoading: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '';
        }
    },

    // Show success message
    showSuccess: function(message) {
        this.showNotification(message, 'success');
    },

    // Show error message
    showError: function(message) {
        this.showNotification(message, 'error');
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },

    // Format date
    formatDate: function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format currency
    formatCurrency: function(amount) {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Validate email
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone
    validatePhone: function(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    // Get query parameters
    getQueryParam: function(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // Set query parameter
    setQueryParam: function(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.replaceState({}, '', url);
    },

    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// HTTP Request utility
const HTTP = {
    // Get authentication token
    getAuthToken: function() {
        return localStorage.getItem('authToken');
    },

    // Get default headers
    getDefaultHeaders: function() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },

    // Generic request method
    request: async function(url, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                ...options,
                headers: {
                    ...this.getDefaultHeaders(),
                    ...(options.headers || {})
                }
            });

            if (response.status === 401) {
                // Unauthorized - redirect to login
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('HTTP Request failed:', error);
            throw error;
        }
    },

    // GET request
    get: function(url) {
        return this.request(url, { method: 'GET' });
    },

    // POST request
    post: function(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // PUT request
    put: function(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // DELETE request
    delete: function(url) {
        return this.request(url, { method: 'DELETE' });
    }
};

// Form validation utility
const FormValidator = {
    // Validate required fields
    validateRequired: function(formData, requiredFields) {
        const errors = [];
        
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
            }
        });
        
        return errors;
    },

    // Validate form with custom rules
    validateForm: function(formData, rules) {
        const errors = [];
        
        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const rule = rules[field];
            
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors.push(`${rule.label || field} is required`);
                return;
            }
            
            if (value && rule.type === 'email' && !Utils.validateEmail(value)) {
                errors.push(`${rule.label || field} must be a valid email`);
            }
            
            if (value && rule.type === 'phone' && !Utils.validatePhone(value)) {
                errors.push(`${rule.label || field} must be a valid phone number`);
            }
            
            if (value && rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.label || field} must be at least ${rule.minLength} characters`);
            }
            
            if (value && rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.label || field} must be no more than ${rule.maxLength} characters`);
            }
        });
        
        return errors;
    }
};

// Modal utility
const Modal = {
    // Show modal
    show: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    },

    // Hide modal
    hide: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    },

    // Hide all modals
    hideAll: function() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.classList.remove('modal-open');
    }
};

// Table utility
const Table = {
    // Create table row
    createRow: function(data, columns) {
        const row = document.createElement('tr');
        
        columns.forEach(column => {
            const cell = document.createElement('td');
            
            if (column.key === 'actions') {
                cell.innerHTML = column.render ? column.render(data) : '';
            } else {
                let value = data[column.key];
                
                if (column.format) {
                    value = column.format(value);
                } else if (column.type === 'date') {
                    value = Utils.formatDate(value);
                } else if (column.type === 'currency') {
                    value = Utils.formatCurrency(value);
                }
                
                cell.textContent = value || '';
            }
            
            if (column.className) {
                cell.className = column.className;
            }
            
            row.appendChild(cell);
        });
        
        return row;
    },

    // Populate table
    populate: function(tableId, data, columns) {
        const table = document.getElementById(tableId);
        const tbody = table.querySelector('tbody');
        
        if (!tbody) return;
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = columns.length;
            cell.textContent = 'No data available';
            cell.className = 'text-center';
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }
        
        // Add data rows
        data.forEach(item => {
            const row = this.createRow(item, columns);
            tbody.appendChild(row);
        });
    }
};

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            Modal.hideAll();
        }
    });

    // Handle navigation active states
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

// Export utilities for use in other files
window.Utils = Utils;
window.HTTP = HTTP;
window.FormValidator = FormValidator;
window.Modal = Modal;
window.Table = Table;


