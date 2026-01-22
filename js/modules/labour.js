// Labour Module

let allWorkers = [];
let currentCategory = 'Mason';
const workerCategories = ['Mason', 'Helper', 'Electrician', 'Carpenter'];

async function loadLabourView() {
    if (!AppState.currentProject) {
        return `
            <div class="alert alert-warning">
                <h3>No Project Selected</h3>
                <p>Please select a project from the Projects page to manage labour.</p>
                <button class="btn btn-primary" onclick="navigateTo('projects')">Go to Projects</button>
            </div>
        `;
    }

    const result = await window.api.labour.getAll(AppState.currentProject._id);
    if (result.success) {
        allWorkers = result.data;
    } else {
        allWorkers = [];
    }

    return `
        <div class="labour-container">
            <div class="card-header">
                <h2 class="card-title">👷 Labour Management</h2>
                <button class="btn btn-primary" onclick="showAddWorkerModal()">
                    + Add Worker
                </button>
            </div>
            
            <!-- Category Tabs -->
            <div class="tabs mt-2">
                ${workerCategories.map(cat => `
                    <button class="tab ${cat === currentCategory ? 'active' : ''}" 
                            onclick="switchCategory('${cat}')">
                        ${cat}
                    </button>
                `).join('')}
            </div>
            
            <!-- Workers List -->
            <div class="card mt-1">
                <div class="card-body">
                    <div id="workersContainer">
                        ${renderWorkersList()}
                    </div>
                </div>
            </div>
            
            <!-- Cost Summary -->
            <div class="grid grid-4 mt-2">
                ${renderCategoryCostSummary()}
            </div>
        </div>
        
        <!-- Add/Edit Worker Modal -->
        <div id="workerModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="workerModalTitle">Add Worker</h3>
                    <button class="modal-close" onclick="hideModal('workerModal')">&times;</button>
                </div>
                <form id="workerForm" onsubmit="event.preventDefault(); handleSaveWorker();">
                    <input type="hidden" id="workerId" />
                    
                    <div class="grid grid-2 gap">
                        <div class="form-group">
                            <label class="form-label">Worker Name</label>
                            <input type="text" id="workerName" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select id="workerCategory" class="form-select" required>
                                ${workerCategories.map(cat => `
                                    <option value="${cat}">${cat}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-2 gap">
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" id="workerPhone" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Daily Wage (₹)</label>
                            <input type="number" id="workerWage" class="form-input" step="0.01" required />
                        </div>
                    </div>
                    
                    <div class="grid grid-2 gap">
                        <div class="form-group">
                            <label class="form-label">Days Worked</label>
                            <input type="number" id="workerDays" class="form-input" min="0" value="0" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Experience (Years)</label>
                            <input type="number" id="workerExperience" class="form-input" min="0" value="0" />
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tools Assigned (comma-separated)</label>
                        <input type="text" id="workerTools" class="form-input" 
                               placeholder="e.g., Hammer, Drill, Saw" />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea id="workerNotes" class="form-textarea"></textarea>
                    </div>
                    
                    <div class="flex gap">
                        <button type="button" class="btn btn-outline" onclick="hideModal('workerModal')">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Save Worker
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Cost Calculator Modal -->
        <div id="costCalculatorModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">💰 Cost Calculator</h3>
                    <button class="modal-close" onclick="hideModal('costCalculatorModal')">&times;</button>
                </div>
                <div id="calculatorContent">
                    ${renderCostCalculator()}
                </div>
            </div>
        </div>
    `;
}

function renderWorkersList() {
    const categoryWorkers = allWorkers.filter(w => w.category === currentCategory);

    if (categoryWorkers.length === 0) {
        return `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p>No ${currentCategory}s added yet</p>
                <button class="btn btn-primary mt-1" onclick="showAddWorkerModal()">
                    Add ${currentCategory}
                </button>
            </div>
        `;
    }

    return `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Daily Wage</th>
                        <th>Days Worked</th>
                        <th>Total Cost</th>
                        <th>Tools</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryWorkers.map(worker => {
        const totalCost = (worker.dailyWage || 0) * (worker.daysWorked || 0);
        return `
                            <tr>
                                <td><strong>${escapeHtml(worker.name)}</strong></td>
                                <td>${escapeHtml(worker.phone)}</td>
                                <td>${formatCurrency(worker.dailyWage)}</td>
                                <td>${worker.daysWorked || 0}</td>
                                <td><strong>${formatCurrency(totalCost)}</strong></td>
                                <td>${worker.tools ? worker.tools.slice(0, 2).join(', ') : '-'}</td>
                                <td>
                                    <button class="btn btn-sm btn-secondary" 
                                            onclick="editWorker('${worker._id}')">
                                        Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" 
                                            onclick="deleteWorker('${worker._id}')">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderCategoryCostSummary() {
    return workerCategories.map(category => {
        const categoryWorkers = allWorkers.filter(w => w.category === category);
        const totalWorkers = categoryWorkers.length;
        const totalCost = categoryWorkers.reduce((sum, w) =>
            sum + ((w.dailyWage || 0) * (w.daysWorked || 0)), 0
        );

        return `
            <div class="stat-card">
                <div class="stat-label">${category}s</div>
                <div class="stat-value">${totalWorkers}</div>
                <div class="stat-label">Total Cost: ${formatCurrency(totalCost)}</div>
            </div>
        `;
    }).join('');
}

function renderCostCalculator() {
    return `
        <div class="tabs">
            <button class="tab active" onclick="showCalculatorTab('wage')">
                Wage-Based
            </button>
            <button class="tab" onclick="showCalculatorTab('sqft')">
                Square-Feet Based
            </button>
        </div>
        
        <div id="wageCalculator" style="margin-top: 1.5rem;">
            <h4>Wage-Based Cost Calculation</h4>
            <div class="form-group">
                <label class="form-label">Number of Workers</label>
                <input type="number" id="calc_workers" class="form-input" value="1" min="1" />
            </div>
            <div class="form-group">
                <label class="form-label">Daily Wage per Worker (₹)</label>
                <input type="number" id="calc_wage" class="form-input" value="500" step="0.01" />
            </div>
            <div class="form-group">
                <label class="form-label">Number of Days</label>
                <input type="number" id="calc_days" class="form-input" value="1" min="1" />
            </div>
            <button class="btn btn-primary w-full" onclick="calculateWageCost()">
                Calculate
            </button>
            <div id="wageResult" class="mt-2"></div>
        </div>
        
        <div id="sqftCalculator" style="display: none; margin-top: 1.5rem;">
            <h4>Square-Feet Based Cost Calculation</h4>
            <div class="form-group">
                <label class="form-label">Total Area (sq ft)</label>
                <input type="number" id="calc_area" class="form-input" value="1000" step="0.01" />
            </div>
            <div class="form-group">
                <label class="form-label">Rate per Sq Ft (₹)</label>
                <input type="number" id="calc_rate" class="form-input" value="50" step="0.01" />
            </div>
            <button class="btn btn-primary w-full" onclick="calculateSqftCost()">
                Calculate
            </button>
            <div id="sqftResult" class="mt-2"></div>
        </div>
    `;
}

function initializeLabour() {
    // Event handlers are inline
}

function switchCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.trim() === category) {
            tab.classList.add('active');
        }
    });

    const workersContainer = document.getElementById('workersContainer');
    if (workersContainer) {
        workersContainer.innerHTML = renderWorkersList();
    }
}

function showAddWorkerModal() {
    document.getElementById('workerModalTitle').textContent = 'Add Worker';
    document.getElementById('workerForm').reset();
    document.getElementById('workerId').value = '';
    document.getElementById('workerCategory').value = currentCategory;
    showModal('workerModal');
}

async function editWorker(workerId) {
    const worker = allWorkers.find(w => w._id === workerId);
    if (!worker) return;

    document.getElementById('workerModalTitle').textContent = 'Edit Worker';
    document.getElementById('workerId').value = worker._id;
    document.getElementById('workerName').value = worker.name;
    document.getElementById('workerCategory').value = worker.category;
    document.getElementById('workerPhone').value = worker.phone;
    document.getElementById('workerWage').value = worker.dailyWage;
    document.getElementById('workerDays').value = worker.daysWorked || 0;
    document.getElementById('workerExperience').value = worker.experience || 0;
    document.getElementById('workerTools').value = worker.tools ? worker.tools.join(', ') : '';
    document.getElementById('workerNotes').value = worker.notes || '';

    showModal('workerModal');
}

async function handleSaveWorker() {
    try {
        const workerId = document.getElementById('workerId').value;
        const name = document.getElementById('workerName').value.trim();
        const phone = document.getElementById('workerPhone').value.trim();
        const dailyWage = parseFloat(document.getElementById('workerWage').value);

        // Professional Validation
        if (!name) {
            showAlert('Please enter a worker name', 'warning');
            document.getElementById('workerName').focus();
            return;
        }

        if (!phone) {
            showAlert('Please enter a phone number', 'warning');
            document.getElementById('workerPhone').focus();
            return;
        }

        if (isNaN(dailyWage) || dailyWage <= 0) {
            showAlert('Please enter a valid daily wage', 'warning');
            document.getElementById('workerWage').focus();
            return;
        }

        const toolsInput = document.getElementById('workerTools').value;
        const tools = toolsInput ? toolsInput.split(',').map(t => t.trim()).filter(t => t) : [];

        const workerData = {
            projectId: AppState.currentProject._id,
            name: name,
            category: document.getElementById('workerCategory').value,
            phone: phone,
            dailyWage: dailyWage,
            daysWorked: parseInt(document.getElementById('workerDays').value) || 0,
            experience: parseInt(document.getElementById('workerExperience').value) || 0,
            totalCost: (dailyWage * (parseInt(document.getElementById('workerDays').value) || 0)),
            tools: tools,
            notes: document.getElementById('workerNotes').value.trim()
        };

        showLoading();
        let result;
        if (workerId) {
            result = await window.api.labour.update(workerId, workerData);
        } else {
            result = await window.api.labour.create(workerData);
        }
        hideLoading();

        if (result && result.success) {
            showAlert(workerId ? 'Worker details updated successfully' : 'New worker added successfully', 'success');
            hideModal('workerModal');
            // Refresh view
            const updatedContent = await loadLabourView();
            document.getElementById('main-content').innerHTML = updatedContent;
            // Restore tab
            if (currentCategory) {
                switchCategory(currentCategory);
            }
        } else {
            throw new Error(result ? result.message : 'Unknown error occurred');
        }
    } catch (error) {
        hideLoading();
        console.error('Error saving worker:', error);
        showAlert('Failed to save worker: ' + error.message, 'danger');
    }
}

async function deleteWorker(workerId) {
    if (!confirm('Are you sure you want to delete this worker?')) return;

    showLoading();
    const result = await window.api.labour.delete(workerId);
    hideLoading();

    if (result.success) {
        showAlert('Worker deleted', 'success');
        navigateTo('labour'); // Reload
    } else {
        showAlert('Failed to delete worker', 'danger');
    }
}

function showCostCalculator() {
    showModal('costCalculatorModal');
}

function showCalculatorTab(type) {
    document.querySelectorAll('#costCalculatorModal .tab').forEach(tab => {
        tab.classList.remove('active');
    });

    if (type === 'wage') {
        event.target.classList.add('active');
        document.getElementById('wageCalculator').style.display = 'block';
        document.getElementById('sqftCalculator').style.display = 'none';
    } else {
        event.target.classList.add('active');
        document.getElementById('wageCalculator').style.display = 'none';
        document.getElementById('sqftCalculator').style.display = 'block';
    }
}

// Expose functions globally
window.loadLabourView = loadLabourView;
window.initializeLabour = initializeLabour;
window.switchCategory = switchCategory;
window.showAddWorkerModal = showAddWorkerModal;
window.editWorker = editWorker;
window.handleSaveWorker = handleSaveWorker;
window.deleteWorker = deleteWorker;
window.showCostCalculator = showCostCalculator;
window.showCalculatorTab = showCalculatorTab;
