// Project Management Module

let allProjects = [];

async function loadProjectsView() {
    const result = await window.api.projects.getAll();

    if (result.success) {
        allProjects = result.data;
    } else {
        allProjects = [];
    }

    return `
        <div class="projects-container">
            <div class="card-header">
                <h2 class="card-title"><i class="ph ph-clipboard-text"></i> Project Management</h2>
                <button class="btn btn-primary" onclick="showAddProjectModal()">
                    <i class="ph ph-plus"></i> Add New Project
                </button>
            </div>
            
            <div class="grid grid-3 mt-2" id="projectsGrid">
                ${renderProjectCards()}
            </div>
        </div>
        
        <!-- Add Project Modal -->
        <div id="addProjectModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Add New Project</h3>
                    <button class="modal-close" onclick="hideModal('addProjectModal')"><i class="ph ph-x"></i></button>
                </div>
                <form id="addProjectForm" onsubmit="event.preventDefault(); handleAddProject();">
                    <div class="form-group">
                        <label class="form-label">Project Name</label>
                        <input type="text" id="projectName" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" id="projectLocation" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea id="projectDescription" class="form-textarea"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Budget (₹)</label>
                        <input type="number" id="projectBudget" class="form-input" step="0.01" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input type="date" id="projectStartDate" class="form-input" required />
                    </div>
                    <div class="flex gap">
                        <button type="button" class="btn btn-outline" onclick="hideModal('addProjectModal')">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderProjectCards() {
    if (allProjects.length === 0) {
        return `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <h3 style="color: var(--text-muted);"><i class="ph ph-folder-dashed" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>No projects yet</h3>
                <p style="color: var(--text-muted);">Click "Add New Project" to get started</p>
            </div>
        `;
    }

    return allProjects.map(project => `
        <div class="card" style="cursor: pointer;" onclick="selectProject('${project._id}')">
            <div class="card-header">
                <h3 class="card-title">${escapeHtml(project.name)}</h3>
                ${AppState.currentProject && AppState.currentProject._id === project._id
            ? '<span class="badge badge-success">Active</span>'
            : ''}
            </div>
            <div class="card-body">
                <p><strong><i class="ph ph-map-pin"></i> Location:</strong> ${escapeHtml(project.location)}</p>
                <p><strong><i class="ph ph-currency-inr"></i> Budget:</strong> ${formatCurrency(project.budget)}</p>
                <p><strong><i class="ph ph-calendar-blank"></i> Start Date:</strong> ${formatDate(project.startDate)}</p>
                ${project.description ? `<p style="margin-top: 0.5rem; color: var(--text-muted);">${escapeHtml(project.description)}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function initializeProjects() {
    // Event handlers are set up via inline onclick
}

function showAddProjectModal() {
    showModal('addProjectModal');
}

async function handleAddProject() {
    try {
        const name = document.getElementById('projectName').value.trim();
        const location = document.getElementById('projectLocation').value.trim();
        const budget = parseFloat(document.getElementById('projectBudget').value);
        const startDate = document.getElementById('projectStartDate').value;

        // Validation
        if (!name) {
            showAlert('Please enter project name', 'warning');
            document.getElementById('projectName').focus();
            return;
        }

        if (!location) {
            showAlert('Please enter project location', 'warning');
            document.getElementById('projectLocation').focus();
            return;
        }

        if (isNaN(budget) || budget <= 0) {
            showAlert('Please enter a valid budget amount', 'warning');
            document.getElementById('projectBudget').focus();
            return;
        }

        if (!startDate) {
            showAlert('Please select a start date', 'warning');
            document.getElementById('projectStartDate').focus();
            return;
        }

        const projectData = {
            name: name,
            location: location,
            description: document.getElementById('projectDescription').value.trim(),
            budget: budget,
            startDate: startDate,
            createdAt: new Date()
        };

        showLoading();
        const result = await window.api.projects.create(projectData);
        hideLoading();

        if (result && result.success) {
            showAlert('Project created successfully!', 'success');
            hideModal('addProjectModal');
            document.getElementById('addProjectForm').reset();
            // Reload view to show new project
            const updatedContent = await loadProjectsView();
            document.getElementById('main-content').innerHTML = updatedContent;
        } else {
            throw new Error(result ? result.message : 'Unknown error occurred');
        }
    } catch (error) {
        hideLoading();
        console.error('Error creating project:', error);
        showAlert('Failed to create project: ' + error.message, 'danger');
    }
}

async function selectProject(projectId) {
    console.log('Selecting project:', projectId);
    showLoading();
    const result = await window.api.projects.getById(projectId);
    console.log('Selection result:', result);
    hideLoading();

    if (result.success && result.data) {
        setCurrentProject(result.data);
        showAlert('Project selected: ' + result.data.name, 'success');
        navigateTo('labour'); // Navigate to labour module after selecting project
    } else {
        console.error('Project selection failed:', result);
        showAlert('Failed to select project: ' + (result.message || 'Project not found'), 'danger');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose functions globally
window.loadProjectsView = loadProjectsView;
window.initializeProjects = initializeProjects;
window.showAddProjectModal = showAddProjectModal;
window.handleAddProject = handleAddProject;
window.selectProject = selectProject;
window.escapeHtml = escapeHtml;
