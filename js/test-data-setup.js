// Garcia Builder - Test Data Setup
// Script para popular dados de teste no sistema

function setupTestData() {
    console.log('Setting up test data for Garcia Builder...');

    // Admin user (already exists)
    const adminUser = {
        id: 'admin-001',
        username: 'admin',
        password: 'admin',
        full_name: 'Admin Garcia',
        email: 'admin@garciabuilder.com',
        role: 'admin',
        phone: '+44 20 7946 0958',
        status: 'active',
        created_at: new Date('2024-01-01').toISOString(),
        last_login: new Date().toISOString(),
        avatar_url: 'assets/avatar-m1.svg'
    };

    // Test trainers
    const trainers = [
        {
            id: 'trainer-001',
            username: 'maria.silva',
            password: 'trainer123',
            full_name: 'Maria Silva',
            email: 'maria.silva@garciabuilder.com',
            role: 'trainer',
            phone: '+44 20 7946 1234',
            status: 'active',
            created_at: new Date('2024-02-15').toISOString(),
            last_login: new Date().toISOString(),
            avatar_url: 'assets/avatar-f1.svg'
        },
        {
            id: 'trainer-002',
            username: 'carlos.santos',
            password: 'trainer123',
            full_name: 'Carlos Santos',
            email: 'carlos.santos@garciabuilder.com',
            role: 'trainer',
            phone: '+44 20 7946 5678',
            status: 'active',
            created_at: new Date('2024-03-01').toISOString(),
            last_login: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            avatar_url: 'assets/avatar-m1.svg'
        },
        {
            id: 'trainer-003',
            username: 'ana.rodrigues',
            password: 'trainer123',
            full_name: 'Ana Rodrigues',
            email: 'ana.rodrigues@garciabuilder.com',
            role: 'trainer',
            phone: '+44 20 7946 9012',
            status: 'active',
            created_at: new Date('2024-03-20').toISOString(),
            last_login: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            avatar_url: 'assets/avatar-f1.svg'
        }
    ];

    // Test clients
    const clients = [
        {
            id: 'client-001',
            username: 'john.smith',
            password: 'client123',
            full_name: 'John Smith',
            email: 'john.smith@example.com',
            role: 'client',
            phone: '+44 7911 123456',
            status: 'active',
            created_at: new Date('2024-04-01').toISOString(),
            last_login: new Date().toISOString(),
            avatar_url: 'assets/avatar-m1.svg'
        },
        {
            id: 'client-002',
            username: 'sarah.jones',
            password: 'client123',
            full_name: 'Sarah Jones',
            email: 'sarah.jones@example.com',
            role: 'client',
            phone: '+44 7911 234567',
            status: 'active',
            created_at: new Date('2024-04-05').toISOString(),
            last_login: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
            avatar_url: 'assets/avatar-f1.svg'
        },
        {
            id: 'client-003',
            username: 'mike.brown',
            password: 'client123',
            full_name: 'Mike Brown',
            email: 'mike.brown@example.com',
            role: 'client',
            phone: '+44 7911 345678',
            status: 'active',
            created_at: new Date('2024-04-10').toISOString(),
            last_login: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            avatar_url: 'assets/avatar-m1.svg'
        },
        {
            id: 'client-004',
            username: 'lucy.white',
            password: 'client123',
            full_name: 'Lucy White',
            email: 'lucy.white@example.com',
            role: 'client',
            phone: '+44 7911 456789',
            status: 'active',
            created_at: new Date('2024-04-15').toISOString(),
            last_login: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            avatar_url: 'assets/avatar-f1.svg'
        },
        {
            id: 'client-005',
            username: 'david.taylor',
            password: 'client123',
            full_name: 'David Taylor',
            email: 'david.taylor@example.com',
            role: 'client',
            phone: '+44 7911 567890',
            status: 'active',
            created_at: new Date('2024-04-20').toISOString(),
            last_login: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            avatar_url: 'assets/avatar-m1.svg'
        },
        {
            id: 'client-006',
            username: 'emma.wilson',
            password: 'client123',
            full_name: 'Emma Wilson',
            email: 'emma.wilson@example.com',
            role: 'client',
            phone: '+44 7911 678901',
            status: 'active',
            created_at: new Date('2024-04-25').toISOString(),
            last_login: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            avatar_url: 'assets/avatar-f1.svg'
        }
    ];

    // Combine all users
    const allUsers = [adminUser, ...trainers, ...clients];

    // Save to localStorage
    localStorage.setItem('gb_users', JSON.stringify(allUsers));

    // Set admin as current user for demo
    localStorage.setItem('gb_currentUser', JSON.stringify(adminUser));

    // Create user profiles data
    const userProfiles = {};
    allUsers.forEach(user => {
        userProfiles[user.id] = {
            bio: generateBio(user.role),
            location: generateLocation(),
            goals: generateGoals(user.role),
            experience_level: generateExperience(user.role),
            specializations: user.role === 'trainer' ? generateSpecializations() : [],
            certifications: user.role === 'trainer' ? generateCertifications() : []
        };
    });

    localStorage.setItem('gb_user_profiles', JSON.stringify(userProfiles));

    console.log('Test data setup complete!');
    console.log('Total users:', allUsers.length);
    console.log('- Admins:', allUsers.filter(u => u.role === 'admin').length);
    console.log('- Trainers:', allUsers.filter(u => u.role === 'trainer').length);
    console.log('- Clients:', allUsers.filter(u => u.role === 'client').length);

    return allUsers;
}

function generateBio(role) {
    const bios = {
        admin: [
            'System Administrator with 10+ years experience managing fitness platforms.',
            'Passionate about helping fitness businesses grow through technology.',
            'Expert in user management and system optimization.'
        ],
        trainer: [
            'Certified personal trainer with 5+ years experience helping clients achieve their fitness goals.',
            'Specializing in strength training and body transformation.',
            'Dedicated to creating personalized workout plans for each client.',
            'Former competitive athlete turned fitness professional.',
            'Passionate about functional fitness and injury prevention.'
        ],
        client: [
            'Fitness enthusiast looking to improve strength and overall health.',
            'Busy professional seeking efficient workout routines.',
            'New to fitness but motivated to make lasting changes.',
            'Former athlete getting back into shape.',
            'Health-conscious individual focused on long-term wellness.'
        ]
    };

    const roleBios = bios[role] || bios.client;
    return roleBios[Math.floor(Math.random() * roleBios.length)];
}

function generateLocation() {
    const locations = [
        'London, UK',
        'Manchester, UK',
        'Birmingham, UK',
        'Leeds, UK',
        'Glasgow, UK',
        'Liverpool, UK',
        'Bristol, UK',
        'Sheffield, UK',
        'Edinburgh, UK',
        'Cardiff, UK'
    ];

    return locations[Math.floor(Math.random() * locations.length)];
}

function generateGoals(role) {
    const goalOptions = {
        trainer: ['Help clients achieve their fitness goals', 'Grow personal training business', 'Develop new training programs'],
        client: ['Lose weight', 'Build muscle', 'Improve cardiovascular health', 'Increase strength', 'Improve flexibility', 'Better nutrition habits']
    };

    const roleGoals = goalOptions[role] || goalOptions.client;
    const numGoals = Math.floor(Math.random() * 3) + 1;
    const selectedGoals = [];

    for (let i = 0; i < numGoals; i++) {
        const goal = roleGoals[Math.floor(Math.random() * roleGoals.length)];
        if (!selectedGoals.includes(goal)) {
            selectedGoals.push(goal);
        }
    }

    return selectedGoals;
}

function generateExperience(role) {
    const experiences = {
        trainer: ['Expert', 'Advanced', 'Professional'],
        client: ['Beginner', 'Intermediate', 'Advanced']
    };

    const roleExperiences = experiences[role] || experiences.client;
    return roleExperiences[Math.floor(Math.random() * roleExperiences.length)];
}

function generateSpecializations() {
    const specializations = [
        'Strength Training',
        'Weight Loss',
        'Muscle Building',
        'Cardiovascular Fitness',
        'Functional Training',
        'Sports Performance',
        'Injury Rehabilitation',
        'Nutrition Coaching'
    ];

    const numSpecs = Math.floor(Math.random() * 4) + 2;
    const selected = [];

    for (let i = 0; i < numSpecs; i++) {
        const spec = specializations[Math.floor(Math.random() * specializations.length)];
        if (!selected.includes(spec)) {
            selected.push(spec);
        }
    }

    return selected;
}

function generateCertifications() {
    const certifications = [
        'NASM Certified Personal Trainer',
        'ACE Personal Trainer Certification',
        'ACSM Certified Exercise Physiologist',
        'Precision Nutrition Level 1',
        'CrossFit Level 1 Trainer',
        'TRX Suspension Training',
        'First Aid/CPR Certified'
    ];

    const numCerts = Math.floor(Math.random() * 3) + 1;
    const selected = [];

    for (let i = 0; i < numCerts; i++) {
        const cert = certifications[Math.floor(Math.random() * certifications.length)];
        if (!selected.includes(cert)) {
            selected.push(cert);
        }
    }

    return selected;
}

// Auto-run setup if script is loaded directly
if (typeof window !== 'undefined') {
    // Setup test data when page loads
    document.addEventListener('DOMContentLoaded', () => {
        // Only setup test data if no users exist yet
        const existingUsers = localStorage.getItem('gb_users');
        if (!existingUsers || JSON.parse(existingUsers).length === 0) {
            console.log('No existing users found, setting up test data...');
            setupTestData();
        } else {
            console.log('Users already exist, skipping test data setup');
        }
    });
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setupTestData };
}
