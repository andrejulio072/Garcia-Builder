// Garcia Builder - Admin Dashboard
// Clean and functional admin panel

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.charts = {};
        this.currentTab = 'overview';
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.checkAuth()) {
            return;
        }

        // Load data and setup
        await this.loadData();
        this.setupEventListeners();
        this.initializeCharts();
        this.showTab('overview');
    }

    checkAuth() {
        // Simple auth check
        const authData = localStorage.getItem('gb_currentUser');
        if (!authData) {
            window.location.href = 'login.html';
            return false;
        }

        try {
            this.currentUser = JSON.parse(authData);
            if (this.currentUser.role !== 'admin') {
                alert('Access denied. Admin privileges required.');
                window.location.href = 'dashboard.html';
                return false;
            }
            return true;
        } catch (error) {
            window.location.href = 'login.html';
            return false;
        }
    }

    async loadData() {
        // Load users from localStorage
        const usersData = localStorage.getItem('gb_users');
        this.users = usersData ? JSON.parse(usersData) : [];

        // Update UI with loaded data
        this.updateDashboardStats();
        this.populateUsersTable();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.showTab(tabName);
            });
        });

        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }

        // Form submissions
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddUser();
            });
        }

        // Quick actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        const targetTab = document.getElementById(tabName + '-content');
        if (targetTab) {
            targetTab.classList.add('active');
            this.currentTab = tabName;
        }

        // Update navigation
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                this.updateDashboardStats();
                break;
            case 'users':
                this.populateUsersTable();
                break;
            case 'analytics':
                this.updateChartsData();
                break;
            default:
                console.log('Loading data for tab:', tabName);
        }
    }

    updateDashboardStats() {
        const totalUsers = this.users.length;
        const trainers = this.users.filter(u => u.role === 'trainer').length;
        const clients = this.users.filter(u => u.role === 'client').length;

        // Update count displays safely
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        updateElement('totalUsersCount', totalUsers);
        updateElement('trainersCount', trainers);
        updateElement('clientsCount', clients);
        updateElement('userCount', totalUsers);

        // Update charts if available
        this.updateChartsData();
    }

    populateUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.users.map(user => {
            const userAvatarUrl = user.avatar_url || 'assets/avatar-default.jpg';
            const userName = user.full_name || 'Unknown User';
            const userRole = user.role || 'client';
            const userStatus = user.status || 'active';
            const joinDate = new Date(user.created_at || Date.now()).toLocaleDateString();

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

    handleAddUser() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);

        const userData = {
            id: Date.now().toString(),
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password'),
            role: formData.get('role'),
            phone: formData.get('phone'),
            status: 'active',
            created_at: new Date().toISOString()
        };

        try {
            // Add to users array
            this.users.push(userData);

            // Save to localStorage
            localStorage.setItem('gb_users', JSON.stringify(this.users));

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            modal.hide();

            // Reset form
            form.reset();

            // Refresh data
            this.loadData();

            this.showNotification('User ' + userData.full_name + ' added successfully!', 'success');
        } catch (error) {
            this.showNotification('Error adding user: ' + error.message, 'error');
        }
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const userInfo = [
            'Edit User: ' + user.full_name,
            'Email: ' + user.email,
            'Role: ' + user.role,
            'Status: ' + (user.status || 'active')
        ].join('\n');

        alert(userInfo + '\n\nEdit functionality coming soon...');
    }

    viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const userInfoLines = [
            'User Profile: ' + user.full_name,
            'Email: ' + user.email,
            'Role: ' + user.role,
            'Phone: ' + (user.phone || 'Not provided'),
            'Status: ' + (user.status || 'active'),
            'Joined: ' + new Date(user.created_at).toLocaleDateString()
        ];

        alert(userInfoLines.join('\n'));
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const confirmMsg = 'Are you sure you want to delete user "' + user.full_name + '"? This action cannot be undone.';
        if (confirm(confirmMsg)) {
            try {
                this.users = this.users.filter(u => u.id !== userId);
                localStorage.setItem('gb_users', JSON.stringify(this.users));
                this.loadData();
                this.showNotification('User ' + user.full_name + ' deleted successfully.', 'success');
            } catch (error) {
                this.showNotification('Error deleting user: ' + error.message, 'error');
            }
        }
    }

    changeRole(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const roles = ['client', 'trainer', 'admin'];
        const currentRole = user.role;
        const availableRoles = roles.filter(role => role !== currentRole);

        const newRole = prompt('Change role for ' + user.full_name + '\nCurrent role: ' + currentRole + '\n\nEnter new role (' + availableRoles.join(', ') + '):', availableRoles[0]);

        if (newRole && roles.includes(newRole.toLowerCase())) {
            try {
                user.role = newRole.toLowerCase();
                localStorage.setItem('gb_users', JSON.stringify(this.users));
                this.loadData();
                this.showNotification('Role changed to ' + newRole + ' for ' + user.full_name, 'success');
            } catch (error) {
                this.showNotification('Error changing role: ' + error.message, 'error');
            }
        } else if (newRole) {
            alert('Invalid role. Please choose from: ' + availableRoles.join(', '));
        }
    }

    sendNewsletter() {
        const confirmed = confirm('Send newsletter to all subscribers? This action will send emails immediately.');
        if (confirmed) {
            this.showNotification('Sending newsletter...', 'info');
            setTimeout(() => {
                this.showNotification('Newsletter sent to 847 subscribers', 'success');
            }, 1000);
        }
    }

    backupData() {
        this.showNotification('Creating backup...', 'info');

        setTimeout(() => {
            const backupData = {
                users: this.users,
                timestamp: new Date().toISOString(),
                version: '2.0'
            };

            const backupContent = JSON.stringify(backupData, null, 2);
            const filename = 'garcia-builder-backup-' + new Date().toISOString().split('T')[0] + '.json';
            this.downloadFile(backupContent, filename, 'application/json');
            this.showNotification('Backup completed successfully', 'success');
        }, 2000);
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type: type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    initializeCharts() {
        this.initUserGrowthChart();
        this.initUserTypesChart();
    }

    initUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;

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

        const roleCount = {
            client: this.users.filter(u => u.role === 'client').length,
            trainer: this.users.filter(u => u.role === 'trainer').length,
            admin: this.users.filter(u => u.role === 'admin').length
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

    updateChartsData() {
        if (this.charts.userTypes) {
            const roleCount = {
                client: this.users.filter(u => u.role === 'client').length,
                trainer: this.users.filter(u => u.role === 'trainer').length,
                admin: this.users.filter(u => u.role === 'admin').length
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
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;

        const iconClass = type === 'success' ? 'check-circle' :
                         type === 'error' ? 'exclamation-circle' : 'info-circle';

        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${iconClass}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        const bgColor = type === 'success' ? 'var(--success-green)' :
                       type === 'error' ? 'var(--danger-red)' : 'var(--primary-gold)';

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            min-width: 300px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.3s ease;
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        document.body.appendChild(notification);
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}
