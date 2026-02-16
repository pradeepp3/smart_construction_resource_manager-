// Application State
const AppState = {
    currentUser: null,
    currentProject: null,
    currentView: 'login'
};

// Router - Navigate between views
async function navigateTo(viewName) {
    AppState.currentView = viewName;

    const viewContainer = document.getElementById('view-container');
    const sidebar = document.getElementById('sidebar');
    const topHeader = document.getElementById('top-header');

    // Update active nav button
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });

    // Show loading
    showLoading();

    try {
        let content = '';

        // Handle Sidebar and Header Visibility
        if (viewName === 'login') {
            if (sidebar) sidebar.style.display = 'none';
            if (topHeader) topHeader.style.display = 'none';
        } else {
            if (sidebar) sidebar.style.display = 'flex';
            if (topHeader) topHeader.style.display = 'flex';

            // Check if project is selected for project-specific views
            if (['dashboard', 'labour', 'materials', 'equipment', 'finance'].includes(viewName)) {
                if (!AppState.currentProject) {
                    navigateTo('projects');
                    return;
                }
                // Update header title
                document.getElementById('headerProjectName').textContent = AppState.currentProject.name;
            } else if (viewName === 'projects') {
                document.getElementById('headerProjectName').textContent = 'My Projects';
            }
        }

        switch (viewName) {
            case 'login':
                content = await loadLoginView();
                break;
            case 'projects':
                content = await loadProjectsView();
                break;
            case 'dashboard':
                content = await loadDashboardView();
                break;
            case 'labour':
                content = await loadLabourView();
                break;
            case 'materials':
                content = await loadMaterialsView();
                break;
            case 'equipment':
                content = await loadEquipmentView();
                break;
            case 'finance':
                content = await loadFinanceView();
                break;
            case 'settings':
                content = await loadSettingsView();
                break;
            default:
                content = '<h1>Page Not Found</h1>';
        }

        viewContainer.innerHTML = content;

        // Initialize view-specific functionality
        initializeCurrentView(viewName);

    } catch (error) {
        console.error('Navigation error:', error);
        viewContainer.innerHTML = `<div class="alert alert-danger">Error loading view: ${error.message}</div>`;
    } finally {
        hideLoading();
    }
}

// Initialize view-specific event handlers
function initializeCurrentView(viewName) {
    switch (viewName) {
        case 'login':
            initializeLogin();
            break;
        case 'projects':
            initializeProjects();
            break;
        case 'dashboard':
            initializeDashboard();
            break;
        case 'labour':
            initializeLabour();
            break;
        case 'materials':
            initializeMaterials();
            break;
        case 'equipment':
            initializeEquipment();
            break;
        case 'finance':
            initializeFinance();
            break;
        case 'settings':
            initializeSettings();
            break;
    }
}

// ==========================================
// DASHBOARD VIEW (Bento Grid)
// ==========================================

async function loadDashboardView() {
    return `
        <div class="bento-grid dashboard">
            <!-- Finance Overview (Large Widget) -->
            <div class="widget-card span-2 row-span-2 widget-kpi">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-wallet"></i> Budget Overview</div>
                    <div class="widget-action" onclick="navigateTo('finance')"><i class="ph ph-arrow-right"></i></div>
                </div>
                <div class="flex-column gap-md" style="flex:1; justify-content:center;">
                    <div>
                        <div class="widget-value-huge" id="dashTotalBudget">₹0</div>
                        <div class="widget-subtext"><span id="dashRemaining">0%</span> Remaining Funds</div>
                    </div>
                    <div class="progress-bar-container">
                        <div id="dashBudgetBar" class="progress-bar-fill" style="width: 0%"></div>
                    </div>
                    <div class="flex gap-lg mt-1">
                        <div>
                            <div class="text-muted text-xs">Labour</div>
                            <div class="font-bold font-mono" id="dashLabourCost">₹0</div>
                        </div>
                        <div>
                            <div class="text-muted text-xs">Materials</div>
                            <div class="font-bold font-mono" id="dashMaterialCost">₹0</div>
                        </div>
                        <div>
                            <div class="text-muted text-xs">Equipment</div>
                            <div class="font-bold font-mono" id="dashEquipCost">₹0</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Team Pulse (List Widget) -->
            <div class="widget-card span-1 row-span-2">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-users"></i> Team Pulse</div>
                     <div class="widget-action" onclick="navigateTo('labour')"><i class="ph ph-plus"></i></div>
                </div>
                <div class="flex-column gap-sm" id="dashTeamList">
                    <!-- Populated via JS -->
                    <div class="text-muted text-center flex-column justify-center" style="height: 100%;">
                        <i class="ph ph-spinner animate-spin"></i> Loading...
                    </div>
                </div>
            </div>

            <!-- Project Status (KPI) -->
            <div class="widget-card span-1">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-chart-line-up"></i> Progress</div>
                </div>
                <div class="widget-value-large">On Track</div>
                <div class="widget-subtext text-income"><i class="ph ph-check-circle"></i> 4 Milestones ahead</div>
            </div>

            <!-- Pending Tasks / Notifications -->
            <div class="widget-card span-1">
               <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-bell"></i> Alerts</div>
                </div>
                <div class="widget-value-large" id="dashAlertCount">0</div>
                <div class="widget-subtext">Pending Approvals</div>
            </div>

             <!-- Material Status -->
            <div class="widget-card span-1">
               <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-package"></i> Inventory</div>
                </div>
                <div class="flex-between">
                    <div>
                        <div class="widget-value-large" id="dashMaterialCount">0</div>
                         <div class="widget-subtext">Items Stocked</div>
                    </div>
                    <div class="trend neutral" id="dashLowStockBadge" style="display:none;">
                        Low Stock
                    </div>
                </div>
            </div>

             <!-- Equipment Status -->
            <div class="widget-card span-1">
               <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-truck"></i> Equipment</div>
                </div>
                 <div class="flex-between">
                    <div>
                        <div class="widget-value-large" id="dashEquipmentCount">0</div>
                         <div class="widget-subtext">Active Units</div>
                    </div>
                </div>
            </div>
            
            <!-- Map / Location Placeholder -->
            <div class="widget-card span-2">
                 <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-map-pin"></i> Site Location</div>
                </div>
                <div style="flex:1; background: #27272A; border-radius: 8px; display:flex; align-items:center; justify-content:center; color: #52525B;">
                    <i class="ph ph-map-trifold" style="font-size: 3rem;"></i>
                </div>
                 <div class="widget-subtext mt-1"><i class="ph ph-navigation-arrow"></i> ${AppState.currentProject ? AppState.currentProject.location : 'Unknown'}</div>
            </div>

        </div>
    `;
}

function initializeDashboard() {
    if (!AppState.currentProject) return;

    const p = AppState.currentProject;

    // Calculate Finances (Mocking aggregation if raw data isn't ready in p.budgetBreakdown)
    // Assuming p.budgetBreakdown exists from finance module updates
    const breakdown = p.budgetBreakdown || { labour: 0, materials: 0, equipment: 0, other: 0 };
    const totalSpent = breakdown.labour + breakdown.materials + breakdown.equipment + breakdown.other;
    const totalBudget = p.budget || 0;
    const remaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? ((remaining / totalBudget) * 100).toFixed(1) : 0;

    // Update Finance Widget
    document.getElementById('dashTotalBudget').textContent = formatCurrency(totalBudget);
    document.getElementById('dashRemaining').textContent = `${percentage}%`;
    document.getElementById('dashLabourCost').textContent = formatCurrency(breakdown.labour);
    document.getElementById('dashMaterialCost').textContent = formatCurrency(breakdown.materials);
    document.getElementById('dashEquipCost').textContent = formatCurrency(breakdown.equipment);

    // Update Progress Bar
    const bar = document.getElementById('dashBudgetBar');
    if (bar) {
        // Inverse logic: bar shows spent or remaining? Design showed "Remaining Funds". 
        // Let's make bar represent standard visualization: % filled = % used usually, or % success.
        // Let's show % USED
        const usePct = totalBudget > 0 ? ((totalSpent / totalBudget) * 100) : 0;
        bar.style.width = `${Math.min(usePct, 100)}%`;
        if (usePct > 90) bar.style.backgroundColor = 'var(--danger)';
        else if (usePct > 75) bar.style.backgroundColor = 'var(--warning)';
    }

    // Load Mock/Real Data for Lists (Using simple counts for now as we might need to fetch full lists)
    // In a real app we'd call window.api.labour.getAll(p._id) etc.
    // For now, let's assume we can fetch counts or simulate.
    loadDashboardCounts(p._id);
}

async function loadDashboardCounts(projectId) {
    try {
        // Fetch Labour
        const labourRes = await window.api.labour.getAll(projectId);
        if (labourRes.success) {
            const workers = labourRes.data;
            const teamList = document.getElementById('dashTeamList');
            if (teamList) {
                teamList.innerHTML = '';
                // Show top 3 workers or recent
                workers.slice(0, 4).forEach(w => {
                    const active = w.totalCost > 0; // Simple activity check
                    teamList.innerHTML += `
                        <div class="list-widget-item">
                            <div class="user-avatar-group">
                                <div class="user-avatar">${w.name.charAt(0)}</div>
                                <div class="user-info">
                                    <span class="name">${w.name}</span>
                                    <span class="status">${w.category}</span>
                                </div>
                            </div>
                            <div class="trend ${active ? 'up' : 'neutral'}">
                                ${active ? 'Active' : 'Idle'}
                            </div>
                        </div>
                    `;
                });
                if (workers.length === 0) teamList.innerHTML = '<div class="text-muted text-center">No workers added</div>';
            }
        }

        // Fetch Materials
        const matRes = await window.api.materials.getAll(projectId);
        if (matRes.success) {
            document.getElementById('dashMaterialCount').textContent = matRes.data.length;
            // Check low stock
            const lowStock = matRes.data.some(m => m.quantity < 10); // Arbitrary threshold
            if (lowStock) document.getElementById('dashLowStockBadge').style.display = 'inline-flex';
        }

        // Fetch Equipment
        const eqRes = await window.api.equipment.getAll(projectId);
        if (eqRes.success) {
            document.getElementById('dashEquipmentCount').textContent = eqRes.data.length;
        }

        // Alerts (Mock)
        document.getElementById('dashAlertCount').textContent = Math.floor(Math.random() * 5);

    } catch (e) {
        console.error("Error loading dashboard stats", e);
    }
}


// Loading utilities
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Update current project display
function updateProjectDisplay() {
    const projectNameElement = document.getElementById('currentProjectName');
    if (projectNameElement) {
        projectNameElement.textContent = AppState.currentProject
            ? AppState.currentProject.name
            : 'No Project Selected';
    }
}

// Set current project
function setCurrentProject(project) {
    AppState.currentProject = project;
    localStorage.setItem('currentProjectId', project._id);
    updateProjectDisplay();
}

// Get current project from localStorage on app start
async function loadCurrentProject() {
    const projectId = localStorage.getItem('currentProjectId');
    if (projectId) {
        const result = await window.api.projects.getById(projectId);
        if (result.success && result.data) {
            AppState.currentProject = result.data;
            updateProjectDisplay();
        }
    }
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '10000';
    alertDiv.style.minWidth = '300px';

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Application starting...');
    console.log('API check:', window.api ? 'Available' : 'Missing');

    if (!window.api) {
        document.body.innerHTML = `
            <div style="padding: 2rem; color: red;">
                <h1>Critical Error</h1>
                <p>Application API not initialized. This typically happens if the preload script failed to load.</p>
                <p>Please restart the application. If the problem persists, check the console for errors.</p>
            </div>
        `;
        return;
    }

    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await window.api.auth.logout();
            // Reset state
            AppState.currentUser = null;
            AppState.currentProject = currentProject = null;
            navigateTo('login');
        });
    }

    // Set up navigation
    // FIXED: Selector must match new sidebar buttons (.nav-item) or standard (.nav-btn)
    // In index.html I changed them to 'nav-item' but also kept 'nav-btn' in legacy...
    // Actually in index.html I used 'nav-item'.
    document.querySelectorAll('.nav-item[data-view], .nav-btn[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view) navigateTo(view);
        });
    });

    try {
        // Listen for database switches
        window.api.settings.onDbSwitched((data) => {
            console.log('Database switched to:', data.path);
            AppState.currentProject = null; // Clear project context
            navigateTo('projects'); // Back to projects to see new data
        });

        // Check if user is logged in
        const user = await window.api.auth.getCurrentUser();
        if (user) {
            AppState.currentUser = user;
            await loadCurrentProject();
            // Go to dashboard if project selected, else projects
            if (AppState.currentProject) {
                navigateTo('dashboard');
            } else {
                navigateTo('projects');
            }
        } else {
            navigateTo('login');
        }

        // Initialize Theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('Failed to initialize app: ' + error.message, 'danger');
    }
});

// Theme Toggle Function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    updateThemeIcon(newTheme);
    showAlert(`Switched to ${newTheme} mode`, 'success');
}

function updateThemeIcon(theme) {
    const themeBtnIcon = document.querySelector('#themeBtn i');
    if (themeBtnIcon) {
        if (theme === 'dark') {
            themeBtnIcon.className = 'ph ph-sun';
        } else {
            themeBtnIcon.className = 'ph ph-moon';
        }
    }
}

// Expose global functions
window.AppState = AppState;
window.navigateTo = navigateTo;
window.setCurrentProject = setCurrentProject;
window.showModal = showModal;
window.hideModal = hideModal;
window.showAlert = showAlert;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.toggleTheme = toggleTheme;
