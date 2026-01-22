// Finance Module

async function loadFinanceView() {
    if (!AppState.currentProject) {
        return `
            <div class="alert alert-warning">
                <h3>No Project Selected</h3>
                <p>Please select a project from the Projects page to view finances.</p>
                <button class="btn btn-primary" onclick="navigateTo('projects')">Go to Projects</button>
            </div>
        `;
    }

    showLoading();
    const summaryResult = await window.api.finance.getSummary(AppState.currentProject._id);
    hideLoading();

    const summary = summaryResult.success ? summaryResult.data : {
        labourCost: 0,
        materialCost: 0,
        equipmentCost: 0,
        otherExpenses: 0,
        totalCost: 0
    };

    const budget = AppState.currentProject.budget || 0;
    const remaining = budget - summary.totalCost;
    const budgetPercentage = budget > 0 ? ((summary.totalCost / budget) * 100).toFixed(1) : 0;

    return `
        <div class="finance-container">
            <div class="card-header">
                <h2 class="card-title">💰 Finance Dashboard</h2>
                <button class="btn btn-primary" onclick="showCostCalculator()">
                    📊 Cost Calculator
                </button>
            </div>
            
            <!-- Budget Overview -->
            <div class="card mt-2" style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white;">
                <div class="card-body">
                    <h3 style="margin-bottom: 1rem;">Budget Overview</h3>
                    <div class="grid grid-3 gap">
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">Total Budget</div>
                            <div style="font-size: 2rem; font-weight: 700;">${formatCurrency(budget)}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">Total Spent</div>
                            <div style="font-size: 2rem; font-weight: 700;">${formatCurrency(summary.totalCost)}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">Remaining</div>
                            <div style="font-size: 2rem; font-weight: 700; color: ${remaining >= 0 ? '#10b981' : '#ef4444'};">
                                ${formatCurrency(remaining)}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Budget Utilized</span>
                            <span>${budgetPercentage}%</span>
                        </div>
                        <div style="height: 20px; background: rgba(255, 255, 255, 0.2); border-radius: 10px; overflow: hidden;">
                            <div style="height: 100%; background: ${budgetPercentage > 100 ? '#ef4444' : '#10b981'}; 
                                        width: ${Math.min(budgetPercentage, 100)}%; transition: width 0.5s;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Cost Breakdown -->
            <div class="grid grid-4 mt-2">
                <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                    <div class="stat-label">Labour Cost</div>
                    <div class="stat-value">${formatCurrency(summary.labourCost)}</div>
                    <div class="stat-label">${((summary.labourCost / summary.totalCost * 100) || 0).toFixed(1)}% of total</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);">
                    <div class="stat-label">Material Cost</div>
                    <div class="stat-value">${formatCurrency(summary.materialCost)}</div>
                    <div class="stat-label">${((summary.materialCost / summary.totalCost * 100) || 0).toFixed(1)}% of total</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                    <div class="stat-label">Equipment Cost</div>
                    <div class="stat-value">${formatCurrency(summary.equipmentCost)}</div>
                    <div class="stat-label">${((summary.equipmentCost / summary.totalCost * 100) || 0).toFixed(1)}% of total</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                    <div class="stat-label">Other Expenses</div>
                    <div class="stat-value">${formatCurrency(summary.otherExpenses)}</div>
                    <div class="stat-label">${((summary.otherExpenses / summary.totalCost * 100) || 0).toFixed(1)}% of total</div>
                </div>
            </div>
            
            <!-- Detailed Breakdown -->
            <div class="card mt-2">
                <div class="card-header">
                    <h3 class="card-title">Cost Breakdown by Category</h3>
                </div>
                <div class="card-body">
                    ${renderCostBreakdownChart(summary)}
                </div>
            </div>
            
            <!-- Financial Summary Table -->
            <div class="card mt-2">
                <div class="card-header">
                    <h3 class="card-title">Financial Summary</h3>
                </div>
                <div class="card-body">
                    ${renderFinancialSummaryTable(summary, budget)}
                </div>
            </div>
        </div>
    `;
}

function renderCostBreakdownChart(summary) {
    const categories = [
        { name: 'Labour', amount: summary.labourCost, color: '#8b5cf6' },
        { name: 'Materials', amount: summary.materialCost, color: '#ec4899' },
        { name: 'Equipment', amount: summary.equipmentCost, color: '#f59e0b' },
        { name: 'Other', amount: summary.otherExpenses, color: '#06b6d4' }
    ];

    const maxAmount = Math.max(...categories.map(c => c.amount));

    return `
        <div style="display: grid; gap: 1rem;">
            ${categories.map(cat => {
        const percentage = maxAmount > 0 ? (cat.amount / maxAmount * 100) : 0;
        return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-weight: 500;">${cat.name}</span>
                            <span style="color: ${cat.color}; font-weight: 600;">${formatCurrency(cat.amount)}</span>
                        </div>
                        <div style="height: 30px; background: var(--bg-tertiary); border-radius: 5px; overflow: hidden;">
                            <div style="height: 100%; background: ${cat.color}; width: ${percentage}%; 
                                        transition: width 0.5s; display: flex; align-items: center; 
                                        padding-left: 0.5rem; color: white; font-size: 0.85rem;">
                                ${percentage > 10 ? `${percentage.toFixed(1)}%` : ''}
                            </div>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function renderFinancialSummaryTable(summary, budget) {
    return `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Percentage of Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Labour Cost</strong></td>
                        <td>${formatCurrency(summary.labourCost)}</td>
                        <td>${((summary.labourCost / summary.totalCost * 100) || 0).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td><strong>Material Cost</strong></td>
                        <td>${formatCurrency(summary.materialCost)}</td>
                        <td>${((summary.materialCost / summary.totalCost * 100) || 0).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td><strong>Equipment Cost</strong></td>
                        <td>${formatCurrency(summary.equipmentCost)}</td>
                        <td>${((summary.equipmentCost / summary.totalCost * 100) || 0).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td><strong>Other Expenses</strong></td>
                        <td>${formatCurrency(summary.otherExpenses)}</td>
                        <td>${((summary.otherExpenses / summary.totalCost * 100) || 0).toFixed(2)}%</td>
                    </tr>
                    <tr style="background: var(--bg-tertiary); font-weight: 600;">
                        <td><strong>Total Cost</strong></td>
                        <td><strong>${formatCurrency(summary.totalCost)}</strong></td>
                        <td><strong>100%</strong></td>
                    </tr>
                    <tr style="background: var(--bg-tertiary);">
                        <td><strong>Project Budget</strong></td>
                        <td><strong>${formatCurrency(budget)}</strong></td>
                        <td>-</td>
                    </tr>
                    <tr style="background: var(--bg-tertiary); font-weight: 600; color: ${budget - summary.totalCost >= 0 ? 'var(--success)' : 'var(--danger)'};">
                        <td><strong>Remaining Budget</strong></td>
                        <td><strong>${formatCurrency(budget - summary.totalCost)}</strong></td>
                        <td><strong>${((summary.totalCost / budget * 100) || 0).toFixed(2)}% utilized</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function initializeFinance() {
    // Event handlers are inline
}

// Expose functions globally
window.loadFinanceView = loadFinanceView;
window.initializeFinance = initializeFinance;
