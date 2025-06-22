// Performance Management JavaScript
class PerformanceManager {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api/performance';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.performanceData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPerformanceData();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Performance evaluation form
        const evaluationForm = document.getElementById('performance-evaluation-form');
        if (evaluationForm) {
            evaluationForm.addEventListener('submit', this.handleEvaluationSubmit.bind(this));
        }

        // Goal setting form
        const goalForm = document.getElementById('goal-form');
        if (goalForm) {
            goalForm.addEventListener('submit', this.handleGoalSubmit.bind(this));
        }

        // Review cycle form
        const reviewCycleForm = document.getElementById('review-cycle-form');
        if (reviewCycleForm) {
            reviewCycleForm.addEventListener('submit', this.handleReviewCycleSubmit.bind(this));
        }

        // Filter and search functionality
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', this.handleFilterChange.bind(this));
        });

        const searchInput = document.getElementById('performance-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }

        // Modal triggers
        const addEvaluationBtn = document.getElementById('add-evaluation-btn');
        if (addEvaluationBtn) {
            addEvaluationBtn.addEventListener('click', this.showEvaluationModal.bind(this));
        }

        const addGoalBtn = document.getElementById('add-goal-btn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', this.showGoalModal.bind(this));
        }

        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', this.handleTabSwitch.bind(this));
        });

        // Export functionality
        const exportBtn = document.getElementById('export-performance-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', this.exportPerformanceData.bind(this));
        }

        // Bulk actions
        const bulkActionBtn = document.getElementById('bulk-action-btn');
        if (bulkActionBtn) {
            bulkActionBtn.addEventListener('click', this.handleBulkAction.bind(this));
        }
    }

    async loadPerformanceData() {
        try {
            this.showLoader();
            const response = await fetch(`${this.apiUrl}/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch performance data');
            }

            this.performanceData = await response.json();
            this.renderPerformanceList();
            this.updateDashboardStats();
            this.updateCharts();
        } catch (error) {
            console.error('Error loading performance data:', error);
            this.showNotification('Error loading performance data', 'error');
        } finally {
            this.hideLoader();
        }
    }

    renderPerformanceList() {
        const container = document.getElementById('performance-list');
        if (!container) return;

        if (this.performanceData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>No Performance Data</h3>
                    <p>Start by creating performance evaluations or setting goals.</p>
                    <button class="btn btn-primary" onclick="performanceManager.showEvaluationModal()">
                        Add Evaluation
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.performanceData.map(performance => `
            <div class="performance-card" data-id="${performance.id}">
                <div class="performance-header">
                    <div class="employee-info">
                        <h4>${performance.employeeName}</h4>
                        <span class="employee-id">${performance.employeeId}</span>
                        <span class="department">${performance.department}</span>
                    </div>
                    <div class="performance-actions">
                        <button class="btn btn-sm btn-outline" onclick="performanceManager.viewPerformance('${performance.id}')">
                            View
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="performanceManager.editPerformance('${performance.id}')">
                            Edit
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline dropdown-toggle">⋮</button>
                            <div class="dropdown-menu">
                                <a href="#" onclick="performanceManager.duplicatePerformance('${performance.id}')">Duplicate</a>
                                <a href="#" onclick="performanceManager.archivePerformance('${performance.id}')">Archive</a>
                                <a href="#" onclick="performanceManager.deletePerformance('${performance.id}')" class="text-danger">Delete</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="performance-content">
                    <div class="performance-metrics">
                        <div class="metric">
                            <span class="metric-label">Overall Score</span>
                            <span class="metric-value ${this.getScoreClass(performance.overallScore)}">
                                ${performance.overallScore}/5
                            </span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Goals Achieved</span>
                            <span class="metric-value">${performance.goalsAchieved}/${performance.totalGoals}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Review Period</span>
                            <span class="metric-value">${performance.reviewPeriod}</span>
                        </div>
                    </div>
                    <div class="performance-status">
                        <span class="status-badge status-${performance.status.toLowerCase()}">
                            ${performance.status}
                        </span>
                        <span class="review-date">
                            Last Review: ${this.formatDate(performance.lastReviewDate)}
                        </span>
                    </div>
                </div>
                <div class="performance-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(performance.overallScore / 5) * 100}%"></div>
                    </div>
                    <div class="progress-categories">
                        ${performance.categories.map(cat => `
                            <div class="category-score">
                                <span class="category-name">${cat.name}</span>
                                <span class="category-value">${cat.score}/5</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    async handleEvaluationSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const evaluationData = {
            employeeId: formData.get('employeeId'),
            reviewPeriod: formData.get('reviewPeriod'),
            overallScore: parseFloat(formData.get('overallScore')),
            categories: this.getCategories(),
            goals: this.getGoals(),
            achievements: formData.get('achievements'),
            areasForImprovement: formData.get('areasForImprovement'),
            comments: formData.get('comments'),
            reviewerId: this.currentUser.id,
            status: 'DRAFT'
        };

        try {
            this.showLoader();
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(evaluationData)
            });

            if (!response.ok) {
                throw new Error('Failed to create evaluation');
            }

            const result = await response.json();
            this.showNotification('Performance evaluation created successfully', 'success');
            this.closeModal('evaluation-modal');
            this.loadPerformanceData();
            e.target.reset();
        } catch (error) {
            console.error('Error creating evaluation:', error);
            this.showNotification('Error creating evaluation', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async handleGoalSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const goalData = {
            employeeId: formData.get('employeeId'),
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'),
            targetValue: formData.get('targetValue'),
            currentValue: formData.get('currentValue') || 0,
            status: 'ACTIVE'
        };

        try {
            this.showLoader();
            const response = await fetch(`${this.apiUrl}/goals`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(goalData)
            });

            if (!response.ok) {
                throw new Error('Failed to create goal');
            }

            const result = await response.json();
            this.showNotification('Goal created successfully', 'success');
            this.closeModal('goal-modal');
            this.loadGoals();
            e.target.reset();
        } catch (error) {
            console.error('Error creating goal:', error);
            this.showNotification('Error creating goal', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async handleReviewCycleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const cycleData = {
            name: formData.get('name'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            type: formData.get('type'),
            departments: formData.getAll('departments'),
            description: formData.get('description'),
            status: 'ACTIVE'
        };

        try {
            this.showLoader();
            const response = await fetch(`${this.apiUrl}/cycles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cycleData)
            });

            if (!response.ok) {
                throw new Error('Failed to create review cycle');
            }

            const result = await response.json();
            this.showNotification('Review cycle created successfully', 'success');
            this.closeModal('review-cycle-modal');
            this.loadReviewCycles();
            e.target.reset();
        } catch (error) {
            console.error('Error creating review cycle:', error);
            this.showNotification('Error creating review cycle', 'error');
        } finally {
            this.hideLoader();
        }
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.filterPerformanceData(filter);
    }

    filterPerformanceData(filter) {
        let filteredData = [...this.performanceData];
        
        switch(filter) {
            case 'pending':
                filteredData = filteredData.filter(p => p.status === 'PENDING');
                break;
            case 'completed':
                filteredData = filteredData.filter(p => p.status === 'COMPLETED');
                break;
            case 'overdue':
                filteredData = filteredData.filter(p => new Date(p.dueDate) < new Date() && p.status !== 'COMPLETED');
                break;
            case 'high-performers':
                filteredData = filteredData.filter(p => p.overallScore >= 4);
                break;
            case 'needs-improvement':
                filteredData = filteredData.filter(p => p.overallScore < 3);
                break;
            default:
                // Show all
                break;
        }
        
        this.renderFilteredPerformanceList(filteredData);
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredData = this.performanceData.filter(performance => 
            performance.employeeName.toLowerCase().includes(searchTerm) ||
            performance.employeeId.toLowerCase().includes(searchTerm) ||
            performance.department.toLowerCase().includes(searchTerm)
        );
        
        this.renderFilteredPerformanceList(filteredData);
    }

    renderFilteredPerformanceList(data) {
        const container = document.getElementById('performance-list');
        if (!container) return;

        const originalData = this.performanceData;
        this.performanceData = data;
        this.renderPerformanceList();
        this.performanceData = originalData;
    }

    showEvaluationModal() {
        this.openModal('evaluation-modal');
        this.loadEmployeesList();
    }

    showGoalModal() {
        this.openModal('goal-modal');
        this.loadEmployeesList();
    }

    async viewPerformance(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch performance details');
            }

            const performance = await response.json();
            this.showPerformanceDetails(performance);
        } catch (error) {
            console.error('Error viewing performance:', error);
            this.showNotification('Error loading performance details', 'error');
        }
    }

    showPerformanceDetails(performance) {
        const modal = document.getElementById('performance-details-modal');
        const content = modal.querySelector('.modal-content');
        
        content.innerHTML = `
            <div class="modal-header">
                <h3>Performance Details</h3>
                <button class="close-btn" onclick="performanceManager.closeModal('performance-details-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="performance-detail-header">
                    <div class="employee-info">
                        <h4>${performance.employeeName}</h4>
                        <p>Employee ID: ${performance.employeeId}</p>
                        <p>Department: ${performance.department}</p>
                        <p>Position: ${performance.position}</p>
                    </div>
                    <div class="overall-score">
                        <div class="score-circle ${this.getScoreClass(performance.overallScore)}">
                            <span class="score-value">${performance.overallScore}</span>
                            <span class="score-max">/5</span>
                        </div>
                        <p>Overall Score</p>
                    </div>
                </div>
                
                <div class="performance-categories">
                    <h5>Category Scores</h5>
                    ${performance.categories.map(cat => `
                        <div class="category-detail">
                            <div class="category-header">
                                <span class="category-name">${cat.name}</span>
                                <span class="category-score">${cat.score}/5</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(cat.score / 5) * 100}%"></div>
                            </div>
                            <p class="category-comments">${cat.comments || 'No comments'}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="performance-goals">
                    <h5>Goals & Achievements</h5>
                    <div class="goals-summary">
                        <p><strong>Goals Achieved:</strong> ${performance.goalsAchieved}/${performance.totalGoals}</p>
                        <p><strong>Achievement Rate:</strong> ${Math.round((performance.goalsAchieved / performance.totalGoals) * 100)}%</p>
                    </div>
                    <div class="achievements">
                        <h6>Key Achievements</h6>
                        <p>${performance.achievements || 'No achievements recorded'}</p>
                    </div>
                    <div class="improvements">
                        <h6>Areas for Improvement</h6>
                        <p>${performance.areasForImprovement || 'No improvement areas specified'}</p>
                    </div>
                </div>
                
                <div class="performance-comments">
                    <h5>Reviewer Comments</h5>
                    <p>${performance.comments || 'No comments provided'}</p>
                </div>
                
                <div class="performance-timeline">
                    <h5>Review Timeline</h5>
                    <div class="timeline-item">
                        <span class="timeline-date">${this.formatDate(performance.createdDate)}</span>
                        <span class="timeline-event">Evaluation Created</span>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-date">${this.formatDate(performance.lastReviewDate)}</span>
                        <span class="timeline-event">Last Review</span>
                    </div>
                    ${performance.nextReviewDate ? `
                        <div class="timeline-item">
                            <span class="timeline-date">${this.formatDate(performance.nextReviewDate)}</span>
                            <span class="timeline-event">Next Review Due</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="performanceManager.closeModal('performance-details-modal')">Close</button>
                <button class="btn btn-primary" onclick="performanceManager.editPerformance('${performance.id}')">Edit</button>
            </div>
        `;
        
        this.openModal('performance-details-modal');
    }

    async editPerformance(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch performance data');
            }

            const performance = await response.json();
            this.populateEvaluationForm(performance);
            this.openModal('evaluation-modal');
        } catch (error) {
            console.error('Error loading performance for edit:', error);
            this.showNotification('Error loading performance data', 'error');
        }
    }

    populateEvaluationForm(performance) {
        const form = document.getElementById('performance-evaluation-form');
        if (!form) return;

        form.querySelector('[name="employeeId"]').value = performance.employeeId;
        form.querySelector('[name="reviewPeriod"]').value = performance.reviewPeriod;
        form.querySelector('[name="overallScore"]').value = performance.overallScore;
        form.querySelector('[name="achievements"]').value = performance.achievements || '';
        form.querySelector('[name="areasForImprovement"]').value = performance.areasForImprovement || '';
        form.querySelector('[name="comments"]').value = performance.comments || '';

        // Set form to edit mode
        form.dataset.editId = performance.id;
        const modalTitle = document.querySelector('#evaluation-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Performance Evaluation';
        }
    }

    async deletePerformance(id) {
        if (!confirm('Are you sure you want to delete this performance evaluation?')) {
            return;
        }

        try {
            this.showLoader();
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete performance evaluation');
            }

            this.showNotification('Performance evaluation deleted successfully', 'success');
            this.loadPerformanceData();
        } catch (error) {
            console.error('Error deleting performance:', error);
            this.showNotification('Error deleting performance evaluation', 'error');
        } finally {
            this.hideLoader();
        }
    }

    handleTabSwitch(e) {
        const tabId = e.target.dataset.tab;
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        e.target.classList.add('active');
        document.getElementById(tabId).classList.add('active');

        // Load specific data based on tab
        switch(tabId) {
            case 'evaluations-tab':
                this.loadPerformanceData();
                break;
            case 'goals-tab':
                this.loadGoals();
                break;
            case 'analytics-tab':
                this.loadAnalytics();
                break;
            case 'cycles-tab':
                this.loadReviewCycles();
                break;
        }
    }

    async loadGoals() {
        try {
            const response = await fetch(`${this.apiUrl}/goals`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch goals');
            }

            const goals = await response.json();
            this.renderGoals(goals);
        } catch (error) {
            console.error('Error loading goals:', error);
            this.showNotification('Error loading goals', 'error');
        }
    }

    renderGoals(goals) {
        const container = document.getElementById('goals-list');
        if (!container) return;

        container.innerHTML = goals.map(goal => `
            <div class="goal-card" data-id="${goal.id}">
                <div class="goal-header">
                    <h4>${goal.title}</h4>
                    <span class="priority-badge priority-${goal.priority.toLowerCase()}">${goal.priority}</span>
                </div>
                <div class="goal-details">
                    <p>${goal.description}</p>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(goal.currentValue / goal.targetValue) * 100}%"></div>
                        </div>
                        <span class="progress-text">${goal.currentValue}/${goal.targetValue}</span>
                    </div>
                </div>
                <div class="goal-footer">
                    <span class="due-date">Due: ${this.formatDate(goal.dueDate)}</span>
                    <span class="status-badge status-${goal.status.toLowerCase()}">${goal.status}</span>
                </div>
            </div>
        `).join('');
    }

    async loadAnalytics() {
        try {
            const response = await fetch(`${this.apiUrl}/analytics`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const analytics = await response.json();
            this.renderAnalytics(analytics);
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showNotification('Error loading analytics', 'error');
        }
    }

    renderAnalytics(analytics) {
        const container = document.getElementById('analytics-content');
        if (!container) return;

        container.innerHTML = `
            <div class="analytics-grid">
                <div class="metric-card">
                    <h4>Average Performance Score</h4>
                    <div class="metric-value">${analytics.averageScore.toFixed(1)}/5</div>
                </div>
                <div class="metric-card">
                    <h4>Top Performers</h4>
                    <div class="metric-value">${analytics.topPerformers}%</div>
                </div>
                <div class="metric-card">
                    <h4>Goals Completion Rate</h4>
                    <div class="metric-value">${analytics.goalCompletionRate}%</div>
                </div>
                <div class="metric-card">
                    <h4>Pending Reviews</h4>
                    <div class="metric-value">${analytics.pendingReviews}</div>
                </div>
            </div>
            <div class="charts-container">
                <div class="chart-card">
                    <h5>Performance Trends</h5>
                    <canvas id="performance-trend-chart"></canvas>
                </div>
                <div class="chart-card">
                    <h5>Department Performance</h5>
                    <canvas id="department-performance-chart"></canvas>
                </div>
            </div>
        `;

        this.initializeAnalyticsCharts(analytics);
    }

    initializeCharts() {
        // Initialize chart canvases if they exist
        const trendCanvas = document.getElementById('performance-trend-chart');
        const departmentCanvas = document.getElementById('department-performance-chart');
        
        if (trendCanvas && departmentCanvas) {
            this.initializeAnalyticsCharts();
        }
    }

    initializeAnalyticsCharts(analytics) {
        // Performance trend chart
        const trendCtx = document.getElementById('performance-trend-chart');
        if (trendCtx) {
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: analytics.trendLabels || [],
                    datasets: [{
                        label: 'Average Score',
                        data: analytics.trendData || [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5
                        }
                    }
                }
            });
        }

        // Department performance chart
        const departmentCtx = document.getElementById('department-performance-chart');
        if (departmentCtx) {
            new Chart(departmentCtx, {
                type: 'bar',
                data: {
                    labels: analytics.departmentLabels || [],
                    datasets: [{
                        label: 'Average Score',
                        data: analytics.departmentData || [],
                        backgroundColor: [
                            '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5
                        }
                    }
                }
            });
        }
    }

    updateDashboardStats() {
        const stats = this.calculateStats();
        
        const avgScoreEl = document.getElementById('avg-performance-score');
        if (avgScoreEl) {
            avgScoreEl.textContent = stats.averageScore.toFixed(1);
        }

        const pendingReviewsEl = document.getElementById('pending-reviews-count');
        if (pendingReviewsEl) {
            pendingReviewsEl.textContent = stats.pendingReviews;
        }

        const completedReviewsEl = document.getElementById('completed-reviews-count');
        if (completedReviewsEl) {
            completedReviewsEl.textContent = stats.completedReviews;
        }

        const goalCompletionEl = document.getElementById('goal-completion-rate');
        if (goalCompletionEl) {
            goalCompletionEl.textContent = `${stats.goalCompletionRate}%`;
        }
    }

    calculateStats() {
        const totalScore = this.performanceData.reduce((sum, p) => sum + p.overallScore, 0);
        const averageScore = this.performanceData.length > 0 ? totalScore / this.performanceData.length : 0;
        
        const pendingReviews = this.performanceData.filter(p => p.status === 'PENDING').length;
        const completedReviews = this.performanceData.filter(p => p.status === 'COMPLETED').length;
        
        const totalGoals = this.performanceData.reduce((sum, p) => sum + p.totalGoals, 0);
        const achievedGoals = this.performanceData.reduce((sum, p) => sum + p.goalsAchieved, 0);
        const goalCompletionRate = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

        return {
            averageScore,
            pendingReviews,
            completedReviews,
            goalCompletionRate
        };
    }

    exportPerformanceData() {
        const data = this.performanceData.map(p => ({
            'Employee Name': p.employeeName,
            'Employee ID': p.employeeId,
            'Department': p.department,
            'Overall Score': p.overallScore,
            'Goals Achieved': p.goalsAchieved,
            'Total Goals': p.totalGoals,
            'Status': p.status,
            'Review Period': p.reviewPeriod,
            'Last Review': this.formatDate(p.lastReviewDate)
        }));

        this.downloadCSV(data, 'performance_data.csv');
    }

    downloadCSV(data, filename) {
        const csvContent = this.convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        csvRows.push(headers.join(','));
        
        for (const row of data) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    async handleBulkAction() {
        const selectedItems = document.querySelectorAll('.performance-checkbox:checked');
        const selectedIds = Array.from(selectedItems).map(item => item.value);
        
        if (selectedIds.length === 0) {
            this.showNotification('Please select items to perform bulk action', 'warning');
            return;
        }

        const action = document.getElementById('bulk-action-select').value;
        
        switch(action) {
            case 'approve':
                await this.bulkApproveEvaluations(selectedIds);
                break;
            case 'archive':
                await this.bulkArchiveEvaluations(selectedIds);
                break;
            case 'delete':
                await this.bulkDeleteEvaluations(selectedIds);
                break;
            case 'export':
                this.bulkExportEvaluations(selectedIds);
                break;
            default:
                this.showNotification('Please select an action', 'warning');
        }
    }

    async bulkApproveEvaluations(ids) {
        try {
            this.showLoader();
            const response = await fetch(`${this.apiUrl}/bulk/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            });

            if (!response.ok) {
                throw new Error('Failed to approve evaluations');
            }

            this.showNotification(`${ids.length} evaluations approved successfully`, 'success');
            this.loadPerformanceData();
        } catch (error) {
            console.error('Error approving evaluations:', error);
            this.showNotification('Error approving evaluations', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async bulkArchiveEvaluations(ids) {
        if (!confirm(`Are you sure you want to archive ${ids.length} evaluations?`)) {
            return;
        }

        try {
            this.showLoader();
            const response = await fetch(`${this.apiUrl}/bulk/archive`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            });

            if (!response.ok) {
                throw new Error('Failed to archive evaluations');
            }

            this.showNotification(`${ids.length} evaluations archived successfully`, 'success');
            this.loadPerformanceData();
        } catch (error) {
            console.error('Error archiving evaluations:', error);
            this.showNotification('Error archiving evaluations', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async bulkDeleteEvaluations(ids) {
        if (!confirm(`Are you sure you want to delete ${ids.length} evaluations? This action cannot be undone.`)) {
            return;
        }

        try {
            this.showLoader();
            const response = await fetch(`${this.apiUrl}/bulk/delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            });

            if (!response.ok) {
                throw new Error('Failed to delete evaluations');
            }

            this.showNotification(`${ids.length} evaluations deleted successfully`, 'success');
            this.loadPerformanceData();
        } catch (error) {
            console.error('Error deleting evaluations:', error);
            this.showNotification('Error deleting evaluations', 'error');
        } finally {
            this.hideLoader();
        }
    }

    bulkExportEvaluations(ids) {
        const selectedData = this.performanceData.filter(p => ids.includes(p.id));
        const data = selectedData.map(p => ({
            'Employee Name': p.employeeName,
            'Employee ID': p.employeeId,
            'Department': p.department,
            'Overall Score': p.overallScore,
            'Goals Achieved': p.goalsAchieved,
            'Total Goals': p.totalGoals,
            'Status': p.status,
            'Review Period': p.reviewPeriod,
            'Last Review': this.formatDate(p.lastReviewDate),
            'Achievements': p.achievements || '',
            'Areas for Improvement': p.areasForImprovement || '',
            'Comments': p.comments || ''
        }));

        this.downloadCSV(data, `selected_performance_data_${new Date().toISOString().split('T')[0]}.csv`);
    }

    async duplicatePerformance(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch performance data');
            }

            const performance = await response.json();
            
            // Remove ID and update some fields for duplication
            delete performance.id;
            performance.status = 'DRAFT';
            performance.createdDate = new Date().toISOString();
            performance.lastReviewDate = new Date().toISOString();
            
            const duplicateResponse = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(performance)
            });

            if (!duplicateResponse.ok) {
                throw new Error('Failed to duplicate performance evaluation');
            }

            this.showNotification('Performance evaluation duplicated successfully', 'success');
            this.loadPerformanceData();
        } catch (error) {
            console.error('Error duplicating performance:', error);
            this.showNotification('Error duplicating performance evaluation', 'error');
        }
    }

    async archivePerformance(id) {
        if (!confirm('Are you sure you want to archive this performance evaluation?')) {
            return;
        }

        try {
            this.showLoader();
            const response = await fetch(`${this.apiUrl}/${id}/archive`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to archive performance evaluation');
            }

            this.showNotification('Performance evaluation archived successfully', 'success');
            this.loadPerformanceData();
        } catch (error) {
            console.error('Error archiving performance:', error);
            this.showNotification('Error archiving performance evaluation', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async loadEmployeesList() {
        try {
            const response = await fetch('http://localhost:8080/api/employees', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch employees');
            }

            const employees = await response.json();
            this.populateEmployeeDropdowns(employees);
        } catch (error) {
            console.error('Error loading employees:', error);
            this.showNotification('Error loading employees list', 'error');
        }
    }

    populateEmployeeDropdowns(employees) {
        const selects = document.querySelectorAll('.employee-select');
        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Employee</option>' +
                employees.map(emp => 
                    `<option value="${emp.id}">${emp.firstName} ${emp.lastName} (${emp.employeeId})</option>`
                ).join('');
        });
    }

    async loadReviewCycles() {
        try {
            const response = await fetch(`${this.apiUrl}/cycles`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch review cycles');
            }

            const cycles = await response.json();
            this.renderReviewCycles(cycles);
        } catch (error) {
            console.error('Error loading review cycles:', error);
            this.showNotification('Error loading review cycles', 'error');
        }
    }

    renderReviewCycles(cycles) {
        const container = document.getElementById('review-cycles-list');
        if (!container) return;

        container.innerHTML = cycles.map(cycle => `
            <div class="cycle-card" data-id="${cycle.id}">
                <div class="cycle-header">
                    <h4>${cycle.name}</h4>
                    <span class="status-badge status-${cycle.status.toLowerCase()}">${cycle.status}</span>
                </div>
                <div class="cycle-details">
                    <p><strong>Type:</strong> ${cycle.type}</p>
                    <p><strong>Duration:</strong> ${this.formatDate(cycle.startDate)} - ${this.formatDate(cycle.endDate)}</p>
                    <p><strong>Departments:</strong> ${cycle.departments.join(', ')}</p>
                    <p class="cycle-description">${cycle.description}</p>
                </div>
                <div class="cycle-actions">
                    <button class="btn btn-sm btn-outline" onclick="performanceManager.viewCycle('${cycle.id}')">View</button>
                    <button class="btn btn-sm btn-primary" onclick="performanceManager.editCycle('${cycle.id}')">Edit</button>
                    <button class="btn btn-sm btn-success" onclick="performanceManager.startCycle('${cycle.id}')">Start</button>
                </div>
            </div>
        `).join('');
    }

    getCategories() {
        const categoryInputs = document.querySelectorAll('.category-input');
        const categories = [];
        
        categoryInputs.forEach(input => {
            const name = input.querySelector('.category-name').value;
            const score = parseFloat(input.querySelector('.category-score').value);
            const comments = input.querySelector('.category-comments').value;
            
            if (name && score) {
                categories.push({ name, score, comments });
            }
        });
        
        return categories;
    }

    getGoals() {
        const goalInputs = document.querySelectorAll('.goal-input');
        const goals = [];
        
        goalInputs.forEach(input => {
            const title = input.querySelector('.goal-title').value;
            const description = input.querySelector('.goal-description').value;
            const achieved = input.querySelector('.goal-achieved').checked;
            
            if (title) {
                goals.push({ title, description, achieved });
            }
        });
        
        return goals;
    }

    getScoreClass(score) {
        if (score >= 4.5) return 'excellent';
        if (score >= 4) return 'good';
        if (score >= 3) return 'average';
        if (score >= 2) return 'below-average';
        return 'poor';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            
            // Reset form if it exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                delete form.dataset.editId;
                
                // Reset modal title
                const modalTitle = modal.querySelector('.modal-title');
                if (modalTitle && modalId === 'evaluation-modal') {
                    modalTitle.textContent = 'Add Performance Evaluation';
                }
            }
        }
    }

    showLoader() {
        const loader = document.getElementById('performance-loader');
        if (loader) {
            loader.style.display = 'block';
        }
    }

    hideLoader() {
        const loader = document.getElementById('performance-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        const container = document.getElementById('notification-container') || document.body;
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    updateCharts() {
        // Update charts with new data if they exist
        const trendChart = Chart.getChart('performance-trend-chart');
        const departmentChart = Chart.getChart('department-performance-chart');
        
        if (trendChart) {
            // Update trend chart data
            const trendData = this.calculateTrendData();
            trendChart.data.labels = trendData.labels;
            trendChart.data.datasets[0].data = trendData.data;
            trendChart.update();
        }
        
        if (departmentChart) {
            // Update department chart data
            const departmentData = this.calculateDepartmentData();
            departmentChart.data.labels = departmentData.labels;
            departmentChart.data.datasets[0].data = departmentData.data;
            departmentChart.update();
        }
    }

    calculateTrendData() {
        // Group performance data by month
        const monthlyData = {};
        
        this.performanceData.forEach(performance => {
            const month = new Date(performance.lastReviewDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short' 
            });
            
            if (!monthlyData[month]) {
                monthlyData[month] = { total: 0, count: 0 };
            }
            
            monthlyData[month].total += performance.overallScore;
            monthlyData[month].count += 1;
        });
        
        const labels = Object.keys(monthlyData).sort();
        const data = labels.map(month => 
            (monthlyData[month].total / monthlyData[month].count).toFixed(1)
        );
        
        return { labels, data };
    }

    calculateDepartmentData() {
        // Group performance data by department
        const departmentData = {};
        
        this.performanceData.forEach(performance => {
            const dept = performance.department;
            
            if (!departmentData[dept]) {
                departmentData[dept] = { total: 0, count: 0 };
            }
            
            departmentData[dept].total += performance.overallScore;
            departmentData[dept].count += 1;
        });
        
        const labels = Object.keys(departmentData);
        const data = labels.map(dept => 
            (departmentData[dept].total / departmentData[dept].count).toFixed(1)
        );
        
        return { labels, data };
    }

    // Performance review reminder system
    checkUpcomingReviews() {
        const today = new Date();
        const upcomingReviews = this.performanceData.filter(performance => {
            if (!performance.nextReviewDate) return false;
            
            const reviewDate = new Date(performance.nextReviewDate);
            const daysDifference = Math.ceil((reviewDate - today) / (1000 * 60 * 60 * 24));
            
            return daysDifference <= 7 && daysDifference > 0;
        });
        
        if (upcomingReviews.length > 0) {
            this.showNotification(
                `${upcomingReviews.length} performance review(s) due within the next week`,
                'warning'
            );
        }
    }

    // Initialize performance reminders
    initializeReminders() {
        this.checkUpcomingReviews();
        
        // Set up periodic checks (every hour)
        setInterval(() => {
            this.checkUpcomingReviews();
        }, 3600000); // 1 hour
    }

    // Performance report generation
    generatePerformanceReport(employeeId, period) {
        const employeeData = this.performanceData.filter(p => 
            p.employeeId === employeeId && p.reviewPeriod === period
        );
        
        if (employeeData.length === 0) {
            this.showNotification('No performance data found for the selected criteria', 'warning');
            return;
        }
        
        const reportData = {
            employee: employeeData[0].employeeName,
            period: period,
            evaluations: employeeData.length,
            averageScore: (employeeData.reduce((sum, p) => sum + p.overallScore, 0) / employeeData.length).toFixed(1),
            goalAchievementRate: Math.round(
                (employeeData.reduce((sum, p) => sum + p.goalsAchieved, 0) / 
                 employeeData.reduce((sum, p) => sum + p.totalGoals, 0)) * 100
            ),
            topStrengths: this.extractTopStrengths(employeeData),
            improvementAreas: this.extractImprovementAreas(employeeData)
        };
        
        this.displayPerformanceReport(reportData);
    }

    extractTopStrengths(evaluations) {
        const strengths = [];
        evaluations.forEach(evaluation => {
            if (evaluation.achievements) {
                strengths.push(...evaluation.achievements.split(',').map(s => s.trim()));
            }
        });
        return [...new Set(strengths)].slice(0, 5);
    }

    extractImprovementAreas(evaluations) {
        const areas = [];
        evaluations.forEach(evaluation => {
            if (evaluation.areasForImprovement) {
                areas.push(...evaluation.areasForImprovement.split(',').map(s => s.trim()));
            }
        });
        return [...new Set(areas)].slice(0, 5);
    }

    displayPerformanceReport(reportData) {
        const modal = document.getElementById('performance-report-modal');
        const content = modal.querySelector('.modal-content');
        
        content.innerHTML = `
            <div class="modal-header">
                <h3>Performance Report - ${reportData.employee}</h3>
                <button class="close-btn" onclick="performanceManager.closeModal('performance-report-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="report-summary">
                    <div class="summary-item">
                        <h4>Review Period</h4>
                        <p>${reportData.period}</p>
                    </div>
                    <div class="summary-item">
                        <h4>Total Evaluations</h4>
                        <p>${reportData.evaluations}</p>
                    </div>
                    <div class="summary-item">
                        <h4>Average Score</h4>
                        <p class="${this.getScoreClass(parseFloat(reportData.averageScore))}">${reportData.averageScore}/5</p>
                    </div>
                    <div class="summary-item">
                        <h4>Goal Achievement Rate</h4>
                        <p>${reportData.goalAchievementRate}%</p>
                    </div>
                </div>
                
                <div class="report-details">
                    <div class="strengths-section">
                        <h5>Top Strengths</h5>
                        <ul>
                            ${reportData.topStrengths.map(strength => `<li>${strength}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="improvement-section">
                        <h5>Areas for Improvement</h5>
                        <ul>
                            ${reportData.improvementAreas.map(area => `<li>${area}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="performanceManager.closeModal('performance-report-modal')">Close</button>
                <button class="btn btn-primary" onclick="performanceManager.exportReport(${JSON.stringify(reportData).replace(/"/g, '&quot;')})">Export Report</button>
            </div>
        `;
        
        this.openModal('performance-report-modal');
    }

    exportReport(reportData) {
        const reportContent = `
Performance Report
==================

Employee: ${reportData.employee}
Review Period: ${reportData.period}
Total Evaluations: ${reportData.evaluations}
Average Score: ${reportData.averageScore}/5
Goal Achievement Rate: ${reportData.goalAchievementRate}%

Top Strengths:
${reportData.topStrengths.map(strength => `- ${strength}`).join('\n')}

Areas for Improvement:
${reportData.improvementAreas.map(area => `- ${area}`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `performance_report_${reportData.employee.replace(/\s+/g, '_')}_${Date.now()}.txt`;
        link.click();
    }
}

// Initialize Performance Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.performanceManager = new PerformanceManager();
});

// Handle modal close on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        window.performanceManager.closeModal(modalId);
    }
});

// Handle escape key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="display: block"]');
        if (openModal) {
            window.performanceManager.closeModal(openModal.id);
        }
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceManager;
}


    