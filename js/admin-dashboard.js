// Enhanced Admin Dashboard JavaScript
// Garcia Builder - Administrative Panel Management

class AdminDashboard {
    constructor() {
        this.charts = {};
        this.initAdminFeatures();
    }

    initAdminFeatures() {
        // Check admin permissions
        if (!window.enhancedAuth.hasPermission('all')) {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'dashboard.html';
            return;
        }

        this.loadAdminData();
        this.setupAdminEventListeners();
        this.initializeAdminCharts();
        this.setupTabNavigation();
    }

    setupTabNavigation() {
        // Main dashboard navigation
        const navItems = document.querySelectorAll('.nav-item[data-tab]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                const tabName = item.getAttribute('data-tab');
                this.switchTab(tabName);

                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    switchTab(tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));

        // Show target tab
        const targetTab = document.getElementById(tabName + '-content');
        if (targetTab) {
            targetTab.classList.add('active');
            this.currentTab = tabName;

            // Load tab-specific data
            this.loadTabData(tabName);
        }
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                this.loadAdminData();
                break;
            case 'users':
                this.loadUsersData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            default:
                console.log('Loading data for tab:', tabName);
        }
    }

    loadAdminData() {
        // Load all users and populate statistics
        try {
            const allUsers = window.enhancedAuth.getAllUsers();
            this.updateUserStatistics(allUsers);
            this.populateUsersTable(allUsers);
            this.updateSystemActivity();
        } catch (error) {
            console.error('Error loading admin data:', error);
            this.showNotification('Error loading admin data: ' + error.message, 'error');
        }
    }

    loadUsersData() {
        try {
            const allUsers = window.enhancedAuth.getAllUsers();
            this.populateUsersTable(allUsers);
        } catch (error) {
            console.error('Error loading users data:', error);
        }
    }

    loadAnalyticsData() {
        // Update charts with current data
        this.updateUserChartsData(window.enhancedAuth.getAllUsers());
    }

    updateUserStatistics(users) {
        const totalUsers = users.length;
        const trainers = users.filter(u => u.role === 'trainer').length;
        const clients = users.filter(u => u.role === 'client').length;

        // Update count displays safely
        const totalUsersEl = document.getElementById('totalUsersCount');
        const trainersEl = document.getElementById('trainersCount');
        const clientsEl = document.getElementById('clientsCount');
        const userCountEl = document.getElementById('userCount');

        if (totalUsersEl) totalUsersEl.textContent = totalUsers;
        if (trainersEl) trainersEl.textContent = trainers;
        if (clientsEl) clientsEl.textContent = clients;
        if (userCountEl) userCountEl.textContent = totalUsers;

        // Update charts if available
        this.updateUserChartsData(users);
    }

    populateUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => {
            const userAvatarUrl = user.avatar_url || 'assets/avatar-default.jpg';
            const userName = user.full_name || 'Unknown User';
            const userRole = user.role || 'client';
            const userStatus = user.status || 'active';
            const joinDate = new Date(user.created_at).toLocaleDateString();

            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <img src="${userAvatarUrl}"
                                 alt="${userName}"
                                 style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <strong style="color: var(--text-primary);">${userName}</strong>
                                <br>
                                <small style="color: var(--text-secondary);">@${user.username || ''}</small>
                            </div>
                        </div>
                    </td>
                    <td style="color: var(--text-secondary);">${user.email || ''}</td>
                    <td>
                        <span class="user-role-badge role-${userRole}">
                            ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge status-${userStatus}">
                            ${userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                        </span>
                    </td>
                    <td style="color: var(--text-secondary);">
                        ${joinDate}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" onclick="adminDashboard.editUser('${user.id}')" title="Edit User">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-view" onclick="adminDashboard.viewUser('${user.id}')" title="View Profile">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${userRole !== 'admin' ? `
                                <button class="btn-action btn-delete" onclick="adminDashboard.deleteUser('${user.id}')" title="Delete User">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                            <button class="btn-action btn-role" onclick="adminDashboard.changeRole('${user.id}')" title="Change Role">
                                <i class="fas fa-user-cog"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateSystemActivity() {
        const activities = [
            {
                type: 'user',
                icon: 'fas fa-user-plus',
                color: 'var(--success-green)',
                title: 'New User Registration:',
                description: 'John Smith joined as client',
                time: '15 minutes ago'
            },
            {
                type: 'payment',
                icon: 'fas fa-credit-card',
                color: 'var(--primary-gold)',
                title: 'Payment Received:',
                description: '£175 - Premium Plan (Maria Silva)',
                time: '1 hour ago'
            },
            {
                type: 'trainer',
                icon: 'fas fa-user-tie',
                color: 'var(--primary-gold)',
                title: 'Trainer Update:',
                description: 'Maria Silva updated client program',
                time: '2 hours ago'
            },
            {
                type: 'system',
                icon: 'fas fa-cog',
                color: 'var(--text-secondary)',
                title: 'System Backup:',
                description: 'Daily backup completed successfully',
                time: '3 hours ago'
            },
            {
                type: 'newsletter',
                icon: 'fas fa-envelope',
                color: 'var(--primary-gold)',
                title: 'Newsletter Sent:',
                description: 'Weekly newsletter sent to 847 subscribers',
                time: '5 hours ago'
            }
        ];

        const activityFeed = document.getElementById('systemActivityFeed');
        if (activityFeed) {
            activityFeed.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${activity.icon}" style="color: ${activity.color};"></i>
                    </div>
                    <div class="activity-content">
                        <strong>${activity.title}</strong> ${activity.description}
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    setupAdminEventListeners() {
        // Quick action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // Add user form submission
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAddUser();
            });
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-user':
                this.showAddUserModal();
                break;
            case 'send-newsletter':
                this.sendNewsletter();
                break;
            case 'backup-data':
                this.backupData();
                break;
            default:
                console.log('Quick action:', action);
        }
    }

    showAddUserModal() {
        const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
        modal.show();
    }

    addUser() {
        this.showAddUserModal();
    }

    submitAddUser() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);

        const userData = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password'),
            role: formData.get('role'),
            phone: formData.get('phone')
        };

        try {
            // Use the enhanced auth system to register the user
            window.enhancedAuth.register(userData);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            modal.hide();

            // Reset form
            form.reset();

            // Refresh data
            this.loadAdminData();

            this.showNotification('User ' + userData.full_name + ' added successfully!', 'success');
        } catch (error) {
            this.showNotification('Error adding user: ' + error.message, 'error');
        }
    }

    editUser(userId) {
        const users = window.enhancedAuth.getAllUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // For now, show user info in alert - in real app, this would open an edit modal
        const userInfo = [
            'Edit User: ' + user.full_name,
            'Email: ' + user.email,
            'Role: ' + user.role,
            'Status: ' + (user.status || 'active')
        ].join('\n');

        alert(userInfo + '\n\nEdit functionality coming soon...');
    }

    viewUser(userId) {
        const user = window.enhancedAuth.getUserProfile(userId);
        if (!user) return;

        // Show user profile info
        const profile = user.profile || {};
        const userInfoLines = [
            'User Profile: ' + user.full_name,
            'Email: ' + user.email,
            'Role: ' + user.role,
            'Phone: ' + (user.phone || 'Not provided'),
            'Location: ' + (profile.location || 'Not provided'),
            'Bio: ' + (profile.bio || 'Not provided'),
            'Goals: ' + ((profile.goals || []).join(', ') || 'None set'),
            'Experience: ' + (profile.experience_level || 'Not specified'),
            'Joined: ' + new Date(user.created_at).toLocaleDateString()
        ];

        alert(userInfoLines.join('\n'));
    }

    deleteUser(userId) {
        const users = window.enhancedAuth.getAllUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const confirmMsg = 'Are you sure you want to delete user "' + user.full_name + '"? This action cannot be undone.';
        if (confirm(confirmMsg)) {
            try {
                window.enhancedAuth.deleteUser(userId);
                this.loadAdminData();
                this.showNotification('User ' + user.full_name + ' deleted successfully.', 'success');
            } catch (error) {
                this.showNotification('Error deleting user: ' + error.message, 'error');
            }
        }
    }

    changeRole(userId) {
        const users = window.enhancedAuth.getAllUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const roles = ['client', 'trainer', 'admin'];
        const currentRole = user.role;
        const availableRoles = roles.filter(role => role !== currentRole);

        const promptMsg = [
            'Change role for ' + user.full_name,
            'Current role: ' + currentRole,
            '',
            'Enter new role (' + availableRoles.join(', ') + '):'
        ].join('\n');

        const newRole = prompt(promptMsg, availableRoles[0]);

        if (newRole && roles.includes(newRole.toLowerCase())) {
            try {
                window.enhancedAuth.updateUserRole(userId, newRole.toLowerCase());
                this.loadAdminData();
                this.showNotification('Role changed to ' + newRole + ' for ' + user.full_name, 'success');
            } catch (error) {
                this.showNotification('Error changing role: ' + error.message, 'error');
            }
        } else if (newRole) {
            alert('Invalid role. Please choose from: ' + availableRoles.join(', '));
        }
    }

    refreshUsers() {
        this.loadAdminData();
        this.showNotification('User data refreshed', 'success');
    }

    exportUsers() {
        try {
            const users = window.enhancedAuth.getAllUsers();
            const csvContent = this.convertToCSV(users);
            this.downloadCSV(csvContent, 'garcia-builder-users.csv');
            this.showNotification('Users exported successfully', 'success');
        } catch (error) {
            this.showNotification('Error exporting users: ' + error.message, 'error');
        }
    }

    convertToCSV(users) {
        const headers = ['Full Name', 'Email', 'Username', 'Role', 'Phone', 'Status', 'Created Date', 'Last Login'];
        const csvRows = [headers.join(',')];

        users.forEach(user => {
            const row = [
                '"' + (user.full_name || '') + '"',
                '"' + (user.email || '') + '"',
                '"' + (user.username || '') + '"',
                '"' + (user.role || '') + '"',
                '"' + (user.phone || '') + '"',
                '"' + (user.status || 'active') + '"',
                '"' + new Date(user.created_at).toLocaleDateString() + '"',
                '"' + new Date(user.last_login).toLocaleDateString() + '"'
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    sendNewsletter() {
        const confirmed = confirm('Send newsletter to all subscribers? This action will send emails immediately.');
        if (confirmed) {
            // Simulate newsletter sending
            this.showNotification('Sending newsletter...', 'info');
            setTimeout(() => {
                this.showNotification('Newsletter sent to 847 subscribers', 'success');
            }, 1000);
        }
    }

    backupData() {
        // Simulate data backup
        this.showNotification('Creating backup...', 'info');

        setTimeout(() => {
            const backupData = {
                users: window.enhancedAuth.getAllUsers(),
                profiles: JSON.parse(localStorage.getItem('gb_user_profiles') || '{}'),
                timestamp: new Date().toISOString(),
                version: '2.0'
            };

            const backupContent = JSON.stringify(backupData, null, 2);
            const filename = 'garcia-builder-backup-' + new Date().toISOString().split('T')[0] + '.json';
            this.downloadCSV(backupContent, filename);
            this.showNotification('Backup completed successfully', 'success');
        }, 2000);
    }

    initializeAdminCharts() {
        // User Growth Chart
        this.initUserGrowthChart();
        // User Types Chart
        this.initUserTypesChart();
    }

    initUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;

        // Mock data for user growth
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const userData = [10, 25, 45, 67, 89, 112];

        this.charts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Users',
                    data: userData,
                    borderColor: '#F6C84E',
                    backgroundColor: 'rgba(246, 200, 78, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    initUserTypesChart() {
        const ctx = document.getElementById('userTypesChart');
        if (!ctx) return;

        const users = window.enhancedAuth.getAllUsers();
        const roleCount = {
            client: users.filter(u => u.role === 'client').length,
            trainer: users.filter(u => u.role === 'trainer').length,
            admin: users.filter(u => u.role === 'admin').length
        };

        this.charts.userTypes = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Clients', 'Trainers', 'Admins'],
                datasets: [{
                    data: [roleCount.client, roleCount.trainer, roleCount.admin],
                    backgroundColor: [
                        '#28a745',
                        '#F6C84E',
                        '#dc3545'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    updateUserChartsData(users) {
        // Update user types chart with real data
        if (this.charts.userTypes) {
            const roleCount = {
                client: users.filter(u => u.role === 'client').length,
                trainer: users.filter(u => u.role === 'trainer').length,
                admin: users.filter(u => u.role === 'admin').length
            };

            this.charts.userTypes.data.datasets[0].data = [
                roleCount.client,
                roleCount.trainer,
                roleCount.admin
            ];
            this.charts.userTypes.update();
        }
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;

        const iconClass = type === 'success' ? 'check-circle' :
                         type === 'error' ? 'exclamation-circle' : 'info-circle';

        notification.innerHTML = [
            '<div class="notification-content">',
            '<i class="fas fa-' + iconClass + '"></i>',
            '<span>' + message + '</span>',
            '</div>',
            '<button class="notification-close">',
            '<i class="fas fa-times"></i>',
            '</button>'
        ].join('');

        // Add styles
        const bgColor = type === 'success' ? 'var(--success-green)' :
                       type === 'error' ? 'var(--danger-red)' : 'var(--primary-gold)';

        notification.style.cssText = [
            'position: fixed',
            'top: 20px',
            'right: 20px',
            'background: ' + bgColor,
            'color: white',
            'padding: 1rem 1.5rem',
            'border-radius: 12px',
            'z-index: 10000',
            'display: flex',
            'align-items: center',
            'justify-content: space-between',
            'gap: 1rem',
            'min-width: 300px',
            'box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2)',
            'animation: slideInRight 0.3s ease'
        ].join(';');

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        document.body.appendChild(notification);
    }
}

// Add admin-specific styles
const adminStyles = document.createElement('style');
adminStyles.textContent = [
    '.status-badge {',
    '    padding: 0.25rem 0.5rem;',
    '    border-radius: 12px;',
    '    font-size: 0.7rem;',
    '    font-weight: 600;',
    '    text-transform: uppercase;',
    '}',
    '.status-active {',
    '    background: rgba(40, 167, 69, 0.2);',
    '    color: var(--success-green);',
    '    border: 1px solid var(--success-green);',
    '}',
    '.status-inactive {',
    '    background: rgba(220, 53, 69, 0.2);',
    '    color: var(--danger-red);',
    '    border: 1px solid var(--danger-red);',
    '}',
    '.action-buttons {',
    '    display: flex;',
    '    gap: 0.5rem;',
    '}',
    '.btn-action {',
    '    background: rgba(255, 255, 255, 0.05);',
    '    border: 1px solid rgba(255, 255, 255, 0.2);',
    '    color: var(--text-secondary);',
    '    padding: 0.375rem;',
    '    border-radius: 6px;',
    '    cursor: pointer;',
    '    transition: all 0.3s ease;',
    '    font-size: 0.8rem;',
    '    width: 32px;',
    '    height: 32px;',
    '    display: flex;',
    '    align-items: center;',
    '    justify-content: center;',
    '}',
    '.btn-action:hover {',
    '    background: rgba(255, 255, 255, 0.1);',
    '    color: var(--text-primary);',
    '}',
    '.btn-edit:hover {',
    '    color: var(--primary-gold);',
    '    border-color: var(--primary-gold);',
    '}',
    '.btn-view:hover {',
    '    color: var(--success-green);',
    '    border-color: var(--success-green);',
    '}',
    '.btn-delete:hover {',
    '    color: var(--danger-red);',
    '    border-color: var(--danger-red);',
    '}',
    '.btn-role:hover {',
    '    color: var(--warning-orange);',
    '    border-color: var(--warning-orange);',
    '}',
    '.modal-content {',
    '    backdrop-filter: blur(20px);',
    '}',
    '.form-group {',
    '    margin-bottom: 1rem;',
    '}',
    '.form-label {',
    '    color: var(--text-primary);',
    '    font-weight: 500;',
    '    margin-bottom: 0.5rem;',
    '    display: block;',
    '}',
    '.form-control {',
    '    background: rgba(255, 255, 255, 0.05);',
    '    border: 1px solid rgba(246, 200, 78, 0.3);',
    '    color: var(--text-primary);',
    '    padding: 0.75rem;',
    '    border-radius: 8px;',
    '    width: 100%;',
    '}',
    '.form-control:focus {',
    '    background: rgba(255, 255, 255, 0.08);',
    '    border-color: var(--primary-gold);',
    '    box-shadow: 0 0 0 2px rgba(246, 200, 78, 0.2);',
    '    outline: none;',
    '}',
    '.form-control::placeholder {',
    '    color: var(--text-secondary);',
    '}',
    '.notification-content {',
    '    display: flex;',
    '    align-items: center;',
    '    gap: 0.5rem;',
    '}',
    '.notification-close {',
    '    background: none;',
    '    border: none;',
    '    color: white;',
    '    cursor: pointer;',
    '    padding: 0.25rem;',
    '    border-radius: 4px;',
    '    transition: background 0.3s ease;',
    '}',
    '.notification-close:hover {',
    '    background: rgba(0, 0, 0, 0.2);',
    '}',
    '@keyframes slideInRight {',
    '    from {',
    '        transform: translateX(100%);',
    '        opacity: 0;',
    '    }',
    '    to {',
    '        transform: translateX(0);',
    '        opacity: 1;',
    '    }',
    '}'
].join('\n');
document.head.appendChild(adminStyles);

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!window.enhancedAuth || !window.enhancedAuth.currentUser) {
        console.warn('No authenticated user found, redirecting to login...');
        window.location.href = 'login.html';
        return;
    }

    // Check admin role
    if (window.enhancedAuth.currentUser.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'dashboard.html';
        return;
    }

    // Initialize admin dashboard
    window.adminDashboard = new AdminDashboard();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}

        // Filter buttons
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyLeadFilters();
        });

        document.getElementById('applySubscriberFilters')?.addEventListener('click', () => {
            this.applySubscriberFilters();
        });

        // Export buttons
        document.getElementById('exportLeads')?.addEventListener('click', () => {
            this.exportLeads();
        });

        document.getElementById('exportSubscribers')?.addEventListener('click', () => {
            this.exportSubscribers();
        });

        // Search inputs
        document.getElementById('searchLeads')?.addEventListener('input',
            this.debounce(() => this.applyLeadFilters(), 300)
        );

        document.getElementById('searchSubscribers')?.addEventListener('input',
            this.debounce(() => this.applySubscriberFilters(), 300)
        );

        // Campaign buttons
        document.getElementById('newCampaignBtn')?.addEventListener('click', () => {
            this.showCampaignModal();
        });

        document.getElementById('createCampaign')?.addEventListener('click', () => {
            this.showCampaignModal();
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`)?.classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'leads':
                await this.loadLeadsData();
                break;
            case 'newsletter':
                await this.loadNewsletterData();
                break;
            case 'campaigns':
                await this.loadCampaignsData();
                break;
            case 'analytics':
                await this.loadAnalyticsData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            const [leadsData, subscribersData, conversionsData] = await Promise.all([
                this.getLeadsStats(),
                this.getSubscribersStats(),
                this.getConversionsStats()
            ]);

            this.updateDashboardStats(leadsData, subscribersData, conversionsData);
            await this.loadRecentActivity();
            this.updateCharts();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async getLeadsStats() {
        if (this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('leads')
                    .select('*');

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('Error fetching leads from Supabase:', error);
            }
        }

        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('garcia_leads') || '[]');
    }

    async getSubscribersStats() {
        if (this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('newsletter_subscribers')
                    .select('*');

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('Error fetching subscribers from Supabase:', error);
            }
        }

        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('garcia_newsletter_subscribers') || '[]');
    }

    async getConversionsStats() {
        if (this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('conversion_events')
                    .select('*');

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('Error fetching conversions from Supabase:', error);
            }
        }

        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('garcia_conversions') || '[]');
    }

    updateDashboardStats(leads, subscribers, conversions) {
        const totalLeads = leads.length;
        const totalSubscribers = subscribers.filter(s => s.status === 'subscribed').length;
        const totalConversions = leads.filter(l => l.status === 'converted').length;
        const conversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : 0;

        document.getElementById('totalLeads').textContent = totalLeads;
        document.getElementById('totalSubscribers').textContent = totalSubscribers;
        document.getElementById('totalConversions').textContent = totalConversions;
        document.getElementById('conversionRate').textContent = `${conversionRate}%`;
    }

    async loadRecentActivity() {
        const leads = await this.getLeadsStats();
        const subscribers = await this.getSubscribersStats();

        // Recent leads
        const recentLeads = leads
            .sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp))
            .slice(0, 5);

        const recentLeadsContainer = document.getElementById('recentLeads');
        if (recentLeadsContainer) {
            recentLeadsContainer.innerHTML = recentLeads.map(lead => `
                <div class="activity-item d-flex align-items-center">
                    <div class="activity-icon activity-icon-primary">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${lead.name || 'Lead sem nome'}</div>
                        <div class="activity-meta">
                            ${lead.email} • ${lead.source || 'Fonte desconhecida'} •
                            ${this.formatDate(lead.created_at || lead.timestamp)}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Recent subscribers
        const recentSubscribers = subscribers
            .sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp))
            .slice(0, 5);

        const recentSubscribersContainer = document.getElementById('recentSubscribers');
        if (recentSubscribersContainer) {
            recentSubscribersContainer.innerHTML = recentSubscribers.map(subscriber => `
                <div class="activity-item d-flex align-items-center">
                    <div class="activity-icon activity-icon-success">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${subscriber.name || 'Subscriber'}</div>
                        <div class="activity-meta">
                            ${subscriber.email} • ${subscriber.source || 'Newsletter'} •
                            ${this.formatDate(subscriber.created_at || subscriber.timestamp)}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    async loadLeadsData() {
        const leads = await this.getLeadsStats();
        this.renderLeadsTable(leads);
    }

    renderLeadsTable(leads) {
        const tableBody = document.getElementById('leadsTableBody');
        if (!tableBody) return;

        if (leads.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="empty-state-title">Nenhum lead encontrado</div>
                            <div class="empty-state-description">Os leads aparecerão aqui quando começarem a se inscrever</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = leads.map(lead => `
            <tr>
                <td>${lead.name || '-'}</td>
                <td>${lead.email}</td>
                <td>${lead.goal || '-'}</td>
                <td>${lead.source || 'Desconhecida'}</td>
                <td>
                    <span class="status-badge status-${lead.status || 'new'}">
                        ${this.getStatusLabel(lead.status || 'new')}
                    </span>
                </td>
                <td>${this.formatDate(lead.created_at || lead.timestamp)}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="adminDashboard.viewLead('${lead.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success btn-action" onclick="adminDashboard.contactLead('${lead.id}')">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="adminDashboard.deleteLead('${lead.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadNewsletterData() {
        const subscribers = await this.getSubscribersStats();
        this.renderSubscribersTable(subscribers);
        this.updateNewsletterStats(subscribers);
    }

    updateNewsletterStats(subscribers) {
        const active = subscribers.filter(s => s.status === 'subscribed').length;
        const thisMonth = subscribers.filter(s => {
            const date = new Date(s.created_at || s.timestamp);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        const unsubscribed = subscribers.filter(s => s.status === 'unsubscribed').length;
        const growthRate = subscribers.length > 0 ? ((thisMonth / subscribers.length) * 100).toFixed(1) : 0;

        document.getElementById('activeSubscribers').textContent = active;
        document.getElementById('newSubscribersMonth').textContent = thisMonth;
        document.getElementById('unsubscribedMonth').textContent = unsubscribed;
        document.getElementById('growthRate').textContent = `${growthRate}%`;
    }

    renderSubscribersTable(subscribers) {
        const tableBody = document.getElementById('subscribersTableBody');
        if (!tableBody) return;

        if (subscribers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="empty-state-title">Nenhum inscrito encontrado</div>
                            <div class="empty-state-description">Os inscritos da newsletter aparecerão aqui</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = subscribers.map(subscriber => `
            <tr>
                <td>${subscriber.name || '-'}</td>
                <td>${subscriber.email}</td>
                <td>${subscriber.source || 'Newsletter'}</td>
                <td>
                    <span class="status-badge status-${subscriber.status || 'subscribed'}">
                        ${this.getStatusLabel(subscriber.status || 'subscribed')}
                    </span>
                </td>
                <td>${this.formatDate(subscriber.created_at || subscriber.timestamp)}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-action" onclick="adminDashboard.editSubscriber('${subscriber.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="adminDashboard.unsubscribe('${subscriber.id}')">
                        <i class="fas fa-user-times"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadCampaignsData() {
        // This would load email campaigns from database
        // For now, show placeholder
        const campaignsContainer = document.getElementById('campaignsList');
        if (campaignsContainer) {
            campaignsContainer.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-bullhorn"></i>
                        </div>
                        <div class="empty-state-title">Nenhuma campanha criada</div>
                        <div class="empty-state-description">Crie sua primeira campanha de email</div>
                        <button class="btn btn-primary mt-3" onclick="adminDashboard.showCampaignModal()">
                            <i class="fas fa-plus me-2"></i>Nova Campanha
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async loadAnalyticsData() {
        const leads = await this.getLeadsStats();
        const subscribers = await this.getSubscribersStats();

        this.renderAnalyticsCharts(leads, subscribers);
        this.renderPerformanceTable(leads, subscribers);
    }

    renderAnalyticsCharts(leads, subscribers) {
        // Conversion by source chart
        this.renderConversionBySourceChart(leads);

        // Newsletter performance chart
        this.renderNewsletterPerformanceChart(subscribers);
    }

    renderConversionBySourceChart(leads) {
        const ctx = document.getElementById('conversionBySourceChart');
        if (!ctx) return;

        const sources = {};
        leads.forEach(lead => {
            const source = lead.source || 'Desconhecida';
            if (!sources[source]) {
                sources[source] = { total: 0, converted: 0 };
            }
            sources[source].total++;
            if (lead.status === 'converted') {
                sources[source].converted++;
            }
        });

        const labels = Object.keys(sources);
        const data = labels.map(source =>
            sources[source].total > 0 ?
            (sources[source].converted / sources[source].total * 100).toFixed(1) : 0
        );

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Taxa de Conversão (%)',
                    data,
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe',
                        '#00f2fe'
                    ]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    renderNewsletterPerformanceChart(subscribers) {
        const ctx = document.getElementById('newsletterPerformanceChart');
        if (!ctx) return;

        // Group by month
        const monthlyData = {};
        subscribers.forEach(sub => {
            const date = new Date(sub.created_at || sub.timestamp);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const labels = sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(year, monthNum - 1).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'short'
            });
        });
        const data = sortedMonths.map(month => monthlyData[month]);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Novos Inscritos',
                    data,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderPerformanceTable(leads, subscribers) {
        const tableBody = document.getElementById('performanceTableBody');
        if (!tableBody) return;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

        const metrics = [
            {
                name: 'Novos Leads',
                today: this.countByPeriod(leads, today),
                week: this.countByPeriod(leads, weekAgo),
                month: this.countByPeriod(leads, monthAgo),
                quarter: this.countByPeriod(leads, quarterAgo)
            },
            {
                name: 'Conversões',
                today: this.countByPeriod(leads.filter(l => l.status === 'converted'), today),
                week: this.countByPeriod(leads.filter(l => l.status === 'converted'), weekAgo),
                month: this.countByPeriod(leads.filter(l => l.status === 'converted'), monthAgo),
                quarter: this.countByPeriod(leads.filter(l => l.status === 'converted'), quarterAgo)
            },
            {
                name: 'Inscrições Newsletter',
                today: this.countByPeriod(subscribers, today),
                week: this.countByPeriod(subscribers, weekAgo),
                month: this.countByPeriod(subscribers, monthAgo),
                quarter: this.countByPeriod(subscribers, quarterAgo)
            }
        ];

        tableBody.innerHTML = metrics.map(metric => `
            <tr>
                <td><strong>${metric.name}</strong></td>
                <td>${metric.today}</td>
                <td>${metric.week}</td>
                <td>${metric.month}</td>
                <td>${metric.quarter}</td>
            </tr>
        `).join('');
    }

    countByPeriod(items, since) {
        return items.filter(item => {
            const itemDate = new Date(item.created_at || item.timestamp);
            return itemDate >= since;
        }).length;
    }

    initializeCharts() {
        // Initialize dashboard charts
        this.initLeadsChart();
        this.initSourcesChart();
    }

    initLeadsChart() {
        const ctx = document.getElementById('leadsChart');
        if (!ctx) return;

        // Placeholder chart - will be updated with real data
        this.charts.leads = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Leads',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initSourcesChart() {
        const ctx = document.getElementById('sourcesChart');
        if (!ctx) return;

        this.charts.sources = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Hero Form', 'Exit Intent', 'Contato', 'Download'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#4facfe'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts() {
        // Update charts with real data
        // This will be called after loading actual data
    }

    // Lead actions
    async viewLead(leadId) {
        const leads = await this.getLeadsStats();
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        const modalContent = document.getElementById('leadDetailsContent');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Nome</label>
                            <input type="text" class="form-control" value="${lead.name || ''}" id="editLeadName">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" value="${lead.email}" id="editLeadEmail">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Telefone</label>
                            <input type="text" class="form-control" value="${lead.phone || ''}" id="editLeadPhone">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Objetivo</label>
                            <select class="form-select" id="editLeadGoal">
                                <option value="">Selecione...</option>
                                <option value="weight_loss" ${lead.goal === 'weight_loss' ? 'selected' : ''}>Perder Peso</option>
                                <option value="muscle_gain" ${lead.goal === 'muscle_gain' ? 'selected' : ''}>Ganhar Músculos</option>
                                <option value="fitness" ${lead.goal === 'fitness' ? 'selected' : ''}>Manter Forma</option>
                                <option value="health" ${lead.goal === 'health' ? 'selected' : ''}>Melhorar Saúde</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Status</label>
                            <select class="form-select" id="editLeadStatus">
                                <option value="new" ${lead.status === 'new' ? 'selected' : ''}>Novo</option>
                                <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contatado</option>
                                <option value="qualified" ${lead.status === 'qualified' ? 'selected' : ''}>Qualificado</option>
                                <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Convertido</option>
                                <option value="closed" ${lead.status === 'closed' ? 'selected' : ''}>Fechado</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Fonte</label>
                            <input type="text" class="form-control" value="${lead.source || ''}" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Data de Criação</label>
                            <input type="text" class="form-control" value="${this.formatDate(lead.created_at || lead.timestamp)}" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Notas</label>
                            <textarea class="form-control" rows="3" id="editLeadNotes">${lead.notes || ''}</textarea>
                        </div>
                    </div>
                </div>
                ${lead.message ? `
                    <div class="row">
                        <div class="col-12">
                            <div class="mb-3">
                                <label class="form-label">Mensagem</label>
                                <div class="alert alert-info">${lead.message}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            `;

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('leadDetailsModal'));
            modal.show();

            // Store lead ID for updates
            document.getElementById('updateLeadBtn').dataset.leadId = leadId;
        }
    }

    async contactLead(leadId) {
        // Update lead status to contacted
        await this.updateLeadStatus(leadId, 'contacted');
        this.showSuccess('Lead marcado como contatado');
        this.loadLeadsData();
    }

    async deleteLead(leadId) {
        if (confirm('Tem certeza que deseja excluir este lead?')) {
            try {
                if (this.supabase) {
                    const { error } = await this.supabase
                        .from('leads')
                        .delete()
                        .eq('id', leadId);

                    if (error) throw error;
                } else {
                    // Remove from localStorage
                    const leads = JSON.parse(localStorage.getItem('garcia_leads') || '[]');
                    const updatedLeads = leads.filter(l => l.id !== leadId);
                    localStorage.setItem('garcia_leads', JSON.stringify(updatedLeads));
                }

                this.showSuccess('Lead excluído com sucesso');
                this.loadLeadsData();
            } catch (error) {
                console.error('Error deleting lead:', error);
                this.showError('Erro ao excluir lead');
            }
        }
    }

    async updateLeadStatus(leadId, status) {
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('leads')
                    .update({ status, updated_at: new Date().toISOString() })
                    .eq('id', leadId);

                if (error) throw error;
            } else {
                // Update in localStorage
                const leads = JSON.parse(localStorage.getItem('garcia_leads') || '[]');
                const leadIndex = leads.findIndex(l => l.id === leadId);
                if (leadIndex !== -1) {
                    leads[leadIndex].status = status;
                    leads[leadIndex].updated_at = new Date().toISOString();
                    localStorage.setItem('garcia_leads', JSON.stringify(leads));
                }
            }
        } catch (error) {
            console.error('Error updating lead status:', error);
            throw error;
        }
    }

    // Filter methods
    async applyLeadFilters() {
        const status = document.getElementById('filterStatus')?.value || '';
        const source = document.getElementById('filterSource')?.value || '';
        const dateFilter = document.getElementById('filterDate')?.value || '';
        const search = document.getElementById('searchLeads')?.value.toLowerCase() || '';

        let leads = await this.getLeadsStats();

        // Apply filters
        if (status) {
            leads = leads.filter(lead => lead.status === status);
        }

        if (source) {
            leads = leads.filter(lead => lead.source === source);
        }

        if (dateFilter) {
            const now = new Date();
            let filterDate;

            switch (dateFilter) {
                case 'today':
                    filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'quarter':
                    filterDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
            }

            if (filterDate) {
                leads = leads.filter(lead => {
                    const leadDate = new Date(lead.created_at || lead.timestamp);
                    return leadDate >= filterDate;
                });
            }
        }

        if (search) {
            leads = leads.filter(lead =>
                (lead.name && lead.name.toLowerCase().includes(search)) ||
                (lead.email && lead.email.toLowerCase().includes(search))
            );
        }

        this.renderLeadsTable(leads);
    }

    async applySubscriberFilters() {
        const status = document.getElementById('filterSubscriberStatus')?.value || '';
        const source = document.getElementById('filterSubscriberSource')?.value || '';
        const search = document.getElementById('searchSubscribers')?.value.toLowerCase() || '';

        let subscribers = await this.getSubscribersStats();

        // Apply filters
        if (status) {
            subscribers = subscribers.filter(sub => sub.status === status);
        }

        if (source) {
            subscribers = subscribers.filter(sub => sub.source === source);
        }

        if (search) {
            subscribers = subscribers.filter(sub =>
                (sub.name && sub.name.toLowerCase().includes(search)) ||
                (sub.email && sub.email.toLowerCase().includes(search))
            );
        }

        this.renderSubscribersTable(subscribers);
    }

    // Export methods
    async exportLeads() {
        try {
            const leads = await this.getLeadsStats();
            const csv = this.convertToCSV(leads, [
                'name', 'email', 'phone', 'goal', 'source', 'status', 'created_at', 'message'
            ]);

            this.downloadCSV(csv, 'garcia-builder-leads.csv');
            this.showSuccess('Leads exportados com sucesso');
        } catch (error) {
            console.error('Error exporting leads:', error);
            this.showError('Erro ao exportar leads');
        }
    }

    async exportSubscribers() {
        try {
            const subscribers = await this.getSubscribersStats();
            const csv = this.convertToCSV(subscribers, [
                'name', 'email', 'source', 'status', 'created_at'
            ]);

            this.downloadCSV(csv, 'garcia-builder-newsletter.csv');
            this.showSuccess('Inscritos exportados com sucesso');
        } catch (error) {
            console.error('Error exporting subscribers:', error);
            this.showError('Erro ao exportar inscritos');
        }
    }

    convertToCSV(data, columns) {
        const headers = columns.join(',');
        const rows = data.map(item =>
            columns.map(col => {
                const value = item[col] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',')
        );

        return [headers, ...rows].join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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

    // Campaign methods
    showCampaignModal() {
        const modalContent = document.getElementById('campaignModalContent');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="row">
                    <div class="col-12">
                        <div class="mb-3">
                            <label class="form-label">Nome da Campanha</label>
                            <input type="text" class="form-control" id="campaignName" placeholder="Ex: Newsletter Semanal">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Assunto</label>
                            <input type="text" class="form-control" id="campaignSubject" placeholder="Ex: Suas dicas de fitness desta semana">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Tipo de Campanha</label>
                            <select class="form-select" id="campaignType">
                                <option value="newsletter">Newsletter</option>
                                <option value="welcome">Boas-vindas</option>
                                <option value="follow_up">Follow-up</option>
                                <option value="promotional">Promocional</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Conteúdo</label>
                            <textarea class="form-control" rows="10" id="campaignContent" placeholder="Digite o conteúdo da campanha em HTML ou texto..."></textarea>
                        </div>
                    </div>
                </div>
            `;

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('campaignModal'));
            modal.show();
        }
    }

    // Utility methods
    formatDate(dateString) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusLabel(status) {
        const labels = {
            'new': 'Novo',
            'contacted': 'Contatado',
            'qualified': 'Qualificado',
            'converted': 'Convertido',
            'closed': 'Fechado',
            'subscribed': 'Inscrito',
            'unsubscribed': 'Cancelado',
            'bounced': 'Bounced'
        };

        return labels[status] || status;
    }

    debounce(func, wait) {
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

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        // Add to page
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        toastContainer.appendChild(toast);

        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Remove after hide
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    logout() {
        if (confirm('Tem certeza que deseja sair?')) {
            // Clear any stored auth tokens
            localStorage.removeItem('garcia_admin_token');
            // Redirect to login
            window.location.href = 'login.html';
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
