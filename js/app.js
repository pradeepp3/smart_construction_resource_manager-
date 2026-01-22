// Application State
const AppState = {
    currentUser: null,
    currentProject: null,
    currentView: 'login'
};

// Router - Navigate between views
async function navigateTo(viewName) {
    AppState.currentView = viewName;

    const mainContent = document.getElementById('main-content');
    const navbar = document.getElementById('navbar');

    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });

    // Show loading
    showLoading();

    try {
        let content = '';

        switch (viewName) {
            case 'login':
                navbar.style.display = 'none';
                content = await loadLoginView();
                break;
            case 'projects':
                navbar.style.display = 'flex';
                content = await loadProjectsView();
                break;
            case 'labour':
                navbar.style.display = 'flex';
                content = await loadLabourView();
                break;
            case 'materials':
                navbar.style.display = 'flex';
                content = await loadMaterialsView();
                break;
            case 'equipment':
                navbar.style.display = 'flex';
                content = await loadEquipmentView();
                break;
            case 'finance':
                navbar.style.display = 'flex';
                content = await loadFinanceView();
                break;
            case 'settings':
                navbar.style.display = 'flex';
                content = await loadSettingsView();
                break;
            default:
                content = '<h1>Page Not Found</h1>';
        }

        mainContent.innerHTML = content;

        // Initialize view-specific functionality
        initializeCurrentView(viewName);

    } catch (error) {
        console.error('Navigation error:', error);
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading view: ${error.message}</div>`;
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
    document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            navigateTo(view);
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
            navigateTo('projects');
        } else {
            navigateTo('login');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('Failed to initialize app: ' + error.message, 'danger');
    }
});

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
