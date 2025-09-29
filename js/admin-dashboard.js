// Admin Dashboard JavaScript - Garcia Builder
class AdminDashboard {
    constructor() {
        this.supabase = null;
        this.currentTab = 'dashboard';
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.charts = {};

        this.init();
    }

    async init() {
        try {
            // Initialize Supabase
            this.initSupabase();

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadDashboardData();

            // Initialize charts
            this.initializeCharts();

            console.log('Admin Dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing admin dashboard:', error);
            this.showError('Erro ao inicializar dashboard');
        }
    }

    initSupabase() {
        if (window.supabaseClient) {
            this.supabase = window.supabaseClient;
            console.log('✅ Admin Dashboard: Supabase client connected');
        } else {
            console.warn('⚠️ Admin Dashboard: Supabase not available, using localStorage fallback');
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });

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
