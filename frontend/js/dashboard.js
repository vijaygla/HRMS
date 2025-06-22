// dashboard.js - Dashboard functionality

// Utility functions
const Utils = {
    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    },

    // Format date
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Show loading indicator
    showLoading: function(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading-spinner">Loading...</div>';
        }
    },

    // Hide loading indicator
    hideLoading: function(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const loading = container.querySelector('.loading-spinner');
            if (loading) {
                loading.remove();
            }
        }
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

    // Debounce function to limit execution rate
    debounce: function(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
};

// HTTP utility (assuming it exists elsewhere, but adding basic implementation)
const HTTP = {
    get: async function(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('HTTP GET error:', error);
            throw error;
        }
    }
};

// AuthService utility (basic implementation)
const AuthService = {
    protectPage: function() {
        // Basic auth check - implement according to your auth system
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Dashboard data and state
const Dashboard = {
    stats: {
        totalEmployees: 0,
        activeEmployees: 0,
        pendingLeaves: 0,
        openPositions: 0,
        monthlyPayroll: 0
    },

    charts: {},

    // Initialize dashboard
    init: function() {
        this.loadDashboardData();
        this.initializeCharts();
        this.setupRefreshInterval();
        this.bindEvents();
    },

    // Load dashboard data
    loadDashboardData: async function() {
        try {
            Utils.showLoading('dashboard-content');
            
            // Load stats
            await this.loadStats();
            
            // Load recent activities
            await this.loadRecentActivities();
            
            // Load upcoming events
            await this.loadUpcomingEvents();
            
            // Load quick stats
            await this.loadQuickStats();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            Utils.showError('Failed to load dashboard data');
        } finally {
            Utils.hideLoading('dashboard-content');
        }
    },

    // Load dashboard statistics
    loadStats: async function() {
        try {
            const [employees, leaves, recruitment, payroll] = await Promise.all([
                HTTP.get('/api/employees/stats').catch(() => ({ total: 0, active: 0 })),
                HTTP.get('/api/leaves/stats').catch(() => ({ pending: 0 })),
                HTTP.get('/api/recruitment/stats').catch(() => ({ open: 0 })),
                HTTP.get('/api/payroll/stats').catch(() => ({ monthly: 0 }))
            ]);

            this.stats = {
                totalEmployees: employees.total || 0,
                activeEmployees: employees.active || 0,
                pendingLeaves: leaves.pending || 0,
                openPositions: recruitment.open || 0,
                monthlyPayroll: payroll.monthly || 0
            };

            this.updateStatsDisplay();
            
        } catch (error) {
            console.error('Failed to load stats:', error);
            // Use default values if API fails
            this.updateStatsDisplay();
        }
    },

    // Update stats display
    updateStatsDisplay: function() {
        const statsElements = {
            'total-employees': this.stats.totalEmployees,
            'active-employees': this.stats.activeEmployees,
            'pending-leaves': this.stats.pendingLeaves,
            'open-positions': this.stats.openPositions,
            'monthly-payroll': Utils.formatCurrency(this.stats.monthlyPayroll)
        };

        Object.keys(statsElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = statsElements[id];
            }
        });

        // Update progress bars if they exist
        this.updateProgressBars();
    },

    // Update progress bars
    updateProgressBars: function() {
        // Employee utilization
        const utilizationBar = document.getElementById('employee-utilization');
        if (utilizationBar && this.stats.totalEmployees > 0) {
            const percentage = (this.stats.activeEmployees / this.stats.totalEmployees) * 100;
            utilizationBar.style.width = `${percentage}%`;
            utilizationBar.setAttribute('data-percentage', Math.round(percentage));
        }
    },

    // Load recent activities
    loadRecentActivities: async function() {
        try {
            const activities = await HTTP.get('/api/dashboard/activities');
            this.displayRecentActivities(activities);
        } catch (error) {
            console.error('Failed to load recent activities:', error);
            this.displayRecentActivities([]);
        }
    },

    // Display recent activities
    displayRecentActivities: function(activities) {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="no-data">No recent activities</p>';
            return;
        }

        const activitiesHTML = activities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="activity-content">
                    <p class="activity-description">${activity.description}</p>
                    <span class="activity-time">${Utils.formatDate(activity.timestamp)}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;
    },

    // Get activity icon based on type
    getActivityIcon: function(type) {
        const icons = {
            'employee': '👤',
            'leave': '📅',
            'payroll': '💰',
            'recruitment': '🔍',
            'performance': '📊',
            'default': '📝'
        };
        return icons[type] || icons.default;
    },

    // Load upcoming events
    loadUpcomingEvents: async function() {
        try {
            const events = await HTTP.get('/api/dashboard/events');
            this.displayUpcomingEvents(events);
        } catch (error) {
            console.error('Failed to load upcoming events:', error);
            this.displayUpcomingEvents([]);
        }
    },

    // Display upcoming events
    displayUpcomingEvents: function(events) {
        const container = document.getElementById('upcoming-events');
        if (!container) return;

        if (!events || events.length === 0) {
            container.innerHTML = '<p class="no-data">No upcoming events</p>';
            return;
        }

        const eventsHTML = events.slice(0, 5).map(event => `
            <div class="event-item">
                <div class="event-date">
                    <span class="day">${new Date(event.date).getDate()}</span>
                    <span class="month">${new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div class="event-content">
                    <h4 class="event-title">${event.title}</h4>
                    <p class="event-description">${event.description || ''}</p>
                    <span class="event-type">${event.type}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = eventsHTML;
    },

    // Load quick stats for charts
    loadQuickStats: async function() {
        try {
            const chartData = await HTTP.get('/api/dashboard/charts');
            this.updateCharts(chartData);
        } catch (error) {
            console.error('Failed to load chart data:', error);
            // Initialize with default data
            this.initializeCharts();
        }
    },

    // Initialize charts
    initializeCharts: function() {
        // Employee distribution chart
        this.initEmployeeChart();
        
        // Leave trend chart
        this.initLeaveTrendChart();
        
        // Performance chart
        this.initPerformanceChart();
    },

    // Initialize employee distribution chart
    initEmployeeChart: function() {
        const canvas = document.getElementById('employeeChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Simple pie chart implementation
        this.drawPieChart(ctx, [
            { label: 'Full-time', value: 65, color: '#007bff' },
            { label: 'Part-time', value: 25, color: '#28a745' },
            { label: 'Contract', value: 10, color: '#ffc107' }
        ]);
    },

    // Initialize leave trend chart
    initLeaveTrendChart: function() {
        const canvas = document.getElementById('leaveTrendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Simple line chart implementation
        this.drawLineChart(ctx, {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [12, 19, 15, 25, 22, 18]
        });
    },

    // Initialize performance chart
    initPerformanceChart: function() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Simple bar chart implementation
        this.drawBarChart(ctx, {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            data: [85, 88, 92, 89]
        });
    },

    // Simple pie chart drawing
    drawPieChart: function(ctx, data) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        let currentAngle = 0;
        const total = data.reduce((sum, item) => sum + item.value, 0);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        data.forEach(item => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            currentAngle += sliceAngle;
        });
    },

    // Simple line chart drawing
    drawLineChart: function(ctx, chartData) {
        const padding = 40;
        const width = ctx.canvas.width - 2 * padding;
        const height = ctx.canvas.height - 2 * padding;
        const maxValue = Math.max(...chartData.data);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw axes
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + height);
        ctx.lineTo(padding + width, padding + height);
        ctx.stroke();

        // Draw data points and lines
        ctx.strokeStyle = '#007bff';
        ctx.fillStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        chartData.data.forEach((value, index) => {
            const x = padding + (index / (chartData.data.length - 1)) * width;
            const y = padding + height - (value / maxValue) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Draw point
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        });

        ctx.stroke();
    },

    // Simple bar chart drawing
    drawBarChart: function(ctx, chartData) {
        const padding = 40;
        const width = ctx.canvas.width - 2 * padding;
        const height = ctx.canvas.height - 2 * padding;
        const maxValue = Math.max(...chartData.data);
        const barWidth = width / chartData.data.length - 10;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        chartData.data.forEach((value, index) => {
            const barHeight = (value / maxValue) * height;
            const x = padding + index * (barWidth + 10);
            const y = padding + height - barHeight;

            ctx.fillStyle = '#28a745';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw value on top
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + barWidth / 2, y - 5);
        });
    },

    // Update charts with new data
    updateCharts: function(data) {
        if (data.employeeDistribution) {
            const canvas = document.getElementById('employeeChart');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                this.drawPieChart(ctx, data.employeeDistribution);
            }
        }

        if (data.leaveTrend) {
            const canvas = document.getElementById('leaveTrendChart');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                this.drawLineChart(ctx, data.leaveTrend);
            }
        }

        if (data.performance) {
            const canvas = document.getElementById('performanceChart');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                this.drawBarChart(ctx, data.performance);
            }
        }
    },

    // Setup refresh interval
    setupRefreshInterval: function() {
        // Refresh dashboard data every 5 minutes
        setInterval(() => {
            this.loadDashboardData();
        }, 5 * 60 * 1000);
    },

    // Bind dashboard events
    bindEvents: function() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
            });
        }

        // Quick action buttons
        this.bindQuickActions();

        // Filter events
        this.bindFilterEvents();
    },

    // Bind quick action buttons
    bindQuickActions: function() {
        const quickActions = {
            'add-employee': () => window.location.href = 'employees.html?action=add',
            'view-leaves': () => window.location.href = 'leaves.html',
            'run-payroll': () => window.location.href = 'payroll.html?action=run',
            'post-job': () => window.location.href = 'recruitment.html?action=post'
        };

        Object.keys(quickActions).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', quickActions[id]);
            }
        });
    },

    // Bind filter events
    bindFilterEvents: function() {
        const timeFilter = document.getElementById('time-filter');
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.filterDashboardData(e.target.value);
            });
        }

        const departmentFilter = document.getElementById('department-filter');
        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.filterByDepartment(e.target.value);
            });
        }
    },

    // Filter dashboard data by time period
    filterDashboardData: function(period) {
        // Add query parameter for filtering
        const url = new URL(window.location);
        url.searchParams.set('period', period);
        window.history.pushState({}, '', url);
        
        // Reload data with filters
        this.loadDashboardData();
    },

    // Filter by department
    filterByDepartment: function(department) {
        // Add query parameter for filtering
        const url = new URL(window.location);
        if (department) {
            url.searchParams.set('department', department);
        } else {
            url.searchParams.delete('department');
        }
        window.history.pushState({}, '', url);
        
        // Reload data with filters
        this.loadDashboardData();
    },

    // Export dashboard data
    exportData: function(format = 'pdf') {
        const exportBtn = document.getElementById('export-dashboard');
        if (exportBtn) {
            exportBtn.textContent = 'Exporting...';
            exportBtn.disabled = true;
        }

        // Simulate export process
        setTimeout(() => {
            Utils.showSuccess(`Dashboard exported as ${format.toUpperCase()}`);
            
            if (exportBtn) {
                exportBtn.textContent = 'Export';
                exportBtn.disabled = false;
            }
        }, 2000);
    }
};

// Quick stats widget
const QuickStats = {
    // Update attendance stats
    updateAttendanceStats: async function() {
        try {
            const attendance = await HTTP.get('/api/dashboard/attendance');
            const container = document.getElementById('attendance-stats');
            
            if (container && attendance) {
                container.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Present Today</span>
                        <span class="stat-value">${attendance.present || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Absent</span>
                        <span class="stat-value">${attendance.absent || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Late</span>
                        <span class="stat-value">${attendance.late || 0}</span>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load attendance stats:', error);
        }
    },

    // Update birthday notifications
    updateBirthdays: async function() {
        try {
            const birthdays = await HTTP.get('/api/dashboard/birthdays');
            const container = document.getElementById('birthday-notifications');
            
            if (container) {
                if (!birthdays || birthdays.length === 0) {
                    container.innerHTML = '<p class="no-data">No birthdays today</p>';
                    return;
                }

                const birthdayHTML = birthdays.map(person => `
                    <div class="birthday-item">
                        <span class="birthday-icon">🎂</span>
                        <span class="birthday-name">${person.name}</span>
                        <span class="birthday-dept">${person.department}</span>
                    </div>
                `).join('');

                container.innerHTML = birthdayHTML;
            }
        } catch (error) {
            console.error('Failed to load birthdays:', error);
        }
    },

    // Update announcements
    updateAnnouncements: async function() {
        try {
            const announcements = await HTTP.get('/api/dashboard/announcements');
            const container = document.getElementById('announcements');
            
            if (container) {
                if (!announcements || announcements.length === 0) {
                    container.innerHTML = '<p class="no-data">No announcements</p>';
                    return;
                }

                const announcementHTML = announcements.slice(0, 3).map(announcement => `
                    <div class="announcement-item">
                        <h4 class="announcement-title">${announcement.title}</h4>
                        <p class="announcement-content">${announcement.content}</p>
                        <span class="announcement-date">${Utils.formatDate(announcement.createdAt)}</span>
                    </div>
                `).join('');

                container.innerHTML = announcementHTML;
            }
        } catch (error) {
            console.error('Failed to load announcements:', error);
        }
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!AuthService.protectPage()) {
        return;
    }

    // Initialize dashboard
    Dashboard.init();
    
    // Initialize quick stats
    QuickStats.updateAttendanceStats();
    QuickStats.updateBirthdays();
    QuickStats.updateAnnouncements();

    // Bind export functionality
    const exportBtn = document.getElementById('export-dashboard');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            Dashboard.exportData('pdf');
        });
    }

    // Handle window resize for charts
    window.addEventListener('resize', Utils.debounce(() => {
        Dashboard.initializeCharts();
    }, 300));
});

// Export for use in other files
window.Dashboard = Dashboard;
window.QuickStats = QuickStats;
window.Utils = Utils;

