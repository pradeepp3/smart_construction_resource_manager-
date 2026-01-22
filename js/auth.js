// Authentication Module

async function login(username, password) {
    try {
        showLoading();
        const result = await window.api.auth.login({ username, password });

        if (result.success) {
            AppState.currentUser = result.user;
            showAlert('Login successful!', 'success');
            await loadCurrentProject();
            navigateTo('projects');
        } else {
            showAlert(result.message || 'Login failed', 'danger');
        }
    } catch (error) {
        showAlert('Login error: ' + error.message, 'danger');
    } finally {
        hideLoading();
    }
}

async function logout() {
    try {
        await window.api.auth.logout();
        AppState.currentUser = null;
        AppState.currentProject = null;
        localStorage.removeItem('currentProjectId');
        navigateTo('login');
        showAlert('Logged out successfully', 'success');
    } catch (error) {
        showAlert('Logout error: ' + error.message, 'danger');
    }
}

function loadLoginView() {
    return `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 80vh;">
            <div class="card" style="width: 450px; max-width: 90%;">
                <div class="card-header">
                    <h2 class="card-title" style="text-align: center; width: 100%;">
                        🏗️ Construction Manager
                    </h2>
                </div>
                <div class="card-body">
                    <form id="loginForm" onsubmit="event.preventDefault(); handleLogin();">
                        <div class="form-group">
                            <label class="form-label">Username</label>
                            <input 
                                type="text" 
                                id="loginUsername" 
                                class="form-input" 
                                required 
                                autofocus
                                placeholder="Enter username"
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input 
                                type="password" 
                                id="loginPassword" 
                                class="form-input" 
                                required
                                placeholder="Enter password"
                            />
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg w-full">
                            Login
                        </button>
                        <div style="margin-top: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                            Default credentials: admin / admin123
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function initializeLogin() {
    // Login form is already set up with inline onsubmit
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    login(username, password);
}

// Expose functions globally
window.loadLoginView = loadLoginView;
window.initializeLogin = initializeLogin;
window.handleLogin = handleLogin;
window.login = login;
window.logout = logout;
