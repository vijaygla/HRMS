// payroll.js - Handles payroll module functionality

// API base URL
const API_BASE_URL = 'http://localhost:8080/api';

// DOM elements
let payrollTable, payrollHistoryTable;
let payrollModal, processPayrollModal, payslipModal;
let currentPayrollId = null;
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();

// Initialize payroll module
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventHandlers();
    loadPayrollData();
    loadEmployees();
    updatePayrollPeriod();
});

// Initialize DOM elements
function initializeElements() {
    payrollTable = document.getElementById('payrollTable');
    payrollHistoryTable = document.getElementById('payrollHistoryTable');
    
    payrollModal = document.getElementById('payrollModal');
    processPayrollModal = document.getElementById('processPayrollModal');
    payslipModal = document.getElementById('payslipModal');
}

// Setup event handlers
function setupEventHandlers() {
    // Payroll form submission
    const payrollForm = document.getElementById('payrollForm');
    if (payrollForm) {
        payrollForm.addEventListener('submit', handlePayrollSubmit);
    }

    // Process payroll form submission
    const processPayrollForm = document.getElementById('processPayrollForm');
    if (processPayrollForm) {
        processPayrollForm.addEventListener('submit', handleProcessPayroll);
    }

    // Search functionality
    const payrollSearchInput = document.getElementById('payrollSearchInput');
    if (payrollSearchInput) {
        payrollSearchInput.addEventListener('input', searchPayroll);
    }

    // Period filters
    const monthSelect = document.getElementById('payrollMonth');
    const yearSelect = document.getElementById('payrollYear');
    
    if (monthSelect) {
        monthSelect.addEventListener('change', handlePeriodChange);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', handlePeriodChange);
    }

    // Salary calculation handlers
    setupSalaryCalculation();

    // Modal close handlers
    setupModalHandlers();
}

// Setup modal handlers
function setupModalHandlers() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                clearForms();
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                clearForms();
            }
        });
    });
}

// Setup salary calculation
function setupSalaryCalculation() {
    const basicSalaryInput = document.getElementById('basicSalary');
    const allowancesInput = document.getElementById('allowances');
    const overtimeHoursInput = document.getElementById('overtimeHours');
    const overtimeRateInput = document.getElementById('overtimeRate');
    const deductionsInput = document.getElementById('deductions');

    const inputs = [basicSalaryInput, allowancesInput, overtimeHoursInput, overtimeRateInput, deductionsInput];
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', calculateSalary);
        }
    });
}

// Load payroll data
async function loadPayrollData() {
    try {
        showLoading('payrollTable');
        const response = await fetch(`${API_BASE_URL}/payroll?month=${currentMonth}&year=${currentYear}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load payroll data');
        }

        const payrollData = await response.json();
        displayPayrollData(payrollData);
    } catch (error) {
        console.error('Error loading payroll data:', error);
        showError('Failed to load payroll data');
    }
}

// Display payroll data in table
function displayPayrollData(payrollData) {
    const tableBody = payrollTable.querySelector('tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (payrollData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">No payroll data found for ${getMonthName(currentMonth)} ${currentYear}</td>
            </tr>
        `;
        return;
    }

    payrollData.forEach(payroll => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payroll.employeeId}</td>
            <td>${payroll.employeeName}</td>
            <td>${payroll.department}</td>
            <td>₹${formatCurrency(payroll.basicSalary)}</td>
            <td>₹${formatCurrency(payroll.allowances)}</td>
            <td>₹${formatCurrency(payroll.overtimePay)}</td>
            <td>₹${formatCurrency(payroll.deductions)}</td>
            <td>₹${formatCurrency(payroll.netSalary)}</td>
            <td><span class="status-badge status-${payroll.status.toLowerCase()}">${payroll.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="viewPayslip('${payroll.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editPayroll('${payroll.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="downloadPayslip('${payroll.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    ${payroll.status === 'DRAFT' ? `
                        <button class="btn btn-sm btn-info" onclick="processPayroll('${payroll.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePayroll('${payroll.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Load employees for payroll processing
async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load employees');
        }

        const employees = await response.json();
        populateEmployeeDropdown(employees);
    } catch (error) {
        console.error('Error loading employees:', error);
        showError('Failed to load employees');
    }
}

// Populate employee dropdown
function populateEmployeeDropdown(employees) {
    const employeeSelect = document.getElementById('employeeSelect');
    if (!employeeSelect) return;

    employeeSelect.innerHTML = '<option value="">Select Employee</option>';
    
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = `${employee.employeeId} - ${employee.firstName} ${employee.lastName}`;
        option.dataset.basicSalary = employee.basicSalary || 0;
        option.dataset.department = employee.department || '';
        employeeSelect.appendChild(option);
    });

    // Handle employee selection
    employeeSelect.addEventListener('change', handleEmployeeSelection);
}

// Handle employee selection
function handleEmployeeSelection(e) {
    const selectedOption = e.target.selectedOptions[0];
    if (selectedOption && selectedOption.dataset.basicSalary) {
        document.getElementById('basicSalary').value = selectedOption.dataset.basicSalary;
        document.getElementById('department').value = selectedOption.dataset.department;
        calculateSalary();
    }
}

// Open payroll modal
function openPayrollModal() {
    currentPayrollId = null;
    clearPayrollForm();
    document.getElementById('payrollModalTitle').textContent = 'Add Payroll Entry';
    payrollModal.style.display = 'block';
}

// Handle payroll form submission
async function handlePayrollSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const payrollData = {
        employeeId: formData.get('employeeId'),
        month: currentMonth,
        year: currentYear,
        basicSalary: parseFloat(formData.get('basicSalary')) || 0,
        allowances: parseFloat(formData.get('allowances')) || 0,
        overtimeHours: parseFloat(formData.get('overtimeHours')) || 0,
        overtimeRate: parseFloat(formData.get('overtimeRate')) || 0,
        deductions: parseFloat(formData.get('deductions')) || 0,
        bonus: parseFloat(formData.get('bonus')) || 0,
        tax: parseFloat(formData.get('tax')) || 0,
        providentFund: parseFloat(formData.get('providentFund')) || 0,
        insurance: parseFloat(formData.get('insurance')) || 0
    };

    // Calculate derived values
    payrollData.overtimePay = payrollData.overtimeHours * payrollData.overtimeRate;
    payrollData.grossSalary = payrollData.basicSalary + payrollData.allowances + payrollData.overtimePay + payrollData.bonus;
    payrollData.totalDeductions = payrollData.deductions + payrollData.tax + payrollData.providentFund + payrollData.insurance;
    payrollData.netSalary = payrollData.grossSalary - payrollData.totalDeductions;

    try {
        const url = currentPayrollId 
            ? `${API_BASE_URL}/payroll/${currentPayrollId}`
            : `${API_BASE_URL}/payroll`;
        
        const method = currentPayrollId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payrollData)
        });

        if (!response.ok) {
            throw new Error('Failed to save payroll data');
        }

        showSuccess(currentPayrollId ? 'Payroll updated successfully' : 'Payroll created successfully');
        payrollModal.style.display = 'none';
        loadPayrollData();
        clearPayrollForm();
    } catch (error) {
        console.error('Error saving payroll:', error);
        showError('Failed to save payroll data');
    }
}

// Edit payroll
async function editPayroll(payrollId) {
    try {
        const response = await fetch(`${API_BASE_URL}/payroll/${payrollId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load payroll data');
        }

        const payroll = await response.json();
        populatePayrollForm(payroll);
        currentPayrollId = payrollId;
        document.getElementById('payrollModalTitle').textContent = 'Edit Payroll Entry';
        payrollModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading payroll:', error);
        showError('Failed to load payroll data');
    }
}

// View payslip
async function viewPayslip(payrollId) {
    try {
        const response = await fetch(`${API_BASE_URL}/payroll/${payrollId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load payroll data');
        }

        const payroll = await response.json();
        displayPayslip(payroll);
        payslipModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading payslip:', error);
        showError('Failed to load payslip');
    }
}

// Display payslip
function displayPayslip(payroll) {
    const payslipContent = document.getElementById('payslipContent');
    if (!payslipContent) return;

    payslipContent.innerHTML = `
        <div class="payslip">
            <div class="payslip-header">
                <h2>Payslip</h2>
                <div class="payslip-period">
                    <strong>Pay Period:</strong> ${getMonthName(payroll.month)} ${payroll.year}
                </div>
            </div>
            
            <div class="employee-info">
                <div class="info-row">
                    <span><strong>Employee ID:</strong> ${payroll.employeeId}</span>
                    <span><strong>Name:</strong> ${payroll.employeeName}</span>
                </div>
                <div class="info-row">
                    <span><strong>Department:</strong> ${payroll.department}</span>
                    <span><strong>Designation:</strong> ${payroll.designation || '-'}</span>
                </div>
            </div>

            <div class="payslip-body">
                <div class="earnings">
                    <h3>Earnings</h3>
                    <table class="payslip-table">
                        <tr>
                            <td>Basic Salary</td>
                            <td>₹${formatCurrency(payroll.basicSalary)}</td>
                        </tr>
                        <tr>
                            <td>Allowances</td>
                            <td>₹${formatCurrency(payroll.allowances)}</td>
                        </tr>
                        <tr>
                            <td>Overtime Pay (${payroll.overtimeHours || 0} hrs)</td>
                            <td>₹${formatCurrency(payroll.overtimePay)}</td>
                        </tr>
                        <tr>
                            <td>Bonus</td>
                            <td>₹${formatCurrency(payroll.bonus || 0)}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Gross Salary</strong></td>
                            <td><strong>₹${formatCurrency(payroll.grossSalary)}</strong></td>
                        </tr>
                    </table>
                </div>

                <div class="deductions">
                    <h3>Deductions</h3>
                    <table class="payslip-table">
                        <tr>
                            <td>Tax</td>
                            <td>₹${formatCurrency(payroll.tax || 0)}</td>
                        </tr>
                        <tr>
                            <td>Provident Fund</td>
                            <td>₹${formatCurrency(payroll.providentFund || 0)}</td>
                        </tr>
                        <tr>
                            <td>Insurance</td>
                            <td>₹${formatCurrency(payroll.insurance || 0)}</td>
                        </tr>
                        <tr>
                            <td>Other Deductions</td>
                            <td>₹${formatCurrency(payroll.deductions || 0)}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Total Deductions</strong></td>
                            <td><strong>₹${formatCurrency(payroll.totalDeductions)}</strong></td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="payslip-footer">
                <div class="net-salary">
                    <h2>Net Salary: ₹${formatCurrency(payroll.netSalary)}</h2>
                </div>
                <div class="generated-date">
                    <small>Generated on: ${new Date().toLocaleDateString()}</small>
                </div>
            </div>
        </div>
    `;
}

// Download payslip
async function downloadPayslip(payrollId) {
    try {
        const response = await fetch(`${API_BASE_URL}/payroll/${payrollId}/payslip`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download payslip');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip_${payrollId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading payslip:', error);
        showError('Failed to download payslip');
    }
}

// Process payroll (approve/finalize)
async function processPayroll(payrollId) {
    if (!confirm('Are you sure you want to process this payroll? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/payroll/${payrollId}/process`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to process payroll');
        }

        showSuccess('Payroll processed successfully');
        loadPayrollData();
    } catch (error) {
        console.error('Error processing payroll:', error);
        showError('Failed to process payroll');
    }
}

// Delete payroll
async function deletePayroll(payrollId) {
    if (!confirm('Are you sure you want to delete this payroll entry?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/payroll/${payrollId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete payroll');
        }

        showSuccess('Payroll deleted successfully');
        loadPayrollData();
    } catch (error) {
        console.error('Error deleting payroll:', error);
        showError('Failed to delete payroll');
    }
}

// Process bulk payroll
function openProcessPayrollModal() {
    processPayrollModal.style.display = 'block';
}

// Handle bulk payroll processing
async function handleProcessPayroll(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const processData = {
        month: parseInt(formData.get('processMonth')),
        year: parseInt(formData.get('processYear')),
        department: formData.get('processDepartment') || null,
        includeBonus: formData.get('includeBonus') === 'on'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/payroll/process-bulk`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(processData)
        });

        if (!response.ok) {
            throw new Error('Failed to process bulk payroll');
        }

        const result = await response.json();
        showSuccess(`Processed payroll for ${result.count} employees`);
        processPayrollModal.style.display = 'none';
        loadPayrollData();
    } catch (error) {
        console.error('Error processing bulk payroll:', error);
        showError('Failed to process bulk payroll');
    }
}

// Generate payroll report
async function generatePayrollReport() {
    try {
        const response = await fetch(`${API_BASE_URL}/payroll/report?month=${currentMonth}&year=${currentYear}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to generate report');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll_report_${currentMonth}_${currentYear}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error generating report:', error);
        showError('Failed to generate payroll report');
    }
}

// Handle period change
function handlePeriodChange() {
    const monthSelect = document.getElementById('payrollMonth');
    const yearSelect = document.getElementById('payrollYear');
    
    if (monthSelect && yearSelect) {
        currentMonth = parseInt(monthSelect.value);
        currentYear = parseInt(yearSelect.value);
        updatePayrollPeriod();
        loadPayrollData();
    }
}

// Update payroll period display
function updatePayrollPeriod() {
    const periodDisplay = document.getElementById('currentPeriod');
    if (periodDisplay) {
        periodDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    }
}

// Search payroll
function searchPayroll() {
    const searchTerm = document.getElementById('payrollSearchInput').value.toLowerCase();
    const rows = payrollTable.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Calculate salary
function calculateSalary() {
    const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
    const allowances = parseFloat(document.getElementById('allowances').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0;
    const overtimeRate = parseFloat(document.getElementById('overtimeRate').value) || 0;
    const bonus = parseFloat(document.getElementById('bonus').value) || 0;
    const deductions = parseFloat(document.getElementById('deductions').value) || 0;
    const tax = parseFloat(document.getElementById('tax').value) || 0;
    const providentFund = parseFloat(document.getElementById('providentFund').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;

    const overtimePay = overtimeHours * overtimeRate;
    const grossSalary = basicSalary + allowances + overtimePay + bonus;
    const totalDeductions = deductions + tax + providentFund + insurance;
    const netSalary = grossSalary - totalDeductions;

    // Update calculated fields
    const overtimePayField = document.getElementById('overtimePayDisplay');
    const grossSalaryField = document.getElementById('grossSalaryDisplay');
    const totalDeductionsField = document.getElementById('totalDeductionsDisplay');
    const netSalaryField = document.getElementById('netSalaryDisplay');

    if (overtimePayField) overtimePayField.textContent = formatCurrency(overtimePay);
    if (grossSalaryField) grossSalaryField.textContent = formatCurrency(grossSalary);
    if (totalDeductionsField) totalDeductionsField.textContent = formatCurrency(totalDeductions);
    if (netSalaryField) netSalaryField.textContent = formatCurrency(netSalary);
}

// Populate payroll form
function populatePayrollForm(payroll) {
    document.getElementById('employeeSelect').value = payroll.employeeId || '';
    document.getElementById('basicSalary').value = payroll.basicSalary || '';
    document.getElementById('allowances').value = payroll.allowances || '';
    document.getElementById('overtimeHours').value = payroll.overtimeHours || '';
    document.getElementById('overtimeRate').value = payroll.overtimeRate || '';
    document.getElementById('bonus').value = payroll.bonus || '';
    document.getElementById('deductions').value = payroll.deductions || '';
    document.getElementById('tax').value = payroll.tax || '';
    document.getElementById('providentFund').value = payroll.providentFund || '';
    document.getElementById('insurance').value = payroll.insurance || '';
    
    calculateSalary();
}

// Clear payroll form
function clearPayrollForm() {
    const form = document.getElementById('payrollForm');
    if (form) {
        form.reset();
    }
    currentPayrollId = null;
    calculateSalary();
}

// Clear all forms
function clearForms() {
    clearPayrollForm();
    const processForm = document.getElementById('processPayrollForm');
    if (processForm) {
        processForm.reset();
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    }
}

function showSuccess(message) {
    // Implement your notification system
    alert(message); // Replace with proper notification
}

function showError(message) {
    // Implement your notification system
    alert('Error: ' + message); // Replace with proper notification
}

function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Export functions for global access
window.openPayrollModal = openPayrollModal;
window.editPayroll = editPayroll;
window.viewPayslip = viewPayslip;
window.downloadPayslip = downloadPayslip;
window.processPayroll = processPayroll;
window.deletePayroll = deletePayroll;
window.openProcessPayrollModal = openProcessPayrollModal;
window.generatePayrollReport = generatePayrollReport;

