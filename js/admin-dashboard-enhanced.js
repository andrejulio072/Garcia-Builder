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
