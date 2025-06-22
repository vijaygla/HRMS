// leaves.js - Leave Management functionality

// Utility functions (if not already imported from main.js)
const LeaveUtils = {
    // Format date for display
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Calculate days between two dates
    calculateDays: function(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    },

    // Show success message
    showSuccess: function(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // Show error message
    showError: function(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // Show loading state
    showLoading: function(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading-spinner">Loading...</div>';
        }
    },

    // Hide loading state
    hideLoading: function(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const loading = container.querySelector('.loading-spinner');
            if (loading) {
                loading.remove();
            }
        }
    }
};

// HTTP utility for API calls
const LeaveAPI = {
    // Base API URL
    baseURL: '/api/leaves',

    // Generic API call method
    request: async function(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // GET request
    get: function(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    // POST request
    post: function(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // PUT request
    put: function(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // DELETE request
    delete: function(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Leave Management System
const LeaveManager = {
    // Current user and state
    currentUser: null,
    leaves: [],
    leaveTypes: [],
    leaveBalances: {},
    currentView: 'my-leaves',

    // Initialize leave management
    init: function() {
        this.loadCurrentUser();
        this.loadLeaveTypes();
        this.loadLeaveBalances();
        this.loadLeaves();
        this.bindEvents();
        this.setupFilters();
        this.initializeCalendar();
    },

    // Load current user information
    loadCurrentUser: async function() {
        try {
            this.currentUser = await LeaveAPI.get('/user');
        } catch (error) {
            console.error('Failed to load user:', error);
            // Fallback user data
            this.currentUser = {
                id: 1,
                name: 'Current User',
                role: 'employee',
                department: 'IT'
            };
        }
    },

    // Load leave types
    loadLeaveTypes: async function() {
        try {
            this.leaveTypes = await LeaveAPI.get('/types');
        } catch (error) {
            console.error('Failed to load leave types:', error);
            // Fallback leave types
            this.leaveTypes = [
                { id: 1, name: 'Annual Leave', maxDays: 21, description: 'Yearly vacation leave' },
                { id: 2, name: 'Sick Leave', maxDays: 10, description: 'Medical leave' },
                { id: 3, name: 'Personal Leave', maxDays: 5, description: 'Personal matters' },
                { id: 4, name: 'Maternity Leave', maxDays: 90, description: 'Maternity leave' },
                { id: 5, name: 'Paternity Leave', maxDays: 15, description: 'Paternity leave' }
            ];
        }
        this.populateLeaveTypeDropdown();
    },

    // Load leave balances
    loadLeaveBalances: async function() {
        try {
            this.leaveBalances = await LeaveAPI.get('/balances');
        } catch (error) {
            console.error('Failed to load leave balances:', error);
            // Fallback balances
            this.leaveBalances = {
                1: { used: 5, remaining: 16, total: 21 },
                2: { used: 2, remaining: 8, total: 10 },
                3: { used: 1, remaining: 4, total: 5 },
                4: { used: 0, remaining: 90, total: 90 },
                5: { used: 0, remaining: 15, total: 15 }
            };
        }
        this.displayLeaveBalances();
    },

    // Load leaves based on current view
    loadLeaves: async function() {
        try {
            LeaveUtils.showLoading('leaves-container');
            
            let endpoint = '';
            switch (this.currentView) {
                case 'my-leaves':
                    endpoint = '/my-leaves';
                    break;
                case 'team-leaves':
                    endpoint = '/team-leaves';
                    break;
                case 'all-leaves':
                    endpoint = '/all-leaves';
                    break;
                case 'pending-approval':
                    endpoint = '/pending-approval';
                    break;
                default:
                    endpoint = '/my-leaves';
            }

            this.leaves = await LeaveAPI.get(endpoint);
        } catch (error) {
            console.error('Failed to load leaves:', error);
            // Fallback data
            this.leaves = this.generateSampleLeaves();
        } finally {
            LeaveUtils.hideLoading('leaves-container');
            this.displayLeaves();
        }
    },

    // Generate sample leaves for fallback
    generateSampleLeaves: function() {
        return [
            {
                id: 1,
                employeeId: 1,
                employeeName: 'John Doe',
                leaveType: 'Annual Leave',
                startDate: '2024-07-15',
                endDate: '2024-07-19',
                days: 5,
                reason: 'Family vacation',
                status: 'approved',
                appliedDate: '2024-06-15',
                approvedBy: 'Jane Smith',
                approvedDate: '2024-06-16'
            },
            {
                id: 2,
                employeeId: 2,
                employeeName: 'Alice Johnson',
                leaveType: 'Sick Leave',
                startDate: '2024-06-20',
                endDate: '2024-06-22',
                days: 3,
                reason: 'Medical treatment',
                status: 'pending',
                appliedDate: '2024-06-18',
                approvedBy: null,
                approvedDate: null
            },
            {
                id: 3,
                employeeId: 1,
                employeeName: 'John Doe',
                leaveType: 'Personal Leave',
                startDate: '2024-08-10',
                endDate: '2024-08-10',
                days: 1,
                reason: 'Personal matters',
                status: 'rejected',
                appliedDate: '2024-07-10',
                approvedBy: 'Jane Smith',
                approvedDate: '2024-07-11',
                rejectionReason: 'Peak business period'
            }
        ];
    },

    // Populate leave type dropdown
    populateLeaveTypeDropdown: function() {
        const dropdown = document.getElementById('leave-type');
        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">Select Leave Type</option>';
        this.leaveTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            option.dataset.maxDays = type.maxDays;
            dropdown.appendChild(option);
        });
    },

    // Display leave balances
    displayLeaveBalances: function() {
        const container = document.getElementById('leave-balances');
        if (!container) return;

        const balancesHTML = this.leaveTypes.map(type => {
            const balance = this.leaveBalances[type.id] || { used: 0, remaining: type.maxDays, total: type.maxDays };
            const percentage = (balance.used / balance.total) * 100;

            return `
                <div class="balance-card">
                    <h4 class="balance-title">${type.name}</h4>
                    <div class="balance-stats">
                        <div class="stat">
                            <span class="stat-label">Used</span>
                            <span class="stat-value">${balance.used}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Remaining</span>
                            <span class="stat-value">${balance.remaining}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Total</span>
                            <span class="stat-value">${balance.total}</span>
                        </div>
                    </div>
                    <div class="balance-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span class="progress-text">${Math.round(percentage)}% used</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = balancesHTML;
    },

    // Display leaves
    displayLeaves: function() {
        const container = document.getElementById('leaves-list');
        if (!container) return;

        if (!this.leaves || this.leaves.length === 0) {
            container.innerHTML = '<div class="no-data">No leaves found</div>';
            return;
        }

        const leavesHTML = this.leaves.map(leave => this.createLeaveCard(leave)).join('');
        container.innerHTML = leavesHTML;
    },

    // Create leave card HTML
    createLeaveCard: function(leave) {
        const statusClass = this.getStatusClass(leave.status);
        const statusText = leave.status.charAt(0).toUpperCase() + leave.status.slice(1);
        const canModify = leave.status === 'pending' && leave.employeeId === this.currentUser.id;
        const canApprove = leave.status === 'pending' && this.currentUser.role === 'manager';

        return `
            <div class="leave-card ${statusClass}">
                <div class="leave-header">
                    <div class="leave-info">
                        <h4 class="employee-name">${leave.employeeName}</h4>
                        <span class="leave-type">${leave.leaveType}</span>
                    </div>
                    <div class="leave-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="leave-details">
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">
                            ${LeaveUtils.formatDate(leave.startDate)} - ${LeaveUtils.formatDate(leave.endDate)}
                            (${leave.days} ${leave.days === 1 ? 'day' : 'days'})
                        </span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Reason:</span>
                        <span class="detail-value">${leave.reason}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Applied:</span>
                        <span class="detail-value">${LeaveUtils.formatDate(leave.appliedDate)}</span>
                    </div>
                    
                    ${leave.approvedBy ? `
                        <div class="detail-row">
                            <span class="detail-label">Approved by:</span>
                            <span class="detail-value">${leave.approvedBy} on ${LeaveUtils.formatDate(leave.approvedDate)}</span>
                        </div>
                    ` : ''}
                    
                    ${leave.rejectionReason ? `
                        <div class="detail-row">
                            <span class="detail-label">Rejection Reason:</span>
                            <span class="detail-value rejection-reason">${leave.rejectionReason}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="leave-actions">
                    ${canModify ? `
                        <button class="btn btn-secondary btn-sm" onclick="LeaveManager.editLeave(${leave.id})">
                            Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="LeaveManager.cancelLeave(${leave.id})">
                            Cancel
                        </button>
                    ` : ''}
                    
                    ${canApprove ? `
                        <button class="btn btn-success btn-sm" onclick="LeaveManager.approveLeave(${leave.id})">
                            Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="LeaveManager.rejectLeave(${leave.id})">
                            Reject
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-outline btn-sm" onclick="LeaveManager.viewLeaveDetails(${leave.id})">
                        View Details
                    </button>
                </div>
            </div>
        `;
    },

    // Get status class for styling
    getStatusClass: function(status) {
        const classes = {
            'pending': 'status-pending',
            'approved': 'status-approved',
            'rejected': 'status-rejected',
            'cancelled': 'status-cancelled'
        };
        return classes[status] || 'status-default';
    },

    // Bind event handlers
    bindEvents: function() {
        // Apply leave form
        const applyForm = document.getElementById('apply-leave-form');
        if (applyForm) {
            applyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitLeaveApplication();
            });
        }

        // Leave type change handler
        const leaveTypeSelect = document.getElementById('leave-type');
        if (leaveTypeSelect) {
            leaveTypeSelect.addEventListener('change', (e) => {
                this.handleLeaveTypeChange(e.target.value);
            });
        }

        // Date change handlers
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => this.calculateLeaveDays());
            endDateInput.addEventListener('change', () => this.calculateLeaveDays());
        }

        // View switcher
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Search and filter
        const searchInput = document.getElementById('leave-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterLeaves(e.target.value);
            });
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-leaves');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLeaves();
            });
        }

        // Modal close handlers
        this.bindModalEvents();
    },

    // Handle leave type change
    handleLeaveTypeChange: function(leaveTypeId) {
        if (!leaveTypeId) return;

        const leaveType = this.leaveTypes.find(type => type.id == leaveTypeId);
        const balance = this.leaveBalances[leaveTypeId];

        if (leaveType && balance) {
            const infoContainer = document.getElementById('leave-type-info');
            if (infoContainer) {
                infoContainer.innerHTML = `
                    <div class="leave-type-details">
                        <p><strong>Description:</strong> ${leaveType.description}</p>
                        <p><strong>Maximum Days:</strong> ${leaveType.maxDays}</p>
                        <p><strong>Remaining Balance:</strong> ${balance.remaining} days</p>
                    </div>
                `;
            }
        }
    },

    // Calculate leave days
    calculateLeaveDays: function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const daysDisplay = document.getElementById('leave-days');

        if (startDate && endDate && daysDisplay) {
            const days = LeaveUtils.calculateDays(startDate, endDate);
            daysDisplay.textContent = `${days} ${days === 1 ? 'day' : 'days'}`;

            // Validate against balance
            const leaveTypeId = document.getElementById('leave-type').value;
            if (leaveTypeId) {
                const balance = this.leaveBalances[leaveTypeId];
                if (balance && days > balance.remaining) {
                    daysDisplay.classList.add('error');
                    daysDisplay.textContent += ` (Exceeds remaining balance: ${balance.remaining})`;
                } else {
                    daysDisplay.classList.remove('error');
                }
            }
        }
    },

    // Submit leave application
    submitLeaveApplication: async function() {
        const formData = this.getFormData();
        
        if (!this.validateLeaveApplication(formData)) {
            return;
        }

        try {
            const submitBtn = document.querySelector('#apply-leave-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            const result = await LeaveAPI.post('/', formData);
            
            LeaveUtils.showSuccess('Leave application submitted successfully!');
            this.resetLeaveForm();
            this.loadLeaves();
            this.loadLeaveBalances();
            
            // Close modal if exists
            this.closeModal('apply-leave-modal');

        } catch (error) {
            console.error('Failed to submit leave application:', error);
            LeaveUtils.showError('Failed to submit leave application. Please try again.');
        } finally {
            const submitBtn = document.querySelector('#apply-leave-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Application';
            }
        }
    },

    // Get form data
    getFormData: function() {
        return {
            leaveTypeId: document.getElementById('leave-type').value,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            reason: document.getElementById('leave-reason').value.trim(),
            emergencyContact: document.getElementById('emergency-contact').value.trim(),
            workHandover: document.getElementById('work-handover').value.trim()
        };
    },

    // Validate leave application
    validateLeaveApplication: function(data) {
        const errors = [];

        if (!data.leaveTypeId) {
            errors.push('Please select a leave type');
        }

        if (!data.startDate || !data.endDate) {
            errors.push('Please select start and end dates');
        }

        if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
            errors.push('End date must be after start date');
        }

        if (!data.reason) {
            errors.push('Please provide a reason for leave');
        }

        // Check balance
        if (data.leaveTypeId && data.startDate && data.endDate) {
            const days = LeaveUtils.calculateDays(data.startDate, data.endDate);
            const balance = this.leaveBalances[data.leaveTypeId];
            
            if (balance && days > balance.remaining) {
                errors.push(`Requested days (${days}) exceed remaining balance (${balance.remaining})`);
            }
        }

        if (errors.length > 0) {
            LeaveUtils.showError(errors.join(', '));
            return false;
        }

        return true;
    },

    // Reset leave form
    resetLeaveForm: function() {
        const form = document.getElementById('apply-leave-form');
        if (form) {
            form.reset();
            document.getElementById('leave-days').textContent = '';
            document.getElementById('leave-type-info').innerHTML = '';
        }
    },

    // Switch view
    switchView: function(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Update page title
        const titles = {
            'my-leaves': 'My Leaves',
            'team-leaves': 'Team Leaves',
            'all-leaves': 'All Leaves',
            'pending-approval': 'Pending Approvals'
        };
        
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = titles[view] || 'Leaves';
        }
        
        // Reload data
        this.loadLeaves();
    },

    // Filter leaves by search term
    filterLeaves: function(searchTerm) {
        const leaves = document.querySelectorAll('.leave-card');
        const term = searchTerm.toLowerCase();

        leaves.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(term) ? 'block' : 'none';
        });
    },

    // Filter leaves by status
    filterByStatus: function(status) {
        const leaves = document.querySelectorAll('.leave-card');

        leaves.forEach(card => {
            if (!status || card.classList.contains(`status-${status}`)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    // Approve leave
    approveLeave: async function(leaveId) {
        if (!confirm('Are you sure you want to approve this leave?')) {
            return;
        }

        try {
            await LeaveAPI.put(`/${leaveId}/approve`, {});
            LeaveUtils.showSuccess('Leave approved successfully!');
            this.loadLeaves();
        } catch (error) {
            console.error('Failed to approve leave:', error);
            LeaveUtils.showError('Failed to approve leave. Please try again.');
        }
    },

    // Reject leave
    rejectLeave: async function(leaveId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) {
            return;
        }

        try {
            await LeaveAPI.put(`/${leaveId}/reject`, { reason });
            LeaveUtils.showSuccess('Leave rejected successfully!');
            this.loadLeaves();
        } catch (error) {
            console.error('Failed to reject leave:', error);
            LeaveUtils.showError('Failed to reject leave. Please try again.');
        }
    },

    // Cancel leave
    cancelLeave: async function(leaveId) {
        if (!confirm('Are you sure you want to cancel this leave application?')) {
            return;
        }

        try {
            await LeaveAPI.delete(`/${leaveId}`);
            LeaveUtils.showSuccess('Leave cancelled successfully!');
            this.loadLeaves();
            this.loadLeaveBalances();
        } catch (error) {
            console.error('Failed to cancel leave:', error);
            LeaveUtils.showError('Failed to cancel leave. Please try again.');
        }
    },

    // Edit leave
    editLeave: function(leaveId) {
        const leave = this.leaves.find(l => l.id === leaveId);
        if (!leave) return;

        // Populate form with existing data
        document.getElementById('leave-type').value = leave.leaveTypeId;
        document.getElementById('start-date').value = leave.startDate;
        document.getElementById('end-date').value = leave.endDate;
        document.getElementById('leave-reason').value = leave.reason;
        
        // Update form for editing
        const form = document.getElementById('apply-leave-form');
        form.dataset.editId = leaveId;
        
        // Show modal
        this.showModal('apply-leave-modal');
    },

    // View leave details
    viewLeaveDetails: function(leaveId) {
        const leave = this.leaves.find(l => l.id === leaveId);
        if (!leave) return;

        // Show detailed modal
        this.showLeaveDetailsModal(leave);
    },

    // Setup filters
    setupFilters: function() {
        // Date range filter
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        
        if (dateFrom && dateTo) {
            dateFrom.addEventListener('change', () => this.applyDateFilter());
            dateTo.addEventListener('change', () => this.applyDateFilter());
        }
    },

    // Apply date filter
    applyDateFilter: function() {
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        
        if (!dateFrom && !dateTo) return;

        const leaves = document.querySelectorAll('.leave-card');
        leaves.forEach(card => {
            // This would need to be implemented based on your HTML structure
            // For now, just show all leaves
            card.style.display = 'block';
        });
    },

    // Initialize calendar view
    initializeCalendar: function() {
        // Calendar initialization would go here
        // This could use a library like FullCalendar or a custom implementation
    },

    // Export leaves
    exportLeaves: function() {
        const exportBtn = document.getElementById('export-leaves');
        if (exportBtn) {
            exportBtn.disabled = true;
            exportBtn.textContent = 'Exporting...';
        }

        // Simulate export
        setTimeout(() => {
            LeaveUtils.showSuccess('Leaves exported successfully!');
            
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.textContent = 'Export';
            }
        }, 2000);
    },

    // Modal management
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
    },

    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    },

    bindModalEvents: function() {
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    },

    // Show leave details modal
    showLeaveDetailsModal: function(leave) {
        // Create and show detailed modal
        const modalContent = `
            <div class="modal" id="leave-details-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Leave Details</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${this.createLeaveCard(leave)}
                    </div>
                </div>
            </div>
        `;
        
        // Add to body and show
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalContent;
        document.body.appendChild(tempDiv.firstElementChild);
        
        this.showModal('leave-details-modal');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize leave manager
    LeaveManager.init();

    // Apply leave button
    const applyBtn = document.getElementById('apply-leave-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            LeaveManager.resetLeaveForm();
            LeaveManager.showModal('apply-leave-modal');
        });
    }
});

// Export for use in other files
window.LeaveManager = LeaveManager;
window.LeaveUtils = LeaveUtils;
window.LeaveAPI = LeaveAPI;
// Expose LeaveManager globally for debugging
window.LeaveManager = LeaveManager;
// Expose utility functions globally for debugging
window.LeaveUtils = LeaveUtils;
window.LeaveAPI = LeaveAPI; 

