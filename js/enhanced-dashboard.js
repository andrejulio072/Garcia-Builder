// Enhanced Dashboard JavaScript
// Garcia Builder - Professional Dashboard Management

class EnhancedDashboard {
    constructor() {
        this.currentTab = 'overview';
        this.currentProfileTab = 'personal';
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupProfileTabs();
        this.loadUserData();
        this.initializeCharts();
        this.setupEventListeners();
        this.loadDashboardData();
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

    setupProfileTabs() {
        // Profile section tabs
        const profileTabs = document.querySelectorAll('[data-profile-tab]');
        profileTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();

                const tabName = tab.getAttribute('data-profile-tab');
                this.switchProfileTab(tabName);

                // Update active state
                profileTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    switchTab(tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));

        // Show target tab
        const targetTab = document.getElementById(`${tabName}-content`);
        if (targetTab) {
            targetTab.classList.add('active');
            this.currentTab = tabName;

            // Load tab-specific data
            this.loadTabData(tabName);
        }
    }

    switchProfileTab(tabName) {
        // Hide all profile tab contents
        const profileTabContents = document.querySelectorAll('#profile-content .tab-content');
        profileTabContents.forEach(content => content.classList.remove('active'));

        // Show target profile tab
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
            this.currentProfileTab = tabName;
        }
    }

    loadUserData() {
        if (!window.enhancedAuth || !window.enhancedAuth.currentUser) {
            console.warn('No user data available');
            return;
        }

        const user = window.enhancedAuth.getUserProfile();
        if (!user) return;

        // Update user info in interface
        this.updateUserInterface(user);
        this.populateProfileForm(user);
    }

    updateUserInterface(user) {
        // Update user name
        const nameElements = document.querySelectorAll('[data-user-name]');
        nameElements.forEach(el => {
            el.textContent = user.first_name || user.full_name || 'User';
        });

        // Update user email
        const emailElements = document.querySelectorAll('[data-user-email]');
        emailElements.forEach(el => {
            el.textContent = user.email || '';
        });

        // Update user avatar
        const avatarElements = document.querySelectorAll('[data-user-avatar]');
        avatarElements.forEach(el => {
            el.src = user.avatar_url || 'assets/avatar-default.jpg';
        });

        // Update user role
        const roleElements = document.querySelectorAll('[data-user-role]');
        roleElements.forEach(el => {
            const role = user.role || 'client';
            el.textContent = role.charAt(0).toUpperCase() + role.slice(1);
            el.className = `user-role-badge role-${role}`;
        });
    }

    populateProfileForm(user) {
        // Personal info form
        const personalForm = document.getElementById('personalInfoForm');
        if (personalForm) {
            personalForm.querySelector('[name="first_name"]').value = user.first_name || '';
            personalForm.querySelector('[name="last_name"]').value = user.last_name || '';
            personalForm.querySelector('[name="email"]').value = user.email || '';
            personalForm.querySelector('[name="phone"]').value = user.phone || '';
            personalForm.querySelector('[name="birthday"]').value = user.profile?.birthday || '';
            personalForm.querySelector('[name="location"]').value = user.profile?.location || '';
            personalForm.querySelector('[name="bio"]').value = user.profile?.bio || '';
        }

        // Fitness profile form
        const fitnessForm = document.getElementById('fitnessProfileForm');
        if (fitnessForm) {
            fitnessForm.querySelector('[name="experience_level"]').value = user.profile?.experience_level || 'Beginner';
            fitnessForm.querySelector('[name="activity_level"]').value = user.profile?.activity_level || 'Moderately Active';

            // Set goals checkboxes
            const goals = user.profile?.goals || [];
            const goalCheckboxes = fitnessForm.querySelectorAll('[name="goals"]');
            goalCheckboxes.forEach(checkbox => {
                checkbox.checked = goals.includes(checkbox.value);
            });
        }
    }

    setupEventListeners() {
        // Personal info form submission
        const personalForm = document.getElementById('personalInfoForm');
        if (personalForm) {
            personalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePersonalInfo(new FormData(personalForm));
            });
        }

        // Fitness profile form submission
        const fitnessForm = document.getElementById('fitnessProfileForm');
        if (fitnessForm) {
            fitnessForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFitnessProfile(new FormData(fitnessForm));
            });
        }

        // Mobile sidebar toggle
        this.setupMobileNavigation();
    }

    setupMobileNavigation() {
        // Add mobile menu toggle if not exists
        const sidebar = document.getElementById('sidebar');
        const main = document.querySelector('.dashboard-main');

        // Create mobile toggle button
        if (!document.getElementById('mobile-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'mobile-toggle';
            toggleBtn.className = 'btn-quick mobile-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            toggleBtn.style.cssText = 'position: fixed; top: 1rem; left: 1rem; z-index: 1001; display: none;';

            // Show on mobile
            if (window.innerWidth <= 768) {
                toggleBtn.style.display = 'block';
            }

            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });

            document.body.appendChild(toggleBtn);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            const toggleBtn = document.getElementById('mobile-toggle');
            if (window.innerWidth <= 768) {
                toggleBtn.style.display = 'block';
            } else {
                toggleBtn.style.display = 'none';
                sidebar.classList.remove('show');
            }
        });

        // Close sidebar when clicking outside on mobile
        main.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('show');
            }
        });
    }

    savePersonalInfo(formData) {
        const userData = {
            user: {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                full_name: `${formData.get('first_name')} ${formData.get('last_name')}`,
                email: formData.get('email'),
                phone: formData.get('phone')
            },
            profile: {
                birthday: formData.get('birthday'),
                location: formData.get('location'),
                bio: formData.get('bio')
            }
        };

        try {
            window.enhancedAuth.updateProfile(userData);
            this.showNotification('Personal information updated successfully!', 'success');
            this.updateUserInterface(window.enhancedAuth.getUserProfile());
        } catch (error) {
            this.showNotification('Failed to update personal information: ' + error.message, 'error');
        }
    }

    saveFitnessProfile(formData) {
        // Get selected goals
        const goals = [];
        const goalCheckboxes = document.querySelectorAll('[name="goals"]:checked');
        goalCheckboxes.forEach(checkbox => goals.push(checkbox.value));

        const profileData = {
            profile: {
                experience_level: formData.get('experience_level'),
                activity_level: formData.get('activity_level'),
                goals: goals
            }
        };

        try {
            window.enhancedAuth.updateProfile(profileData);
            this.showNotification('Fitness profile updated successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to update fitness profile: ' + error.message, 'error');
        }
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'workouts':
                this.loadWorkoutsData();
                break;
            case 'nutrition':
                this.loadNutritionData();
                break;
            case 'progress':
                this.loadProgressData();
                break;
            case 'messages':
                this.loadMessagesData();
                break;
            default:
                console.log(`Loading data for tab: ${tabName}`);
        }
    }

    loadOverviewData() {
        // Load overview dashboard data
        this.updateActivityFeed();
        this.updateProgressCards();
    }

    updateActivityFeed() {
        // Mock activity data - in real app, this would come from API
        const activities = [
            {
                type: 'achievement',
                icon: 'fas fa-trophy',
                color: 'var(--primary-gold)',
                title: 'Personal Record!',
                description: 'Deadlift - 180kg',
                time: '2 hours ago'
            },
            {
                type: 'workout',
                icon: 'fas fa-check-circle',
                color: 'var(--success-green)',
                title: 'Workout Completed:',
                description: 'Upper Body Strength',
                time: 'Yesterday'
            },
            {
                type: 'message',
                icon: 'fas fa-comment',
                color: 'var(--primary-gold)',
                title: 'Message from Andre:',
                description: '"Great progress this week! Keep it up!"',
                time: '2 days ago'
            }
        ];

        const activityFeed = document.querySelector('.activity-feed');
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

    updateProgressCards() {
        // Update progress bars and stats
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach((bar, index) => {
            const targetWidth = [60, 84, 80][index] || 50;
            setTimeout(() => {
                bar.style.width = targetWidth + '%';
            }, 100 * index);
        });
    }

    loadWorkoutsData() {
        // Load workout data
        console.log('Loading workouts data...');
    }

    loadNutritionData() {
        // Load nutrition data
        console.log('Loading nutrition data...');
    }

    loadProgressData() {
        // Load progress data
        console.log('Loading progress data...');
    }

    loadMessagesData() {
        // Load messages data
        console.log('Loading messages data...');
    }

    loadDashboardData() {
        // Load initial dashboard data
        setTimeout(() => {
            this.updateProgressCards();
            this.updateActivityFeed();
        }, 500);
    }

    initializeCharts() {
        // Initialize any charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            // Chart initialization would go here
            console.log('Charts ready to initialize');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-green)' : type === 'error' ? 'var(--danger-red)' : 'var(--primary-gold)'};
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

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    .notification-close:hover {
        background: rgba(0, 0, 0, 0.2);
    }

    .mobile-toggle {
        @media (min-width: 769px) {
            display: none !important;
        }
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!window.enhancedAuth || !window.enhancedAuth.currentUser) {
        console.warn('No authenticated user found, redirecting to login...');
        window.location.href = 'login.html';
        return;
    }

    // Initialize enhanced dashboard
    window.enhancedDashboard = new EnhancedDashboard();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedDashboard;
}
