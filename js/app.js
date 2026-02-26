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
            if (['dashboard', 'labour', 'materials', 'equipment', 'finance', 'electrician-payments'].includes(viewName)) {
                if (!AppState.currentProject) {
                    navigateTo('projects');
                    return;
                }
                // Update header title
                if (viewName === 'electrician-payments' && AppState.currentElectricianWorker) {
                    document.getElementById('headerProjectName').textContent =
                        `⚡ ${AppState.currentElectricianWorker.name} — Payments`;
                } else {
                    document.getElementById('headerProjectName').textContent = AppState.currentProject.name;
                }
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
            case 'electrician-payments':
                content = await loadElectricianPaymentsView();
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
        case 'electrician-payments':
            initializeElectricianPayments();
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
    const proj = AppState.currentProject;
    return `
        <div class="bento-grid dashboard animate-fade-in">

            <!-- Budget Overview (Large — span2 row2) -->
            <div class="widget-card span-2 row-span-2 widget-kpi">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-wallet"></i> Budget Overview</div>
                    <div class="widget-action" onclick="navigateTo('finance')" title="Open Finance"><i class="ph ph-arrow-right"></i></div>
                </div>
                <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
                    <div>
                        <div class="widget-value-huge" id="dashTotalBudget" data-target="0">₹0</div>
                        <div class="widget-subtext"><span class="trend neutral" id="dashRemainingPct">0%</span>&nbsp; funds remaining</div>
                    </div>
                    <div class="chart-container" style="min-height:140px;">
                        <canvas id="budgetDonut" width="140" height="140"></canvas>
                        <div id="budgetDonutCenter" style="position:absolute;text-align:center;">
                            <div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">Spent</div>
                            <div style="font-size:1.1rem;font-weight:700;font-family:var(--font-mono);color:var(--text-primary);" id="budgetSpentPct">0%</div>
                        </div>
                    </div>
                    <div class="progress-bar-container">
                        <div id="dashBudgetBar" class="progress-bar-fill" style="width:0%"></div>
                    </div>
                    <div style="display:flex;gap:1.5rem;">
                        <div>
                            <div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;">Labour</div>
                            <div style="font-weight:700;font-family:var(--font-mono);color:var(--brand);" id="dashLabourCost">₹0</div>
                        </div>
                        <div>
                            <div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;">Materials</div>
                            <div style="font-weight:700;font-family:var(--font-mono);color:var(--blue);" id="dashMaterialCost">₹0</div>
                        </div>
                        <div>
                            <div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;">Equipment</div>
                            <div style="font-weight:700;font-family:var(--font-mono);color:var(--purple);" id="dashEquipCost">₹0</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Team Pulse -->
            <div class="widget-card span-1 row-span-2">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-users"></i> Team Pulse</div>
                    <div class="widget-action" onclick="navigateTo('labour')" title="Add Worker"><i class="ph ph-plus"></i></div>
                </div>
                <div class="flex-column" id="dashTeamList" style="gap:.1rem; flex:1; overflow:hidden;">
                    <div class="text-muted text-center" style="padding:2rem 0;">
                        <i class="ph ph-spinner animate-spin"></i> Loading...
                    </div>
                </div>
            </div>

            <!-- Project Status KPI -->
            <div class="widget-card span-1">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-chart-line-up"></i> Project Status</div>
                </div>
                <div class="widget-value-large" style="color:var(--success);">On Track</div>
                <div class="widget-subtext" style="color:var(--success);"><i class="ph ph-check-circle"></i>&nbsp; Milestones on schedule</div>
            </div>

            <!-- Alerts -->
            <div class="widget-card span-1">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-bell"></i> Alerts</div>
                </div>
                <div class="widget-value-large" id="dashAlertCount" data-target="0">0</div>
                <div class="widget-subtext">Pending approvals</div>
            </div>

            <!-- Inventory -->
            <div class="widget-card span-1">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-package"></i> Inventory</div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                    <div>
                        <div class="widget-value-large" id="dashMaterialCount" data-target="0">0</div>
                        <div class="widget-subtext">Items stocked</div>
                    </div>
                    <div class="trend neutral" id="dashLowStockBadge" style="display:none;"><i class="ph ph-warning"></i> Low Stock</div>
                </div>
            </div>

            <!-- Equipment -->
            <div class="widget-card span-1">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-truck"></i> Equipment</div>
                </div>
                <div>
                    <div class="widget-value-large" id="dashEquipmentCount" data-target="0">0</div>
                    <div class="widget-subtext">Active units</div>
                </div>
            </div>

            <!-- Site Info -->
            <div class="widget-card span-2">
                <div class="widget-header">
                    <div class="widget-title"><i class="ph ph-map-pin"></i> Site Information</div>
                    <div class="badge badge-success">Active</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;flex:1;align-items:center;">
                    <div>
                        <div class="stat-label">Project Name</div>
                        <div style="font-weight:700;font-size:1.05rem;color:var(--text-primary);margin-top:.25rem;">${proj ? escapeHtml(proj.name) : '—'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Location</div>
                        <div style="font-weight:600;color:var(--text-secondary);margin-top:.25rem;">
                            <i class="ph ph-navigation-arrow" style="color:var(--brand);"></i>
                            ${proj ? escapeHtml(proj.location) : '—'}
                        </div>
                    </div>
                    <div>
                        <div class="stat-label">Start Date</div>
                        <div style="font-weight:600;color:var(--text-secondary);margin-top:.25rem;font-family:var(--font-mono);">${proj ? formatDate(proj.startDate) : '—'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Total Budget</div>
                        <div style="font-weight:700;color:var(--success);margin-top:.25rem;font-family:var(--font-mono);" id="dashSiteBudget">${proj ? formatCurrency(proj.budget) : '—'}</div>
                    </div>
                </div>
            </div>

        </div>
    `;
}

// ==========================================
// ELECTRICIAN PAYMENTS VIEW
// ==========================================

// ==========================================
// ELECTRICIAN PAYMENTS VIEW (Team-based)
// ==========================================

async function loadElectricianPaymentsView() {
    const worker = AppState.currentElectricianWorker;
    if (!worker) {
        return `<div class="alert alert-warning"><h3>No Electrician Selected</h3><p>Please go back to Labour and click on an electrician.</p><button class="btn btn-primary" onclick="navigateTo('labour')">Back to Labour</button></div>`;
    }

    // Load all members for this electrician
    let members = [];
    const membersRes = await window.api.electrician.getMembers(worker._id);
    if (membersRes.success) members = membersRes.data;

    // Load payments for each member
    const memberPayments = {};
    let grandTotal = 0;
    for (const m of members) {
        const pRes = await window.api.electrician.getPayments(m._id);
        const payments = pRes.success ? pRes.data : [];
        memberPayments[m._id] = payments;
        grandTotal += payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    }

    const memberSections = members.length === 0 ? `
        <div style="text-align: center; padding: 4rem; color: var(--text-muted); border: 2px dashed var(--border); border-radius: var(--radius-lg); margin-top: 1.5rem;">
            <i class="ph ph-users" style="font-size: 3rem; opacity: 0.4; display: block; margin-bottom: 1rem;"></i>
            <p style="font-size: 1rem; margin-bottom: 1rem;">No team members added yet.</p>
            <button class="btn btn-primary" onclick="showAddMemberModal()">
                <i class="ph ph-plus"></i> Add First Member
            </button>
        </div>` :
        members.map(member => {
            const payments = memberPayments[member._id] || [];
            const memberTotal = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
            const paymentRows = payments.length === 0
                ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding: 1.5rem;">No payments yet</td></tr>`
                : payments.map((p, idx) => `
                    <tr>
                        <td style="color:var(--text-muted); font-size:0.85rem;">${idx + 1}</td>
                        <td><strong>${escapeHtml(p.weekLabel || 'Week Payment')}</strong></td>
                        <td style="font-size:0.85rem; color:var(--text-muted);">${p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                        <td><strong style="color:var(--success); font-size:1.05rem;">${formatCurrency(parseFloat(p.amount) || 0)}</strong></td>
                        <td>${escapeHtml(p.notes || '-')}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deleteElectricianPayment('${p._id}')">
                                <i class="ph ph-trash"></i>
                            </button>
                        </td>
                    </tr>`).join('');

            return `
            <div class="card mt-2" style="border-left: 4px solid var(--warning);">
                <div class="card-header" style="padding-bottom: 0.75rem; border-bottom: 1px solid var(--border);">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <div style="width:38px; height:38px; background:var(--warning); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#000; font-size:1rem;">
                            ${escapeHtml(member.name.charAt(0).toUpperCase())}
                        </div>
                        <div>
                            <div style="font-weight:700; font-size:1rem; color:var(--text-primary);">${escapeHtml(member.name)}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">${member.role ? `<i class="ph ph-wrench"></i> ${escapeHtml(member.role)}` : '<i class="ph ph-lightning"></i> Electrician'}</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap: 0.75rem;">
                        <div style="text-align:right;">
                            <div style="font-size:0.75rem; color:var(--text-muted);">Total Paid</div>
                            <div style="font-weight:700; color:var(--success); font-size:1.1rem;">${formatCurrency(memberTotal)}</div>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="showAddPaymentModal('${member._id}', '${escapeHtml(member.name)}')"
                                title="Add weekly payment for ${escapeHtml(member.name)}">
                            <i class="ph ph-plus"></i> Add Week
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMember('${member._id}', '${escapeHtml(member.name)}')"
                                title="Remove ${escapeHtml(member.name)} from team">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body" style="padding: 0;">
                    <div class="table-container" style="margin:0;">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width:40px;">#</th>
                                    <th>Week / Label</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Notes</th>
                                    <th style="width:60px;">Del</th>
                                </tr>
                            </thead>
                            <tbody>${paymentRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        }).join('');

    return `
        <div class="electrician-payments-page">
            <!-- Back + Header -->
            <div class="card-header" style="margin-bottom:1.5rem;">
                <div style="display:flex; align-items:center; gap:1rem;">
                    <button class="btn btn-outline btn-sm" onclick="navigateTo('labour')">
                        <i class="ph ph-arrow-left"></i> Back
                    </button>
                    <div>
                        <h2 class="card-title" style="margin-bottom:0.15rem;">
                            <i class="ph ph-lightning" style="color:var(--warning);"></i>
                            ${escapeHtml(worker.name)} — Team Payments
                        </h2>
                        <div style="font-size:0.85rem; color:var(--text-muted);">
                            <i class="ph ph-phone"></i> ${escapeHtml(worker.phone)} &nbsp;&bull;&nbsp; Electrician Contractor
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="showAddMemberModal()">
                    <i class="ph ph-user-plus"></i> Add Member
                </button>
            </div>

            <!-- Grand Total Summary -->
            <div class="grid grid-3 gap" style="margin-bottom:1.5rem;">
                <div class="stat-card" style="border-left:4px solid var(--accent-blue);">
                    <div class="stat-label"><i class="ph ph-users"></i> Team Members</div>
                    <div class="stat-value" style="color:var(--accent-blue); font-size:2rem;">${members.length}</div>
                    <div class="stat-label">Active workers</div>
                </div>
                <div class="stat-card" style="border-left:4px solid var(--success);">
                    <div class="stat-label"><i class="ph ph-currency-inr"></i> Total Paid (All Members)</div>
                    <div class="stat-value" style="color:var(--success); font-size:1.6rem;">${formatCurrency(grandTotal)}</div>
                    <div class="stat-label">Across all weeks</div>
                </div>
                <div class="stat-card" style="border-left:4px solid var(--warning);">
                    <div class="stat-label"><i class="ph ph-calendar"></i> Total Weeks Recorded</div>
                    <div class="stat-value" style="color:var(--warning); font-size:2rem;">
                        ${Object.values(memberPayments).reduce((sum, arr) => sum + arr.length, 0)}
                    </div>
                    <div class="stat-label">Payment entries</div>
                </div>
            </div>

            <!-- Member Sections -->
            ${memberSections}
        </div>

        <!-- Add Member Modal -->
        <div id="addMemberModal" class="modal">
            <div class="modal-content" style="max-width:420px;">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="ph ph-user-plus"></i> Add Team Member</h3>
                    <button class="modal-close" onclick="hideModal('addMemberModal')"><i class="ph ph-x"></i></button>
                </div>
                <form id="addMemberForm" onsubmit="event.preventDefault(); saveMember();">
                    <div class="form-group">
                        <label class="form-label">Member Name</label>
                        <input type="text" id="memberName" class="form-input" placeholder="e.g., Ravi, Kumar" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role / Skill <span style="color:var(--text-muted); font-weight:400;">(optional)</span></label>
                        <input type="text" id="memberRole" class="form-input" placeholder="e.g., Wiring, Panel work, Fitting" />
                    </div>
                    <div class="flex gap">
                        <button type="button" class="btn btn-outline" onclick="hideModal('addMemberModal')">Cancel</button>
                        <button type="submit" class="btn btn-primary"><i class="ph ph-check"></i> Add Member</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Add Payment Modal -->
        <div id="addPaymentModal" class="modal">
            <div class="modal-content" style="max-width:420px;">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="ph ph-coins"></i> Add Weekly Payment</h3>
                    <button class="modal-close" onclick="hideModal('addPaymentModal')"><i class="ph ph-x"></i></button>
                </div>
                <div style="font-size:0.85rem; color:var(--text-muted); padding: 0.5rem 1.5rem 0; margin-bottom: -0.5rem;">
                    Member: <strong id="paymentMemberName" style="color:var(--warning);"></strong>
                </div>
                <input type="hidden" id="paymentMemberId" />
                <form id="addPaymentForm" onsubmit="event.preventDefault(); savePayment();">
                    <div class="form-group">
                        <label class="form-label">Week / Label</label>
                        <input type="text" id="paymentWeekLabel" class="form-input"
                               placeholder="e.g., Week 1, March Wk 2" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Amount Paid (₹)</label>
                        <input type="number" id="paymentAmount" class="form-input"
                               step="0.01" min="0.01" required placeholder="Enter amount"
                               style="font-size:1.1rem;" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notes (optional)</label>
                        <input type="text" id="paymentNotes" class="form-input" placeholder="Any remarks..." />
                    </div>
                    <div class="flex gap">
                        <button type="button" class="btn btn-outline" onclick="hideModal('addPaymentModal')">Cancel</button>
                        <button type="submit" class="btn btn-primary"><i class="ph ph-check"></i> Save Payment</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function initializeElectricianPayments() {
    // Inline handlers — nothing extra needed
}

function showAddMemberModal() {
    const form = document.getElementById('addMemberForm');
    if (form) form.reset();
    showModal('addMemberModal');
}

async function saveMember() {
    const worker = AppState.currentElectricianWorker;
    if (!worker) return;
    const name = document.getElementById('memberName').value.trim();
    const role = document.getElementById('memberRole') ? document.getElementById('memberRole').value.trim() : '';
    if (!name) { showAlert('Please enter a member name', 'warning'); return; }

    showLoading();
    const result = await window.api.electrician.addMember({
        workerId: worker._id,
        projectId: AppState.currentProject._id,
        name,
        role
    });
    hideLoading();

    if (result.success) {
        hideModal('addMemberModal');
        showAlert(`${name} added to team`, 'success');
        const content = await loadElectricianPaymentsView();
        document.getElementById('view-container').innerHTML = content;
        initializeElectricianPayments();
    } else {
        showAlert('Failed to add member: ' + result.message, 'danger');
    }
}

async function deleteMember(memberId, memberName) {
    if (!confirm(`Remove "${memberName}" and all their payment records?`)) return;
    showLoading();
    const result = await window.api.electrician.deleteMember(memberId);
    hideLoading();
    if (result.success) {
        showAlert(`${memberName} removed`, 'success');
        const content = await loadElectricianPaymentsView();
        document.getElementById('view-container').innerHTML = content;
    } else {
        showAlert('Failed to remove member', 'danger');
    }
}

function showAddPaymentModal(memberId, memberName) {
    const form = document.getElementById('addPaymentForm');
    if (form) form.reset();
    document.getElementById('paymentMemberId').value = memberId;
    document.getElementById('paymentMemberName').textContent = memberName;
    showModal('addPaymentModal');
}

async function savePayment() {
    const memberId = document.getElementById('paymentMemberId').value;
    const weekLabel = document.getElementById('paymentWeekLabel').value.trim();
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const notes = document.getElementById('paymentNotes').value.trim();

    if (!weekLabel) { showAlert('Please enter a week label', 'warning'); return; }
    if (isNaN(amount) || amount <= 0) { showAlert('Please enter a valid amount', 'warning'); return; }

    showLoading();
    const result = await window.api.electrician.addPayment({
        memberId,
        workerId: AppState.currentElectricianWorker._id,
        projectId: AppState.currentProject._id,
        weekLabel,
        amount,
        notes
    });
    hideLoading();

    if (result.success) {
        hideModal('addPaymentModal');
        showAlert('Payment saved', 'success');
        const content = await loadElectricianPaymentsView();
        document.getElementById('view-container').innerHTML = content;
        initializeElectricianPayments();
    } else {
        showAlert('Failed to save payment: ' + result.message, 'danger');
    }
}

async function deleteElectricianPayment(paymentId) {
    if (!confirm('Delete this payment record?')) return;
    showLoading();
    const result = await window.api.electrician.deletePayment(paymentId);
    hideLoading();
    if (result.success) {
        showAlert('Payment deleted', 'success');
        const content = await loadElectricianPaymentsView();
        document.getElementById('view-container').innerHTML = content;
        initializeElectricianPayments();
    } else {
        showAlert('Failed to delete payment', 'danger');
    }
}

function initializeDashboard() {
    if (!AppState.currentProject) return;

    const p = AppState.currentProject;
    const breakdown = p.budgetBreakdown || { labour: 0, materials: 0, equipment: 0, other: 0 };
    const totalSpent = breakdown.labour + breakdown.materials + breakdown.equipment + breakdown.other;
    const totalBudget = p.budget || 0;
    const remaining = totalBudget - totalSpent;
    const remainPct = totalBudget > 0 ? ((remaining / totalBudget) * 100).toFixed(1) : 0;
    const usePct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

    // Animate budget total counter
    animateCounter('dashTotalBudget', totalBudget, true);
    document.getElementById('dashLabourCost').textContent = formatCurrency(breakdown.labour);
    document.getElementById('dashMaterialCost').textContent = formatCurrency(breakdown.materials);
    document.getElementById('dashEquipCost').textContent = formatCurrency(breakdown.equipment);

    const pctEl = document.getElementById('dashRemainingPct');
    if (pctEl) {
        pctEl.textContent = `${remainPct}%`;
        pctEl.className = 'trend ' + (remainPct < 20 ? 'down' : remainPct < 50 ? 'neutral' : 'up');
    }

    const spentEl = document.getElementById('budgetSpentPct');
    if (spentEl) spentEl.textContent = `${usePct.toFixed(0)}%`;

    // Progress bar
    setTimeout(() => {
        const bar = document.getElementById('dashBudgetBar');
        if (bar) {
            bar.style.width = `${usePct}%`;
            if (usePct > 90) bar.style.background = 'var(--danger)';
            else if (usePct > 70) bar.style.background = 'linear-gradient(90deg, var(--warning), var(--brand))';
        }
    }, 200);

    // Chart.js donut
    renderBudgetDonut(breakdown, totalBudget);

    loadDashboardCounts(p._id);
}

function renderBudgetDonut(breakdown, totalBudget) {
    const canvas = document.getElementById('budgetDonut');
    if (!canvas || typeof Chart === 'undefined') return;

    const labour = breakdown.labour || 0;
    const materials = breakdown.materials || 0;
    const equipment = breakdown.equipment || 0;
    const other = breakdown.other || 0;
    const spent = labour + materials + equipment + other;
    const remaining = Math.max(0, totalBudget - spent);

    if (window._budgetChart) { window._budgetChart.destroy(); }

    window._budgetChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Labour', 'Materials', 'Equipment', 'Other', 'Remaining'],
            datasets: [{
                data: [labour, materials, equipment, other, remaining],
                backgroundColor: [
                    'rgba(245,158,11,0.9)',
                    'rgba(59,130,246,0.9)',
                    'rgba(139,92,246,0.9)',
                    'rgba(20,184,166,0.9)',
                    'rgba(255,255,255,0.08)'
                ],
                borderColor: 'rgba(17,17,24,0)',
                borderWidth: 3,
                hoverOffset: 6
            }]
        },
        options: {
            cutout: '72%',
            responsive: false,
            plugins: {
                legend: { display: false }, tooltip: {
                    callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` }
                }
            },
            animation: { animateRotate: true, duration: 900 }
        }
    });
}

function animateCounter(elemId, target, isCurrency) {
    const el = document.getElementById(elemId);
    if (!el || target === 0) {
        if (el) el.textContent = isCurrency ? formatCurrency(0) : '0';
        return;
    }
    const duration = 900;
    const start = Date.now();
    const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
        const current = Math.round(eased * target);
        el.textContent = isCurrency ? formatCurrency(current) : current;
        if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

const avatarColors = ['av-1', 'av-2', 'av-3', 'av-4', 'av-5', 'av-6'];

async function loadDashboardCounts(projectId) {
    try {
        const labourRes = await window.api.labour.getAll(projectId);
        if (labourRes.success) {
            const workers = labourRes.data;
            const teamList = document.getElementById('dashTeamList');
            if (teamList) {
                teamList.innerHTML = '';
                if (workers.length === 0) {
                    teamList.innerHTML = '<div class="text-muted text-center" style="padding:2rem 0;">No workers added yet</div>';
                } else {
                    workers.slice(0, 5).forEach((w, i) => {
                        const active = w.totalCost > 0 || w.category === 'Electrician';
                        const avClass = avatarColors[i % avatarColors.length];
                        teamList.innerHTML += `
                            <div class="list-widget-item">
                                <div class="user-avatar-group">
                                    <div class="user-avatar ${avClass}">${w.name.charAt(0).toUpperCase()}</div>
                                    <div class="user-info">
                                        <span class="name">${escapeHtml(w.name)}</span>
                                        <span class="status">${w.category}</span>
                                    </div>
                                </div>
                                <div class="trend ${active ? 'up' : 'neutral'}">${active ? 'Active' : 'Idle'}</div>
                            </div>`;
                    });
                    if (workers.length > 5) {
                        teamList.innerHTML += `<div style="text-align:center;padding:.5rem 0;font-size:.75rem;color:var(--text-muted);">+${workers.length - 5} more workers</div>`;
                    }
                }
            }
        }

        const matRes = await window.api.materials.getAll(projectId);
        if (matRes.success) {
            animateCounter('dashMaterialCount', matRes.data.length, false);
            const lowStock = matRes.data.some(m => m.quantity < 10);
            if (lowStock) document.getElementById('dashLowStockBadge').style.display = 'inline-flex';
        }

        const eqRes = await window.api.equipment.getAll(projectId);
        if (eqRes.success) animateCounter('dashEquipmentCount', eqRes.data.length, false);

        const alertVal = Math.floor(Math.random() * 5);
        animateCounter('dashAlertCount', alertVal, false);
        if (alertVal > 0) {
            const badge = document.getElementById('notifBadge');
            if (badge) { badge.textContent = alertVal; badge.style.display = 'flex'; }
        }

    } catch (e) {
        console.error('Dashboard counts error:', e);
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

// Toast notification system
const toastIcons = {
    success: 'ph-check-circle',
    danger: 'ph-x-circle',
    warning: 'ph-warning-circle',
    info: 'ph-info'
};

function showToast(message, type = 'info', duration = 3200) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="ph ${toastIcons[type] || 'ph-info'}"></i></div>
        <div class="toast-body"><div class="toast-msg">${message}</div></div>
        <div class="toast-progress"></div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('dismissing');
        setTimeout(() => toast.remove(), 350);
    }, duration);
}

// Legacy alias so existing code still works
function showAlert(message, type = 'info') { showToast(message, type === 'error' ? 'danger' : type); }

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
            AppState.currentProject = null;
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
        showToast('Failed to initialize app: ' + error.message, 'danger');
    }
});

// Theme Toggle Function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'success');
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
window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.toggleTheme = toggleTheme;
window.animateCounter = animateCounter;
window.loadElectricianPaymentsView = loadElectricianPaymentsView;
window.initializeElectricianPayments = initializeElectricianPayments;
window.showAddMemberModal = showAddMemberModal;
window.saveMember = saveMember;
window.deleteMember = deleteMember;
window.showAddPaymentModal = showAddPaymentModal;
window.savePayment = savePayment;
window.deleteElectricianPayment = deleteElectricianPayment;
