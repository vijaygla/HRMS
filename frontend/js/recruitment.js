// recruitment.js - Handles recruitment module functionality

// API base URL
const API_BASE_URL = 'http://localhost:8080/api';

// DOM elements
let jobPostingsTable, applicationsTable;
let jobPostingModal, applicationModal, viewApplicationModal;
let currentJobId = null;

// Initialize recruitment module
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventHandlers();
    loadJobPostings();
    loadApplications();
});

// Initialize DOM elements
function initializeElements() {
    jobPostingsTable = document.getElementById('jobPostingsTable');
    applicationsTable = document.getElementById('applicationsTable');
    
    jobPostingModal = document.getElementById('jobPostingModal');
    applicationModal = document.getElementById('applicationModal');
    viewApplicationModal = document.getElementById('viewApplicationModal');
}

// Setup event handlers
function setupEventHandlers() {
    // Job posting form submission
    const jobPostingForm = document.getElementById('jobPostingForm');
    if (jobPostingForm) {
        jobPostingForm.addEventListener('submit', handleJobPostingSubmit);
    }

    // Application form submission
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', handleApplicationSubmit);
    }

    // Search functionality
    const jobSearchInput = document.getElementById('jobSearchInput');
    if (jobSearchInput) {
        jobSearchInput.addEventListener('input', searchJobPostings);
    }

    const applicationSearchInput = document.getElementById('applicationSearchInput');
    if (applicationSearchInput) {
        applicationSearchInput.addEventListener('input', searchApplications);
    }

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

// Load job postings
async function loadJobPostings() {
    try {
        showLoading('jobPostingsTable');
        const response = await fetch(`${API_BASE_URL}/recruitment/jobs`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load job postings');
        }

        const jobPostings = await response.json();
        displayJobPostings(jobPostings);
    } catch (error) {
        console.error('Error loading job postings:', error);
        showError('Failed to load job postings');
    }
}

// Display job postings in table
function displayJobPostings(jobPostings) {
    const tableBody = jobPostingsTable.querySelector('tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (jobPostings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No job postings found</td>
            </tr>
        `;
        return;
    }

    jobPostings.forEach(job => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${job.title}</td>
            <td>${job.department}</td>
            <td>${job.location}</td>
            <td>${job.type}</td>
            <td><span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span></td>
            <td>${formatDate(job.postedDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="viewJobPosting('${job.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editJobPosting('${job.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="viewJobApplications('${job.id}')">
                        <i class="fas fa-users"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteJobPosting('${job.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Load applications
async function loadApplications() {
    try {
        showLoading('applicationsTable');
        const response = await fetch(`${API_BASE_URL}/recruitment/applications`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load applications');
        }

        const applications = await response.json();
        displayApplications(applications);
    } catch (error) {
        console.error('Error loading applications:', error);
        showError('Failed to load applications');
    }
}

// Display applications in table
function displayApplications(applications) {
    const tableBody = applicationsTable.querySelector('tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (applications.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No applications found</td>
            </tr>
        `;
        return;
    }

    applications.forEach(application => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${application.candidateName}</td>
            <td>${application.email}</td>
            <td>${application.jobTitle}</td>
            <td>${application.phone}</td>
            <td><span class="status-badge status-${application.status.toLowerCase()}">${application.status}</span></td>
            <td>${formatDate(application.appliedDate)}</td>
            <td>${application.experience} years</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="viewApplication('${application.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="updateApplicationStatus('${application.id}', 'SHORTLISTED')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="updateApplicationStatus('${application.id}', 'INTERVIEW')">
                        <i class="fas fa-calendar"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="updateApplicationStatus('${application.id}', 'REJECTED')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Open new job posting modal
function openJobPostingModal() {
    currentJobId = null;
    clearJobPostingForm();
    document.getElementById('jobPostingModalTitle').textContent = 'Add New Job Posting';
    jobPostingModal.style.display = 'block';
}

// Handle job posting form submission
async function handleJobPostingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const jobData = {
        title: formData.get('title'),
        department: formData.get('department'),
        location: formData.get('location'),
        type: formData.get('type'),
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        salary: formData.get('salary'),
        status: formData.get('status') || 'ACTIVE'
    };

    try {
        const url = currentJobId 
            ? `${API_BASE_URL}/recruitment/jobs/${currentJobId}`
            : `${API_BASE_URL}/recruitment/jobs`;
        
        const method = currentJobId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });

        if (!response.ok) {
            throw new Error('Failed to save job posting');
        }

        showSuccess(currentJobId ? 'Job posting updated successfully' : 'Job posting created successfully');
        jobPostingModal.style.display = 'none';
        loadJobPostings();
        clearJobPostingForm();
    } catch (error) {
        console.error('Error saving job posting:', error);
        showError('Failed to save job posting');
    }
}

// Edit job posting
async function editJobPosting(jobId) {
    try {
        const response = await fetch(`${API_BASE_URL}/recruitment/jobs/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load job posting');
        }

        const job = await response.json();
        populateJobPostingForm(job);
        currentJobId = jobId;
        document.getElementById('jobPostingModalTitle').textContent = 'Edit Job Posting';
        jobPostingModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading job posting:', error);
        showError('Failed to load job posting');
    }
}

// View job posting
async function viewJobPosting(jobId) {
    try {
        const response = await fetch(`${API_BASE_URL}/recruitment/jobs/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load job posting');
        }

        const job = await response.json();
        displayJobPostingDetails(job);
    } catch (error) {
        console.error('Error loading job posting:', error);
        showError('Failed to load job posting');
    }
}

// Delete job posting
async function deleteJobPosting(jobId) {
    if (!confirm('Are you sure you want to delete this job posting?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/recruitment/jobs/${jobId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete job posting');
        }

        showSuccess('Job posting deleted successfully');
        loadJobPostings();
    } catch (error) {
        console.error('Error deleting job posting:', error);
        showError('Failed to delete job posting');
    }
}

// View applications for a specific job
async function viewJobApplications(jobId) {
    try {
        const response = await fetch(`${API_BASE_URL}/recruitment/jobs/${jobId}/applications`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load job applications');
        }

        const applications = await response.json();
        displayApplications(applications);
        
        // Switch to applications tab if exists
        const applicationsTab = document.getElementById('applicationsTab');
        if (applicationsTab) {
            applicationsTab.click();
        }
    } catch (error) {
        console.error('Error loading job applications:', error);
        showError('Failed to load job applications');
    }
}

// View application details
async function viewApplication(applicationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/recruitment/applications/${applicationId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load application');
        }

        const application = await response.json();
        displayApplicationDetails(application);
        viewApplicationModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading application:', error);
        showError('Failed to load application');
    }
}

// Update application status
async function updateApplicationStatus(applicationId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/recruitment/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        });

        if (!response.ok) {
            throw new Error('Failed to update application status');
        }

        showSuccess('Application status updated successfully');
        loadApplications();
    } catch (error) {
        console.error('Error updating application status:', error);
        showError('Failed to update application status');
    }
}

// Search job postings
function searchJobPostings() {
    const searchTerm = document.getElementById('jobSearchInput').value.toLowerCase();
    const rows = jobPostingsTable.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Search applications
function searchApplications() {
    const searchTerm = document.getElementById('applicationSearchInput').value.toLowerCase();
    const rows = applicationsTable.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Populate job posting form
function populateJobPostingForm(job) {
    document.getElementById('jobTitle').value = job.title || '';
    document.getElementById('jobDepartment').value = job.department || '';
    document.getElementById('jobLocation').value = job.location || '';
    document.getElementById('jobType').value = job.type || '';
    document.getElementById('jobDescription').value = job.description || '';
    document.getElementById('jobRequirements').value = job.requirements || '';
    document.getElementById('jobSalary').value = job.salary || '';
    document.getElementById('jobStatus').value = job.status || 'ACTIVE';
}

// Clear job posting form
function clearJobPostingForm() {
    const form = document.getElementById('jobPostingForm');
    if (form) {
        form.reset();
    }
    currentJobId = null;
}

// Display job posting details
function displayJobPostingDetails(job) {
    const content = `
        <div class="job-details">
            <h3>${job.title}</h3>
            <div class="job-meta">
                <span class="badge">${job.department}</span>
                <span class="badge">${job.location}</span>
                <span class="badge">${job.type}</span>
                <span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span>
            </div>
            <div class="job-section">
                <h4>Description</h4>
                <p>${job.description}</p>
            </div>
            <div class="job-section">
                <h4>Requirements</h4>
                <p>${job.requirements}</p>
            </div>
            <div class="job-section">
                <h4>Salary</h4>
                <p>${job.salary}</p>
            </div>
            <div class="job-section">
                <h4>Posted Date</h4>
                <p>${formatDate(job.postedDate)}</p>
            </div>
        </div>
    `;
    
    // You can display this in a modal or dedicated section
    console.log(content); // For now, just log it
    alert('Job details loaded - implement display modal as needed');
}

// Display application details
function displayApplicationDetails(application) {
    const viewContent = document.getElementById('viewApplicationContent');
    if (viewContent) {
        viewContent.innerHTML = `
            <div class="application-details">
                <h3>Application Details</h3>
                <div class="detail-row">
                    <strong>Candidate Name:</strong> ${application.candidateName}
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> ${application.email}
                </div>
                <div class="detail-row">
                    <strong>Phone:</strong> ${application.phone}
                </div>
                <div class="detail-row">
                    <strong>Job Applied:</strong> ${application.jobTitle}
                </div>
                <div class="detail-row">
                    <strong>Experience:</strong> ${application.experience} years
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> 
                    <span class="status-badge status-${application.status.toLowerCase()}">${application.status}</span>
                </div>
                <div class="detail-row">
                    <strong>Applied Date:</strong> ${formatDate(application.appliedDate)}
                </div>
                <div class="detail-row">
                    <strong>Cover Letter:</strong>
                    <p>${application.coverLetter || 'No cover letter provided'}</p>
                </div>
                <div class="detail-row">
                    <strong>Resume:</strong>
                    ${application.resumeUrl ? `<a href="${application.resumeUrl}" target="_blank">View Resume</a>` : 'No resume uploaded'}
                </div>
            </div>
        `;
    }
}

// Clear all forms
function clearForms() {
    clearJobPostingForm();
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.reset();
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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
window.openJobPostingModal = openJobPostingModal;
window.editJobPosting = editJobPosting;
window.viewJobPosting = viewJobPosting;
window.deleteJobPosting = deleteJobPosting;
window.viewJobApplications = viewJobApplications;
window.viewApplication = viewApplication;
window.updateApplicationStatus = updateApplicationStatus;


