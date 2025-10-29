// Enhanced Authentication System with User Roles
// Garcia Builder - Professional User Management

class EnhancedAuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('gb_users') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('gb_current_user') || 'null');
        this.userProfiles = JSON.parse(localStorage.getItem('gb_user_profiles') || '{}');
        this.initDefaultUsers();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.initializeUserInterface();
    }

    initDefaultUsers() {
        // Create default admin user if not exists
        const adminExists = this.users.find(user => user.email === 'admin@local' || user.email === 'admin@garciabuilder.com');
        if (!adminExists) {
            const adminUser = {
                id: 'admin-garcia-builder',
                email: 'admin@local',
                username: 'admin',
                password: 'admingarciabuilder', // In production, this should be hashed
                full_name: 'Andre Garcia',
                first_name: 'Andre',
                last_name: 'Garcia',
                role: 'admin',
                avatar_url: 'assets/avatar-admin.jpg',
                phone: '+44 7508 497586',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                status: 'active',
                permissions: ['all'],
                fake_email: true,
                is_local_admin: true
            };
            this.users.push(adminUser);

            // Create admin profile
            this.userProfiles[adminUser.id] = {
                bio: 'Founder and Head Coach at Garcia Builder. Certified fitness professional with 10+ years of experience.',
                goals: ['Build muscle', 'Lose fat', 'Improve strength'],
                experience_level: 'Expert',
                location: 'London, UK',
                birthday: '1990-01-01',
                certifications: [
                    'NASM Certified Personal Trainer',
                    'Precision Nutrition Level 1',
                    'ACSM Exercise Physiologist'
                ],
                specializations: ['Strength Training', 'Fat Loss', 'Body Recomposition'],
                clients_count: 150,
                success_rate: 95,
                languages: ['English', 'Portuguese', 'Spanish']
            };

            this.saveUsers();
            this.saveProfiles();
        }

        // Create sample trainer if not exists
        const trainerExists = this.users.find(user => user.role === 'trainer');
        if (!trainerExists) {
            const trainerUser = {
                id: 'trainer-sample-1',
                email: 'trainer@garcia-builder.com',
                username: 'trainer1',
                password: 'trainer123',
                full_name: 'Maria Silva',
                first_name: 'Maria',
                last_name: 'Silva',
                role: 'trainer',
                avatar_url: 'assets/avatar-trainer-1.jpg',
                phone: '+44 7508 123456',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                status: 'active',
                permissions: ['manage_clients', 'create_programs', 'view_analytics']
            };
            this.users.push(trainerUser);

            this.userProfiles[trainerUser.id] = {
                bio: 'Specialized in female fitness and nutrition coaching.',
                goals: ['Help clients achieve their goals'],
                experience_level: 'Advanced',
                location: 'London, UK',
                birthday: '1988-05-15',
                certifications: ['NASM CPT', 'Nutrition Specialist'],
                specializations: ['Female Fitness', 'Nutrition Coaching'],
                clients_count: 25,
                success_rate: 88,
                languages: ['English', 'Portuguese']
            };

            this.saveUsers();
            this.saveProfiles();
        }
    }

    // Enhanced login with role validation
    async login(credentials) {
        const { username, password, email } = credentials;

        // Find user by username or email (incluindo emails fictícios)
        const user = this.users.find(u =>
            (username && (u.username === username || u.email === username)) ||
            (email && u.email === email) ||
            // Busca especial para emails fictícios/IDs simples
            (username && username.includes('@') && u.email === username) ||
            (email && email.includes('@local') && u.email === email)
        );

        if (!user) {
            throw new Error('User not found');
        }

        // In a real app, you'd verify hashed passwords
        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        if (user.status === 'inactive') {
            throw new Error('Account is deactivated');
        }

        // Update last login
        user.last_login = new Date().toISOString();
        this.currentUser = user;

        this.saveUsers();
        localStorage.setItem('gb_current_user', JSON.stringify(user));

        return user;
    }

    // Enhanced registration with role assignment
    async register(userData) {
        const { email, username, password, full_name, role = 'client' } = userData;

        // Check if user already exists
        if (this.users.find(u => u.email === email || u.username === username)) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            email,
            username,
            password, // In production, hash this
            full_name,
            first_name: full_name.split(' ')[0],
            last_name: full_name.split(' ').slice(1).join(' '),
            role,
            avatar_url: `assets/avatar-${role}-default.jpg`,
            phone: '',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            status: 'active',
            permissions: this.getRolePermissions(role)
        };

        // Create default profile
        this.userProfiles[newUser.id] = {
            bio: '',
            goals: [],
            experience_level: 'Beginner',
            location: '',
            birthday: '',
            certifications: [],
            specializations: [],
            clients_count: role === 'trainer' ? 0 : null,
            success_rate: role === 'trainer' ? 0 : null,
            languages: ['English']
        };

        this.users.push(newUser);
        this.currentUser = newUser;

        this.saveUsers();
        this.saveProfiles();
        localStorage.setItem('gb_current_user', JSON.stringify(newUser));

        return newUser;
    }

    getRolePermissions(role) {
        const permissions = {
            admin: ['all'],
            trainer: ['manage_clients', 'create_programs', 'view_analytics', 'edit_profile'],
            client: ['view_programs', 'track_progress', 'edit_profile', 'book_sessions']
        };
        return permissions[role] || permissions.client;
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        if (this.currentUser.permissions.includes('all')) return true;
        return this.currentUser.permissions.includes(permission);
    }

    // Get user profile with enhanced data
    getUserProfile(userId = null) {
        const targetUserId = userId || this.currentUser?.id;
        if (!targetUserId) return null;

        const user = this.users.find(u => u.id === targetUserId);
        const profile = this.userProfiles[targetUserId] || {};

        return {
            ...user,
            profile: profile
        };
    }

    // Update user profile
    updateProfile(profileData, userId = null) {
        const targetUserId = userId || this.currentUser?.id;
        if (!targetUserId) throw new Error('No user selected');

        // Update user basic info
        const userIndex = this.users.findIndex(u => u.id === targetUserId);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...profileData.user };

            // Update current user if editing own profile
            if (targetUserId === this.currentUser?.id) {
                this.currentUser = this.users[userIndex];
                localStorage.setItem('gb_current_user', JSON.stringify(this.currentUser));
            }
        }

        // Update profile data
        this.userProfiles[targetUserId] = {
            ...this.userProfiles[targetUserId],
            ...profileData.profile
        };

        this.saveUsers();
        this.saveProfiles();
    }

    // Admin functions
    getAllUsers() {
        if (!this.hasPermission('all')) {
            throw new Error('Insufficient permissions');
        }
        return this.users.map(user => ({
            ...user,
            profile: this.userProfiles[user.id] || {}
        }));
    }

    deleteUser(userId) {
        if (!this.hasPermission('all')) {
            throw new Error('Insufficient permissions');
        }

        this.users = this.users.filter(u => u.id !== userId);
        delete this.userProfiles[userId];

        this.saveUsers();
        this.saveProfiles();
    }

    updateUserRole(userId, newRole) {
        if (!this.hasPermission('all')) {
            throw new Error('Insufficient permissions');
        }

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].role = newRole;
            this.users[userIndex].permissions = this.getRolePermissions(newRole);
            this.saveUsers();
        }
    }

    // Trainer-specific functions
    getTrainerClients() {
        if (!this.hasPermission('manage_clients')) {
            throw new Error('Insufficient permissions');
        }

        // In a real app, this would query a clients table
        return this.users.filter(u => u.role === 'client').map(client => ({
            ...client,
            profile: this.userProfiles[client.id] || {}
        }));
    }

    // Utility functions
    saveUsers() {
        localStorage.setItem('gb_users', JSON.stringify(this.users));
    }

    saveProfiles() {
        localStorage.setItem('gb_user_profiles', JSON.stringify(this.userProfiles));
    }

    checkAuthStatus() {
        if (!this.currentUser) return false;

        // Check if user still exists and is active
        const user = this.users.find(u => u.id === this.currentUser.id);
        if (!user || user.status === 'inactive') {
            this.logout();
            return false;
        }

        return true;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('gb_current_user');
        window.location.href = 'login.html';
    }

    setupEventListeners() {
        // Enhanced login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(loginForm);
                const credentials = {
                    username: formData.get('username') || formData.get('email'),
                    password: formData.get('password')
                };

                try {
                    const user = await this.login(credentials);
                    this.redirectUserByRole(user);
                } catch (error) {
                    this.showError(error.message);
                }
            });
        }

        // Enhanced register form
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(registerForm);
                const userData = {
                    email: formData.get('email'),
                    username: formData.get('username'),
                    password: formData.get('password'),
                    full_name: formData.get('full_name'),
                    role: formData.get('role') || 'client'
                };

                try {
                    const user = await this.register(userData);
                    this.redirectUserByRole(user);
                } catch (error) {
                    this.showError(error.message);
                }
            });
        }
    }

    redirectUserByRole(user) {
        const redirects = {
            admin: 'pages/admin/admin-dashboard.html',
            trainer: 'pages/trainer/trainer-dashboard.html',
            client: 'pages/public/dashboard.html'
        };

        const redirect = redirects[user.role] || 'pages/public/dashboard.html';
        window.location.href = redirect;
    }

    initializeUserInterface() {
        if (!this.currentUser) return;

        // Update user info in interface
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = this.currentUser.full_name;
        });

        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(el => {
            el.textContent = this.currentUser.email;
        });

        const userAvatarElements = document.querySelectorAll('[data-user-avatar]');
        userAvatarElements.forEach(el => {
            el.src = this.currentUser.avatar_url || 'assets/avatar-default.jpg';
        });

        const userRoleElements = document.querySelectorAll('[data-user-role]');
        userRoleElements.forEach(el => {
            el.textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
            el.className = `user-role-badge role-${this.currentUser.role}`;
        });
    }

    showError(message) {
        // Create or update error display
        let errorDiv = document.getElementById('auth-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'auth-error';
            errorDiv.className = 'alert alert-danger';
            const form = document.querySelector('form');
            if (form) {
                form.insertBefore(errorDiv, form.firstChild);
            }
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize enhanced auth system
window.enhancedAuth = new EnhancedAuthSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAuthSystem;
}
