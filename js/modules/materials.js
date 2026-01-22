// Materials Module

let allMaterials = [];
const materialCategories = ['Cement', 'Steel', 'Bricks', 'Sand', 'Gravel', 'Wood', 'Paint', 'Other'];

async function loadMaterialsView() {
    if (!AppState.currentProject) {
        return `
            <div class="alert alert-warning">
                <h3>No Project Selected</h3>
                <p>Please select a project from the Projects page to manage materials.</p>
                <button class="btn btn-primary" onclick="navigateTo('projects')">Go to Projects</button>
            </div>
        `;
    }

    const result = await window.api.materials.getAll(AppState.currentProject._id);
    if (result.success) {
        allMaterials = result.data;
    } else {
        allMaterials = [];
    }

    const totalCost = allMaterials.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const totalQuantity = allMaterials.reduce((sum, m) => sum + (m.quantity || 0), 0);

    return `
        <div class="materials-container">
            <div class="card-header">
                <h2 class="card-title">🧱 Materials Management</h2>
                <button class="btn btn-primary" onclick="showAddMaterialModal()">
                    + Add Material
                </button>
            </div>
            
            <!-- Summary Cards -->
            <div class="grid grid-4 mt-2">
                <div class="stat-card">
                    <div class="stat-label">Total Materials</div>
                    <div class="stat-value">${allMaterials.length}</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);">
                    <div class="stat-label">Total Quantity</div>
                    <div class="stat-value">${totalQuantity.toLocaleString()}</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, var(--success) 0%, #059669 100%);">
                    <div class="stat-label">Total Cost</div>
                    <div class="stat-value">${formatCurrency(totalCost)}</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, var(--info) 0%, #0e7490 100%);">
                    <div class="stat-label">Categories</div>
                    <div class="stat-value">${new Set(allMaterials.map(m => m.category)).size}</div>
                </div>
            </div>
            
            <!-- Materials Table -->
            <div class="card mt-2">
                <div class="card-body">
                    ${renderMaterialsTable()}
                </div>
            </div>
        </div>
        
        <!-- Add/Edit Material Modal -->
        <div id="materialModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="materialModalTitle">Add Material</h3>
                    <button class="modal-close" onclick="hideModal('materialModal')">&times;</button>
                </div>
                <form id="materialForm" onsubmit="event.preventDefault(); handleSaveMaterial();">
                    <input type="hidden" id="materialId" />
                    
                    <div class="grid grid-2 gap">
                        <div class="form-group">
                            <label class="form-label">Material Name</label>
                            <input type="text" id="materialName" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select id="materialCategory" class="form-select" required>
                                ${materialCategories.map(cat => `
                                    <option value="${cat}">${cat}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-3 gap">
                        <div class="form-group">
                            <label class="form-label">Quantity</label>
                            <input type="number" id="materialQuantity" class="form-input" step="0.01" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Unit</label>
                            <input type="text" id="materialUnit" class="form-input" 
                                   placeholder="kg, bags, tons, etc." required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Unit Price (₹)</label>
                            <input type="number" id="materialUnitPrice" class="form-input" step="0.01" required />
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Supplier</label>
                        <input type="text" id="materialSupplier" class="form-input" />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea id="materialNotes" class="form-textarea"></textarea>
                    </div>
                    
                    <div class="flex gap">
                        <button type="button" class="btn btn-outline" onclick="hideModal('materialModal')">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Save Material
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderMaterialsTable() {
    if (allMaterials.length === 0) {
        return `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p>No materials added yet</p>
                <button class="btn btn-primary mt-1" onclick="showAddMaterialModal()">
                    Add Material
                </button>
            </div>
        `;
    }

    return `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Material Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total Cost</th>
                        <th>Supplier</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allMaterials.map(material => `
                        <tr>
                            <td><strong>${escapeHtml(material.name)}</strong></td>
                            <td><span class="badge badge-info">${material.category}</span></td>
                            <td>${material.quantity} ${material.unit}</td>
                            <td>${formatCurrency(material.unitPrice)}</td>
                            <td><strong>${formatCurrency(material.totalCost)}</strong></td>
                            <td>${escapeHtml(material.supplier || '-')}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" 
                                        onclick="editMaterial('${material._id}')">
                                    Edit
                                </button>
                                <button class="btn btn-sm btn-danger" 
                                        onclick="deleteMaterial('${material._id}')">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function initializeMaterials() {
    // Event handlers are inline
}

function showAddMaterialModal() {
    document.getElementById('materialModalTitle').textContent = 'Add Material';
    document.getElementById('materialForm').reset();
    document.getElementById('materialId').value = '';
    showModal('materialModal');
}

async function editMaterial(materialId) {
    const material = allMaterials.find(m => m._id === materialId);
    if (!material) return;

    document.getElementById('materialModalTitle').textContent = 'Edit Material';
    document.getElementById('materialId').value = material._id;
    document.getElementById('materialName').value = material.name;
    document.getElementById('materialCategory').value = material.category;
    document.getElementById('materialQuantity').value = material.quantity;
    document.getElementById('materialUnit').value = material.unit;
    document.getElementById('materialUnitPrice').value = material.unitPrice;
    document.getElementById('materialSupplier').value = material.supplier || '';
    document.getElementById('materialNotes').value = material.notes || '';

    showModal('materialModal');
}

async function handleSaveMaterial() {
    try {
        const materialId = document.getElementById('materialId').value;
        const name = document.getElementById('materialName').value.trim();
        const quantity = parseFloat(document.getElementById('materialQuantity').value);
        const unitPrice = parseFloat(document.getElementById('materialUnitPrice').value);
        const unit = document.getElementById('materialUnit').value.trim();

        // Professional Validation
        if (!name) {
            showAlert('Please enter a material name', 'warning');
            document.getElementById('materialName').focus();
            return;
        }

        if (isNaN(quantity) || quantity <= 0) {
            showAlert('Please enter a valid quantity', 'warning');
            document.getElementById('materialQuantity').focus();
            return;
        }

        if (isNaN(unitPrice) || unitPrice < 0) {
            showAlert('Please enter a valid unit price', 'warning');
            document.getElementById('materialUnitPrice').focus();
            return;
        }

        if (!unit) {
            showAlert('Please specify a unit (e.g., kg, bags)', 'warning');
            document.getElementById('materialUnit').focus();
            return;
        }

        const materialData = {
            projectId: AppState.currentProject._id,
            name: name,
            category: document.getElementById('materialCategory').value,
            quantity: quantity,
            unit: unit,
            unitPrice: unitPrice,
            totalCost: quantity * unitPrice,
            supplier: document.getElementById('materialSupplier').value.trim(),
            notes: document.getElementById('materialNotes').value.trim()
        };

        showLoading();
        let result;
        if (materialId) {
            result = await window.api.materials.update(materialId, materialData);
        } else {
            result = await window.api.materials.create(materialData);
        }
        hideLoading();

        if (result && result.success) {
            showAlert(materialId ? 'Material details updated successfully' : 'New material added successfully', 'success');
            hideModal('materialModal');
            // Refresh view
            const updatedContent = await loadMaterialsView();
            document.getElementById('main-content').innerHTML = updatedContent;
        } else {
            throw new Error(result ? result.message : 'Unknown error occurred');
        }
    } catch (error) {
        hideLoading();
        console.error('Error saving material:', error);
        showAlert('Failed to save material: ' + error.message, 'danger');
    }
}

async function deleteMaterial(materialId) {
    if (!confirm('Are you sure you want to delete this material?')) return;

    showLoading();
    const result = await window.api.materials.delete(materialId);
    hideLoading();

    if (result.success) {
        showAlert('Material deleted', 'success');
        navigateTo('materials'); // Reload
    } else {
        showAlert('Failed to delete material', 'danger');
    }
}

// Expose functions globally
window.loadMaterialsView = loadMaterialsView;
window.initializeMaterials = initializeMaterials;
window.showAddMaterialModal = showAddMaterialModal;
window.editMaterial = editMaterial;
window.handleSaveMaterial = handleSaveMaterial;
window.deleteMaterial = deleteMaterial;
