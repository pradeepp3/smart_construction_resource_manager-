// Labour Module

let allWorkers = [];
let currentCategory = 'All';
const workerCategories = ['Mason', 'Helper', 'Electrician', 'Carpenter'];

// Helper: Escape HTML (may already be global, but safe to redefine)
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
                <h2 class="card-title"><i class="ph ph-hard-hat"></i> Labour Management</h2>
                <div class="flex gap-sm">
                    <button class="btn btn-outline" onclick="showAttendanceModal()">
                        <i class="ph ph-check-square"></i> Mark Attendance
                    </button>
                    <button class="btn btn-primary" onclick="showAddWorkerModal()">
                        <i class="ph ph-plus"></i> Add Worker
                    </button>
                </div>
            </div>
            
            <!-- Interactive Category Filters -->
            <div class="grid grid-4 gap" style="margin-bottom: 1.5rem;">
                <div class="stat-card ${currentCategory === 'All' ? 'active-filter' : ''}" 
                     onclick="switchCategory('All')" 
                     style="cursor: pointer; border: ${currentCategory === 'All' ? '2px solid var(--primary)' : '1px solid var(--border)'}; transition: transform 0.2s;">
                    <div class="flex-between">
                        <div class="stat-label">Total Workforce</div>
                        <i class="ph ph-users-three" style="font-size: 1.5rem; color: var(--primary);"></i>
                    </div>
                    <div class="stat-value">${allWorkers.length}</div>
                    <div class="stat-label" style="font-size: 0.75rem;">Across all categories</div>
                </div>

                ${workerCategories.map(cat => {
        const count = allWorkers.filter(w => w.category === cat).length;
        const isActive = currentCategory === cat;
        let icon = 'ph-hard-hat';
        if (cat === 'Mason') icon = 'ph-wall';
        if (cat === 'Electrician') icon = 'ph-lightning';
        if (cat === 'Carpenter') icon = 'ph-hammer';
        if (cat === 'Helper') icon = 'ph-hand-palm';

        return `
                    <div class="stat-card ${isActive ? 'active-filter' : ''}" 
                         onclick="switchCategory('${cat}')"
                         style="cursor: pointer; border: ${isActive ? '2px solid var(--primary)' : '1px solid var(--border)'}; position: relative; overflow: hidden;">
                        <div class="flex-between">
                            <div class="stat-label">${cat}s</div>
                            <i class="ph ${icon}" style="font-size: 1.5rem; color: var(--text-muted);"></i>
                        </div>
                        <div class="stat-value">${count}</div>
                        <div style="height: 4px; width: 100%; background: var(--bg-hover); margin-top: 0.5rem; border-radius: 2px;">
                            <div style="height: 100%; width: ${(count / (allWorkers.length || 1) * 100)}%; background: ${isActive ? 'var(--primary)' : 'var(--text-muted)'};">
                            </div>
                        </div>
                    </div>
                    `;
    }).join('')}
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
                    <button class="modal-close" onclick="hideModal('workerModal')"><i class="ph ph-x"></i></button>
                </div>
                <form id="workerForm" onsubmit="event.preventDefault(); handleSaveWorker();">
                    <input type="hidden" id="workerId" />
                    
                    <div class="grid grid-2 gap">
                        <div class="form-group">
                            <label class="form-label">Worker Name</label>
                            <input type="text" id="workerName" class="form-input" required />
                        </div>
                        <div class="form-group" id="workerCategoryGroup">
                            <label class="form-label">Category</label>
                            <select id="workerCategory" class="form-select" required onchange="toggleCategoryFields()">
                                ${workerCategories.map(cat => `
                                    <option value="${cat}">${cat}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-2 gap">
                        <div class="form-group">
                            <label class="form-label">Payment Type</label>
                            <select id="workerPaymentType" class="form-select" onchange="togglePaymentFields()">
                                <option value="daily">Daily Wage</option>
                                <option value="sqft">Sq. Feet Basis</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" id="workerPhone" class="form-input" required pattern="[0-9]{10}" maxlength="10" placeholder="10-digit number" oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                        </div>
                    </div>
                    
                    <!-- Daily Wage Fields -->
                    <div id="wageFields" class="grid grid-2 gap">
                        <div class="form-group">
                            <label class="form-label">Daily Wage (₹)</label>
                            <input type="number" id="workerWage" class="form-input" step="0.01" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Days Worked</label>
                            <input type="number" id="workerDays" class="form-input" min="0" value="0" />
                        </div>
                    </div>

                    <!-- SqFt Fields -->
                    <div id="sqftFields" class="grid grid-2 gap" style="display: none;">
                        <div class="form-group">
                            <label class="form-label">Rate per Sq. Ft (₹)</label>
                            <input type="number" id="workerSqftRate" class="form-input" step="0.01" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Total Sq. Ft Done</label>
                            <input type="number" id="workerSqftArea" class="form-input" min="0" value="0" step="0.01" />
                        </div>
                    </div>


                    <div class="form-group">
                         <label class="form-label">Tools Assigned (comma-separated)</label>
                         <input type="text" id="workerTools" class="form-input" placeholder="e.g., Hammer, Drill" />
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
                    <h3 class="modal-title"><i class="ph ph-calculator"></i> Cost Calculator</h3>
                    <button class="modal-close" onclick="hideModal('costCalculatorModal')"><i class="ph ph-x"></i></button>
                </div>
                <div id="calculatorContent">
                    ${renderCostCalculator()}
                </div>
            </div>
        </div>
        
        <!-- Attendance Modal -->
        <div id="attendanceModal" class="modal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="ph ph-calendar-check"></i> Mark Daily Attendance</h3>
                    <button class="modal-close" onclick="hideModal('attendanceModal')"><i class="ph ph-x"></i></button>
                </div>
                
                <div style="padding: 1.5rem;">
                    <div class="flex-between mb-1" style="align-items: center; margin-bottom: 1rem;">
                        <div class="form-group mb-0" style="margin-bottom: 0;">
                            <label class="form-label">Date</label>
                            <input type="date" id="attendanceDate" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
                        </div>
                        <label class="flex gap-sm" style="cursor: pointer; user-select: none; align-items: center;">
                            <input type="checkbox" id="selectAllAttendance" onchange="toggleSelectAllAttendance(this)" checked />
                            <span>Select All</span>
                        </label>
                    </div>
                    
                    <div id="attendanceList" style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.5rem; background: var(--bg-card);">
                        <!-- Rendered via JS -->
                    </div>
                    
                    <div class="flex gap mt-2" style="margin-top: 1.5rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-outline" onclick="hideModal('attendanceModal')">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" onclick="saveAttendance()">
                            <i class="ph ph-check"></i> Save Attendance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderWorkersList() {
    const categoryWorkers = currentCategory === 'All'
        ? allWorkers
        : allWorkers.filter(w => w.category === currentCategory);

    if (categoryWorkers.length === 0) {
        return `
            <div style="text-align: center; padding: 4rem; color: var(--text-muted); border: 2px dashed var(--border); border-radius: var(--radius-lg);">
                <i class="ph ph-users" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No ${currentCategory === 'All' ? 'workers' : currentCategory.toLowerCase() + 's'} found for this project.</p>
                <button class="btn btn-primary mt-1" onclick="showAddWorkerModal()">
                    <i class="ph ph-plus"></i> Add New Worker
                </button>
            </div>
        `;
    }

    return `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Worker Details</th>
                        <th>Category</th>
                        <th>Wage Details</th>
                        <th>Status</th>
                        <th>Total Cost / Capital</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryWorkers.map(worker => {
        const isDaily = worker.wageType !== 'sqft';
        const totalCost = isDaily
            ? (worker.dailyWage || 0) * (worker.daysWorked || 0)
            : (worker.sqftRate || 0) * (worker.sqftArea || 0);

        const wageDisplay = isDaily
            ? `${formatCurrency(worker.dailyWage)}<span style="font-size:0.7em; color:var(--text-muted)">/day</span>`
            : `${formatCurrency(worker.sqftRate)}<span style="font-size:0.7em; color:var(--text-muted)">/sqft</span>`;

        const workDisplay = isDaily
            ? `${worker.daysWorked || 0} Days`
            : `${worker.sqftArea || 0} sqft`;

        const isElectrician = worker.category === 'Electrician';
        const totalCapital = parseFloat(worker.totalCapital) || 0;

        // Render Total Cost / Capital column
        let costCell = '';
        if (isElectrician) {
            costCell = `
                <div>
                    <button class="electrician-capital-btn" 
                            onclick="openElectricianPayments('${worker._id}')"
                            title="Click to manage team &amp; weekly payments">
                        <i class="ph ph-users" style="color: var(--warning);"></i>
                        <span class="capital-amount">Manage Team</span>
                        <i class="ph ph-arrow-right" style="font-size:0.75rem; opacity:0.6;"></i>
                    </button>
                </div>`;
        } else {
            costCell = `<strong class="text-expense">${formatCurrency(totalCost)}</strong>`;
        }

        return `
                            <tr>
                                <td>
                                    <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(worker.name)}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(worker.phone)}</div>
                                </td>
                                <td>
                                    <span class="badge ${worker.category === 'Electrician' ? 'badge-warning' : 'badge-info'}">${worker.category}</span>
                                </td>
                                <td>
                                    <div class="font-mono">${wageDisplay}</div>
                                    <div style="font-size: 0.75rem; margin-top: 2px; color: var(--text-muted);">${workDisplay}</div>
                                </td>
                                <td>
                                    <span class="badge ${isElectrician || totalCost > 0 ? 'badge-success' : 'badge-warning'}">
                                        ${isElectrician || totalCost > 0 ? 'Active' : 'Pending'}
                                    </span>
                                </td>
                                <td>${costCell}</td>
                                <td>
                                    <button class="btn btn-sm btn-secondary" 
                                            onclick="editWorker('${worker._id}')">
                                        <i class="ph ph-pencil-simple"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" 
                                            onclick="deleteWorker('${worker._id}')">
                                        <i class="ph ph-trash"></i>
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
    return workerCategories.map((category, index) => {
        const categoryWorkers = allWorkers.filter(w => w.category === category);
        const totalWorkers = categoryWorkers.length;
        const totalCost = categoryWorkers.reduce((sum, w) => {
            const cost = w.wageType === 'sqft'
                ? (w.sqftRate || 0) * (w.sqftArea || 0)
                : (w.dailyWage || 0) * (w.daysWorked || 0);
            return sum + cost;
        }, 0);

        // Cycle through gradient classes 1-4
        const gradientClass = `card-gradient-${(index % 4) + 1}`;

        return `
            <div class="stat-card ${gradientClass}">
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

    loadLabourView().then(content => {
        document.getElementById('view-container').innerHTML = content;
    });
}

function showAddWorkerModal() {
    const isSpecific = currentCategory !== 'All';
    const title = isSpecific ? `Add New ${currentCategory}` : 'Add New Worker';

    document.getElementById('workerModalTitle').textContent = title;
    document.getElementById('workerForm').reset();
    document.getElementById('workerId').value = '';

    const catSelect = document.getElementById('workerCategory');
    const catGroup = document.getElementById('workerCategoryGroup');

    if (isSpecific) {
        catSelect.value = currentCategory;
        if (catGroup) catGroup.style.display = 'none';
    } else {
        catSelect.value = 'Mason'; // Default
        if (catGroup) catGroup.style.display = 'block';
    }

    toggleCategoryFields();
    showModal('workerModal');
}

async function editWorker(workerId) {
    const worker = allWorkers.find(w => w._id === workerId);
    if (!worker) return;

    document.getElementById('workerModalTitle').textContent = 'Edit Worker';

    // Ensure category is visible when editing
    const catGroup = document.getElementById('workerCategoryGroup');
    if (catGroup) catGroup.style.display = 'block';

    document.getElementById('workerId').value = worker._id;
    document.getElementById('workerName').value = worker.name;
    document.getElementById('workerCategory').value = worker.category;
    document.getElementById('workerPhone').value = worker.phone;

    // Payment Details
    const paymentType = worker.wageType || 'daily';
    document.getElementById('workerPaymentType').value = paymentType;

    // Wage Fields
    document.getElementById('workerWage').value = worker.dailyWage || '';
    document.getElementById('workerDays').value = worker.daysWorked || 0;

    // SqFt Fields
    document.getElementById('workerSqftRate').value = worker.sqftRate || '';
    document.getElementById('workerSqftArea').value = worker.sqftArea || 0;

    // Toggle visibility based on type
    togglePaymentFields();
    toggleCategoryFields();

    // Electrician capital
    const capitalField = document.getElementById('workerTotalCapital');
    if (capitalField) capitalField.value = worker.totalCapital || 0;

    document.getElementById('workerTools').value = worker.tools ? worker.tools.join(', ') : '';
    document.getElementById('workerNotes').value = worker.notes || '';

    showModal('workerModal');
}

async function handleSaveWorker() {
    try {
        const workerId = document.getElementById('workerId').value;
        const name = document.getElementById('workerName').value.trim();
        const phone = document.getElementById('workerPhone').value.trim();
        const paymentType = document.getElementById('workerPaymentType').value;
        const category = document.getElementById('workerCategory').value;

        // Professional Validation
        if (!name) {
            showAlert('Please enter a worker name', 'warning');
            document.getElementById('workerName').focus();
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            showAlert('Please enter a valid 10-digit mobile number', 'warning');
            document.getElementById('workerPhone').focus();
            return;
        }

        let totalCost = 0;
        let dailyWage = 0;
        let daysWorked = 0;
        let sqftRate = 0;
        let sqftArea = 0;

        if (paymentType === 'daily') {
            dailyWage = parseFloat(document.getElementById('workerWage').value);
            daysWorked = parseFloat(document.getElementById('workerDays').value) || 0;

            if (isNaN(dailyWage) || dailyWage <= 0) {
                showAlert('Please enter a valid daily wage', 'warning');
                document.getElementById('workerWage').focus();
                return;
            }
            totalCost = dailyWage * daysWorked;
        } else {
            sqftRate = parseFloat(document.getElementById('workerSqftRate').value);
            sqftArea = parseFloat(document.getElementById('workerSqftArea').value) || 0;

            if (isNaN(sqftRate) || sqftRate <= 0) {
                showAlert('Please enter a valid rate per sq. ft', 'warning');
                document.getElementById('workerSqftRate').focus();
                return;
            }
            totalCost = sqftRate * sqftArea;
        }

        const toolsInput = document.getElementById('workerTools').value;
        const tools = toolsInput ? toolsInput.split(',').map(t => t.trim()).filter(t => t) : [];


        const workerData = {
            projectId: AppState.currentProject._id,
            name: name,
            category: category,
            phone: phone,
            wageType: paymentType,
            dailyWage: dailyWage,
            daysWorked: daysWorked,
            sqftRate: sqftRate,
            sqftArea: sqftArea,
            totalCost: totalCost,
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
            document.getElementById('view-container').innerHTML = updatedContent;
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

function togglePaymentFields() {
    const type = document.getElementById('workerPaymentType').value;
    const wageFields = document.getElementById('wageFields');
    const sqftFields = document.getElementById('sqftFields');

    if (!wageFields || !sqftFields) return;

    if (type === 'daily') {
        wageFields.style.display = 'grid';
        sqftFields.style.display = 'none';

        const wWage = document.getElementById('workerWage');
        const wRate = document.getElementById('workerSqftRate');
        if (wWage) wWage.required = true;
        if (wRate) wRate.required = false;
    } else {
        wageFields.style.display = 'none';
        sqftFields.style.display = 'grid';

        const wWage = document.getElementById('workerWage');
        const wRate = document.getElementById('workerSqftRate');
        if (wWage) wWage.required = false;
        if (wRate) wRate.required = true;
    }
}

function toggleCategoryFields() {
    // No extra fields needed based on category (totalCapital removed)
}

// Navigate to electrician payment page
function openElectricianPayments(workerId) {
    const worker = allWorkers.find(w => w._id === workerId);
    if (!worker) return;
    AppState.currentElectricianWorkerId = workerId;
    AppState.currentElectricianWorker = worker;
    navigateTo('electrician-payments');
}

function showAttendanceModal() {
    const list = document.getElementById('attendanceList');

    // Filter pertinent workers: Daily Wage Only AND (Mason or Helper)
    const dailyWorkers = allWorkers.filter(w =>
        w.wageType !== 'sqft' &&
        ['Mason', 'Helper'].includes(w.category)
    ).sort((a, b) => a.category.localeCompare(b.category));

    if (dailyWorkers.length === 0) {
        list.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-muted);">No Masons or Helpers found.</div>`;
    } else {
        list.innerHTML = dailyWorkers.map(w => {
            return `
            <label class="flex-between p-2 hover-bg" style="cursor: pointer; border-bottom: 1px solid var(--border-light); padding: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <div class="flex gap-sm" style="align-items: center;">
                    <span class="badge badge-info is-small" style="margin-right:0.5rem;">${w.category}</span>
                    <span style="font-weight: 500;">${escapeHtml(w.name)}</span>
                </div>
                <input type="checkbox" class="attendance-check" style="width: 1.1rem; height: 1.1rem;" value="${w._id}" checked />
            </label>
            `;
        }).join('');
    }

    showModal('attendanceModal');
}

function toggleSelectAllAttendance(source) {
    const checkboxes = document.querySelectorAll('.attendance-check');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

async function saveAttendance() {
    const checked = Array.from(document.querySelectorAll('.attendance-check:checked')).map(cb => cb.value);

    if (checked.length === 0) {
        showAlert('No workers selected', 'warning');
        return;
    }

    if (!confirm(`Mark attendance (+1 day) for ${checked.length} workers?`)) return;

    showLoading();
    try {
        const updates = checked.map(id => {
            const worker = allWorkers.find(w => w._id === id);
            if (!worker) return null;

            const newDays = (worker.daysWorked || 0) + 1;
            const newCost = (worker.dailyWage || 0) * newDays;

            return window.api.labour.update(id, {
                projectId: worker.projectId,
                daysWorked: newDays,
                totalCost: newCost
            });
        }).filter(p => p !== null);

        await Promise.all(updates);

        hideLoading();
        showAlert('Attendance marked successfully', 'success');
        hideModal('attendanceModal');

        // Refresh view
        const updatedContent = await loadLabourView();
        document.getElementById('view-container').innerHTML = updatedContent;
        if (currentCategory) switchCategory(currentCategory);

    } catch (error) {
        hideLoading();
        console.error('Error saving attendance:', error);
        showAlert('Failed to save attendance: ' + error.message, 'danger');
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
window.togglePaymentFields = togglePaymentFields;
window.toggleCategoryFields = toggleCategoryFields;
window.showAttendanceModal = showAttendanceModal;
window.toggleSelectAllAttendance = toggleSelectAllAttendance;
window.saveAttendance = saveAttendance;
window.openElectricianPayments = openElectricianPayments;
window.escapeHtml = escapeHtml;
