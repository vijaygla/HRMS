// employees.js - Employee management functionality

// Employee management system
const EmployeeManager = {
    employees: [],
    filteredEmployees: [],
    currentPage: 1,
    itemsPerPage: 10,
    sortBy: 'name',
    sortOrder: 'asc',
    filters: {
        department: '',
        position: '',
        status: '',
        search: ''
    },

    // Initialize employee management
    init: function() {
        this.bindEvents();
        this.loadEmployees();
        this.setupPagination();
        this.initializeFilters();
    },

    // Load employees from API
    loadEmployees: async function() {
        try {
            Utils.showLoading('employee-table');
            
            const response = await HTTP.get('/employees');
            this.employees = response || [];
            this.filteredEmployees = [...this.employees];
            
            this.renderEmployeeTable();
            this.updateEmployeeStats();
            
        } catch (error) {
            console.error('Failed to load employees:', error);
            Utils.showError('Failed to load employees');
        } finally {
            Utils.hideLoading('employee-table');
        }
    },

    // Render employee table
    renderEmployeeTable: function() {
        const tableColumns = [
            { key: 'id', title: 'ID', className: 'text-center' },
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' },
            { key: 'department', title: 'Department' },
            { key: 'position', title: 'Position' },
            { key: 'hireDate', title: 'Hire Date', type: 'date' },
            { key: 'salary', title: 'Salary', type: 'currency' },
            { key: 'status', title: 'Status', format: this.formatStatus },
            { 
                key: 'actions', 
                title: 'Actions', 
                className: 'text-center',
                render: (employee) => this.renderActionButtons(employee)
            }
        ];

        // Get paginated data
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);

        Table.populate('employee-table', paginatedEmployees, tableColumns);
        this.updatePaginationInfo();
    },

    // Format status display
    formatStatus: function(status) {
        const statusClasses = {
            'active': 'status-active',
            'inactive': 'status-inactive',
            'terminated': 'status-terminated'
        };
        
        return `<span class="status-badge ${statusClasses[status] || ''}">${status}</span>`;
    },

    // Render action buttons for each employee
    renderActionButtons: function(employee) {
        return `
            <div class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="EmployeeManager.viewEmployee('${employee.id}')">
                    View
                </button>
                <button class="btn btn-sm btn-secondary" onclick="EmployeeManager.editEmployee('${employee.id}')">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="EmployeeManager.deleteEmployee('${employee.id}')">
                    Delete
                </button>
            </div>
        `;
    },

    // View employee details
    viewEmployee: function(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            Utils.showError('Employee not found');
            return;
        }

        this.populateEmployeeModal(employee, true);
        Modal.show('employee-modal');
    },

    // Edit employee
    editEmployee: function(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            Utils.showError('Employee not found');
            return;
        }

        this.populateEmployeeModal(employee, false);
        Modal.show('employee-modal');
    },

    // Add new employee
    addEmployee: function() {
        this.populateEmployeeModal({}, false);
        Modal.show('employee-modal');
    },

    // Populate employee modal
    populateEmployeeModal: function(employee, readOnly = false) {
        const form = document.getElementById('employee-form');
        if (!form) return;

        // Reset form
        form.reset();

        // Set form mode
        const modalTitle = document.getElementById('employee-modal-title');
        const submitBtn = document.getElementById('employee-submit-btn');
        
        if (employee.id) {
            if (modalTitle) modalTitle.textContent = readOnly ? 'View Employee' : 'Edit Employee';
            if (submitBtn) submitBtn.textContent = 'Update Employee';
        } else {
            if (modalTitle) modalTitle.textContent = 'Add New Employee';
            if (submitBtn) submitBtn.textContent = 'Add Employee';
        }

        // Populate form fields
        const fields = ['id', 'name', 'email', 'phone', 'department', 'position', 
                       'hireDate', 'salary', 'status', 'address', 'emergencyContact'];
        
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && employee[field] !== undefined) {
                input.value = employee[field];
            }
        });

        // Set readonly mode
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.readOnly = readOnly;
            input.disabled = readOnly;
        });

        if (submitBtn) {
            submitBtn.style.display = readOnly ? 'none' : 'block';
        }
    },

    // Save employee (add or update)
    saveEmployee: async function(formData) {
        try {
            const employee = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                department: formData.get('department'),
                position: formData.get('position'),
                hireDate: formData.get('hireDate'),
                salary: parseFloat(formData.get('salary')) || 0,
                status: formData.get('status'),
                address: formData.get('address'),
                emergencyContact: formData.get('emergencyContact')
            };

            // Validate required fields
            const requiredFields = ['name', 'email', 'department', 'position'];
            const errors = FormValidator.validateRequired(employee, requiredFields);
            
            if (errors.length > 0) {
                Utils.showError(errors.join(', '));
                return false;
            }

            // Validate email
            if (!Utils.validateEmail(employee.email)) {
                Utils.showError('Please enter a valid email address');
                return false;
            }

            const employeeId = formData.get('id');
            let response;

            if (employeeId) {
                // Update existing employee
                response = await HTTP.put(`/employees/${employeeId}`, employee);
                Utils.showSuccess('Employee updated successfully');
            } else {
                // Add new employee
                response = await HTTP.post('/employees', employee);
                Utils.showSuccess('Employee added successfully');
            }

            Modal.hide('employee-modal');
            this.loadEmployees();
            return true;

        } catch (error) {
            console.error('Failed to save employee:', error);
            Utils.showError(error.message || 'Failed to save employee');
            return false;
        }
    },

    // Delete employee
    deleteEmployee: async function(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            Utils.showError('Employee not found');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${employee.name}?`)) {
            return;
        }

        try {
            await HTTP.delete(`/employees/${employeeId}`);
            Utils.showSuccess('Employee deleted successfully');
            this.loadEmployees();
        } catch (error) {
            console.error('Failed to delete employee:', error);
            Utils.showError(error.message || 'Failed to delete employee');
        }
    },

    // Apply filters
    applyFilters: function() {
        this.filteredEmployees = this.employees.filter(employee => {
            // Text search
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const searchable = `${employee.name} ${employee.email} ${employee.department} ${employee.position}`.toLowerCase();
                if (!searchable.includes(searchTerm)) {
                    return false;
                }
            }

            // Department filter
            if (this.filters.department && employee.department !== this.filters.department) {
                return false;
            }

            // Position filter
            if (this.filters.position && employee.position !== this.filters.position) {
                return false;
            }

            // Status filter
            if (this.filters.status && employee.status !== this.filters.status) {
                return false;
            }

            return true;
        });

        this.currentPage = 1; // Reset to first page
        this.renderEmployeeTable();
    },

    // Sort employees
    sortEmployees: function(sortBy) {
        if (this.sortBy === sortBy) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = sortBy;
            this.sortOrder = 'asc';
        }

        this.filteredEmployees.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle different data types
            if (sortBy === 'salary') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            } else if (sortBy === 'hireDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else {
                aValue = aValue ? aValue.toString().toLowerCase() : '';
                bValue = bValue ? bValue.toString().toLowerCase() : '';
            }

            if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderEmployeeTable();
        this.updateSortIndicators();
    },

    // Update sort indicators
    updateSortIndicators: function() {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === this.sortBy) {
                header.classList.add(`sort-${this.sortOrder}`);
            }
        });
    },

    // Setup pagination
    setupPagination: function() {
        this.updatePaginationInfo();
        this.renderPaginationControls();
    },

    // Update pagination info
    updatePaginationInfo: function() {
        const totalItems = this.filteredEmployees.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        const paginationInfo = document.getElementById('pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} employees`;
        }

        // Update page size selector
        const pageSizeSelect = document.getElementById('page-size');
        if (pageSizeSelect && pageSizeSelect.value != this.itemsPerPage) {
            pageSizeSelect.value = this.itemsPerPage;
        }
    },

    // Render pagination controls
    renderPaginationControls: function() {
        const container = document.getElementById('pagination-controls');
        if (!container) return;

        const totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="btn btn-sm btn-secondary ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="EmployeeManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="btn btn-sm btn-outline-secondary" onclick="EmployeeManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-outline-secondary'}" 
                        onclick="EmployeeManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="btn btn-sm btn-outline-secondary" onclick="EmployeeManager.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // Next button
        paginationHTML += `
            <button class="btn btn-sm btn-secondary ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="EmployeeManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next
            </button>
        `;

        container.innerHTML = paginationHTML;
    },

    // Go to specific page
    goToPage: function(page) {
        const totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderEmployeeTable();
        this.renderPaginationControls();
    },

    // Change page size
    changePageSize: function(newSize) {
        this.itemsPerPage = parseInt(newSize);
        this.currentPage = 1;
        this.renderEmployeeTable();
        this.renderPaginationControls();
    },

    // Initialize filters
    initializeFilters: function() {
        // Populate department filter
        this.populateDepartmentFilter();
        
        // Populate position filter
        this.populatePositionFilter();
    },

    // Populate department filter
    populateDepartmentFilter: function() {
        const departments = [...new Set(this.employees.map(emp => emp.department))].filter(Boolean);
        const select = document.getElementById('department-filter');
        
        if (select) {
            select.innerHTML = '<option value="">All Departments</option>';
            departments.forEach(dept => {
                select.innerHTML += `<option value="${dept}">${dept}</option>`;
            });
        }
    },

    // Populate position filter
    populatePositionFilter: function() {
        const positions = [...new Set(this.employees.map(emp => emp.position))].filter(Boolean);
        const select = document.getElementById('position-filter');
        
        if (select) {
            select.innerHTML = '<option value="">All Positions</option>';
            positions.forEach(pos => {
                select.innerHTML += `<option value="${pos}">${pos}</option>`;
            });
        }
    },

    // Update employee stats
    updateEmployeeStats: function() {
        const stats = {
            total: this.employees.length,
            active: this.employees.filter(emp => emp.status === 'active').length,
            inactive: this.employees.filter(emp => emp.status === 'inactive').length,
            departments: [...new Set(this.employees.map(emp => emp.department))].length
        };

        // Update stat displays
        const statElements = {
            'total-employees-stat': stats.total,
            'active-employees-stat': stats.active,
            'inactive-employees-stat': stats.inactive,
            'departments-stat': stats.departments
        };

        Object.keys(statElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = statElements[id];
            }
        });
    },

    // Export employees data
    exportEmployees: function(format = 'csv') {
        const exportBtn = document.getElementById('export-employees');
        if (exportBtn) {
            exportBtn.textContent = 'Exporting...';
            exportBtn.disabled = true;
        }

        // Simulate export
        setTimeout(() => {
            Utils.showSuccess(`Employees exported as ${format.toUpperCase()}`);
            
            if (exportBtn) {
                exportBtn.textContent = 'Export';
                exportBtn.disabled = false;
            }
        }, 2000);
    },

    // Bind events
    bindEvents: function() {
        // Employee form submission
        const employeeForm = document.getElementById('employee-form');
        if (employeeForm) {
            employeeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = document.getElementById('employee-submit-btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Saving...';
                submitBtn.disabled = true;

                const formData = new FormData(employeeForm);
                const success = await this.saveEmployee(formData);

                if (!success) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        // Add employee button
        const addEmployeeBtn = document.getElementById('add-employee-btn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => {
                this.addEmployee();
            });
        }

        // Search input
        const searchInput = document.getElementById('employee-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            }, 300));
        }

        // Filter selects
        const filterSelects = ['department-filter', 'position-filter', 'status-filter'];
        filterSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', (e) => {
                    const filterKey = id.replace('-filter', '');
                    this.filters[filterKey] = e.target.value;
                    this.applyFilters();
                });
            }
        });

        // Page size selector
        const pageSizeSelect = document.getElementById('page-size');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.changePageSize(e.target.value);
            });
        }

        // Sort headers
        const sortHeaders = document.querySelectorAll('.sortable');
        sortHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortBy = header.dataset.sort;
                if (sortBy) {
                    this.sortEmployees(sortBy);
                }
            });
        });

        // Export button
        const exportBtn = document.getElementById('export-employees');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportEmployees('csv');
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-employees');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadEmployees();
            });
        }
    }
};

// Initialize employee management when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    EmployeeManager.init();
});

