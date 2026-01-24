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
                <h2 class="card-title"><i class="ph ph-money"></i> Finance Dashboard</h2>
                <button class="btn btn-primary" onclick="showCostCalculator()">
                    <i class="ph ph-chart-bar"></i> Cost Calculator
                </button>
            </div>
            
            <!-- Budget Overview -->
            <div class="card mt-2 card-gradient-1">
                <div class="card-body">
                    <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Budget Overview</h3>
                    <div class="grid grid-3 gap">
                        <div>
                            <div class="stat-label">Total Budget</div>
                            <div class="stat-value" style="color: var(--primary);">${formatCurrency(budget)}</div>
                        </div>
                        <div>
                            <div class="stat-label">Total Spent</div>
                            <div class="stat-value" style="color: var(--text-primary);">${formatCurrency(summary.totalCost)}</div>
                        </div>
                        <div>
                            <div class="stat-label">Remaining</div>
                            <div class="stat-value" style="color: ${remaining >= 0 ? 'var(--success)' : 'var(--danger)'};">
                                ${formatCurrency(remaining)}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
                            <span>Budget Utilized</span>
                            <span>${budgetPercentage}%</span>
                        </div>
                        <div style="height: 10px; background: var(--bg-hover); border-radius: 5px; overflow: hidden;">
                            <div style="height: 100%; background: ${budgetPercentage > 100 ? 'var(--danger)' : 'var(--success)'}; 
                                        width: ${Math.min(budgetPercentage, 100)}%; transition: width 0.5s;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Cost Breakdown -->
            <div class="grid grid-4 mt-2">
                <div class="stat-card card-gradient-4">
                    <div class="stat-label">Labour Cost</div>
                    <div class="stat-value">${formatCurrency(summary.labourCost)}</div>
                    <div class="stat-label">${((summary.labourCost / summary.totalCost * 100) || 0).toFixed(1)}% of total</div>
                </div>
                <div class="stat-card card-gradient-5">
                    <div class="stat-label">Material Cost</div>
                    <div class="stat-value">${formatCurrency(summary.materialCost)}</div>
                    <div class="stat-label">${((summary.materialCost / summary.totalCost * 100) || 0).toFixed(1)}% of total</div>
                </div>
                <div class="stat-card card-gradient-3">
                    <div class="stat-label">Equipment Cost</div>
                    <div class="stat-value">${formatCurrency(summary.equipmentCost)}</div>
                    <div class="stat-label">${((summary.equipmentCost / summary.totalCost * 100) || 0).toFixed(1)}% of total</div>
                </div>
                <div class="stat-card card-gradient-6">
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
        { name: 'Labour', amount: summary.labourCost, color: 'var(--data-4)' },
        { name: 'Materials', amount: summary.materialCost, color: 'var(--data-5)' },
        { name: 'Equipment', amount: summary.equipmentCost, color: 'var(--data-3)' },
        { name: 'Other', amount: summary.otherExpenses, color: 'var(--data-6)' }
    ];

    // Calculate percentage based on Total Cost, not max amount
    const totalCost = summary.totalCost || 1; // Avoid division by zero

    return `
        <div style="display: grid; gap: 1rem;">
            ${categories.map(cat => {
        const percentageOfTotal = totalCost > 0 ? (cat.amount / totalCost * 100) : 0;
        return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            <span style="font-weight: 500; color: var(--text-secondary);">${cat.name}</span>
                            <div style="text-align: right;">
                                <span style="color: ${cat.color}; font-weight: 600; margin-right: 0.5rem;">${formatCurrency(cat.amount)}</span>
                                <span style="font-size: 0.8rem; color: var(--text-muted);">(${percentageOfTotal.toFixed(1)}%)</span>
                            </div>
                        </div>
                        <div style="height: 12px; background: var(--bg-hover); border-radius: 6px; overflow: hidden;">
                            <div style="height: 100%; background: ${cat.color}; width: ${percentageOfTotal}%; 
                                        transition: width 0.5s;"></div>
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
                    <tr style="background: var(--bg-hover); font-weight: 600;">
                        <td><strong>Total Cost</strong></td>
                        <td><strong>${formatCurrency(summary.totalCost)}</strong></td>
                        <td><strong>100%</strong></td>
                    </tr>
                    <tr style="background: var(--bg-hover);">
                        <td><strong>Project Budget</strong></td>
                        <td><strong>${formatCurrency(budget)}</strong></td>
                        <td>-</td>
                    </tr>
                    <tr style="background: var(--bg-hover); font-weight: 600;">
                        <td><strong>Remaining Budget</strong></td>
                        <td style="color: ${budget - summary.totalCost >= 0 ? 'var(--success)' : 'var(--danger)'};">
                            <strong>${formatCurrency(budget - summary.totalCost)}</strong>
                        </td>
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
