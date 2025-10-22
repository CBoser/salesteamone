// ==================== REPORT GENERATION ====================
const Reports = {
    generateReport(type) {
        const modal = document.getElementById('reportModal');
        const title = document.getElementById('reportModalTitle');
        const content = document.getElementById('reportContent');

        switch (type) {
            case 'margin':
                title.textContent = 'Margin Analysis Report';
                content.innerHTML = this.generateMarginReport();
                break;
            case 'pricing':
                title.textContent = 'Pricing Summary Report';
                content.innerHTML = this.generatePricingReport();
                break;
            case 'comparison':
                title.textContent = 'Plan Comparison Report';
                content.innerHTML = this.generateComparisonReport();
                break;
            case 'options':
                title.textContent = 'Options Pricing Report';
                content.innerHTML = this.generateOptionsReport();
                break;
        }

        modal.classList.add('active');
    },

    closeReport() {
        document.getElementById('reportModal').classList.remove('active');
    },

    // ==================== MARGIN ANALYSIS ====================
    generateMarginReport() {
        const pricing = Storage.getPricing();

        if (pricing.length === 0) {
            return '<p style="padding: 20px; color: #7f8c8d;">No pricing data available to analyze.</p>';
        }

        // Group by category and calculate margins
        const categories = {};
        let totalCost = 0;
        let totalPrice = 0;

        pricing.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = {
                    items: 0,
                    cost: 0,
                    price: 0,
                    margin: 0
                };
            }

            const cost = parseFloat(item.unitCost);
            const price = cost / (1 - (item.margin / 100));

            categories[category].items++;
            categories[category].cost += cost;
            categories[category].price += price;

            totalCost += cost;
            totalPrice += price;
        });

        // Calculate category margins
        Object.keys(categories).forEach(cat => {
            const data = categories[cat];
            data.margin = ((data.price - data.cost) / data.price) * 100;
        });

        const overallMargin = ((totalPrice - totalCost) / totalPrice) * 100;

        let html = `
            <div class="alert alert-info">
                <span>ℹ️</span>
                <span>Analysis based on ${pricing.length} pricing items across ${Object.keys(categories).length} categories</span>
            </div>

            <div style="margin: 20px 0; padding: 20px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #2d5a3d;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">Overall Performance</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div>
                        <div style="font-size: 14px; color: #7f8c8d;">Total Cost</div>
                        <div style="font-size: 24px; font-weight: 700; color: #2c3e50;">$${totalCost.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="font-size: 14px; color: #7f8c8d;">Total Price</div>
                        <div style="font-size: 24px; font-weight: 700; color: #2c3e50;">$${totalPrice.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="font-size: 14px; color: #7f8c8d;">Overall Margin</div>
                        <div style="font-size: 24px; font-weight: 700; color: #2d5a3d;">${overallMargin.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <h4 style="margin: 20px 0 10px; color: #2c3e50;">Margin by Category</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Items</th>
                        <th>Total Cost</th>
                        <th>Total Price</th>
                        <th>Margin %</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.keys(categories).sort().forEach(cat => {
            const data = categories[cat];
            const profit = data.price - data.cost;
            const marginClass = data.margin >= 20 ? 'color: #2ecc71' :
                data.margin >= 15 ? 'color: #f39c12' : 'color: #e74c3c';

            html += `
                <tr>
                    <td><strong>${cat}</strong></td>
                    <td>${data.items}</td>
                    <td>$${data.cost.toFixed(2)}</td>
                    <td>$${data.price.toFixed(2)}</td>
                    <td style="${marginClass}; font-weight: 600;">${data.margin.toFixed(1)}%</td>
                    <td>$${profit.toFixed(2)}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>

            <div style="margin-top: 30px; display: flex; gap: 10px;">
                <button class="btn btn-export" onclick="Reports.exportMarginReport()">
                    📥 Export to CSV
                </button>
                <button class="btn btn-secondary" onclick="Reports.closeReport()">Close</button>
            </div>
        `;

        return html;
    },

    // ==================== PRICING SUMMARY ====================
    generatePricingReport() {
        const pricing = Storage.getPricing();

        if (pricing.length === 0) {
            return '<p style="padding: 20px; color: #7f8c8d;">No pricing data available.</p>';
        }

        let html = `
            <div class="alert alert-info">
                <span>ℹ️</span>
                <span>Current pricing for ${pricing.length} items as of ${new Date().toLocaleDateString()}</span>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>Item Number</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>UM</th>
                        <th>Unit Cost</th>
                        <th>Margin %</th>
                        <th>Unit Price</th>
                        <th>Markup</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pricing.forEach(item => {
            const unitPrice = item.unitCost / (1 - (item.margin / 100));
            const markup = unitPrice - item.unitCost;

            html += `
                <tr>
                    <td>${item.itemNumber}</td>
                    <td>${item.description}</td>
                    <td>${item.category}</td>
                    <td>${item.um}</td>
                    <td>$${parseFloat(item.unitCost).toFixed(2)}</td>
                    <td>${item.margin}%</td>
                    <td><strong>$${unitPrice.toFixed(2)}</strong></td>
                    <td>$${markup.toFixed(2)}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>

            <div style="margin-top: 30px; display: flex; gap: 10px;">
                <button class="btn btn-export" onclick="Storage.exportToCSV(Storage.getPricing(), 'pricing_summary_${Date.now()}.csv')">
                    📥 Export to CSV
                </button>
                <button class="btn btn-secondary" onclick="Reports.closeReport()">Close</button>
            </div>
        `;

        return html;
    },

    // ==================== PLAN COMPARISON ====================
    generateComparisonReport() {
        const plans = Storage.getPlans();

        if (plans.length === 0) {
            return '<p style="padding: 20px; color: #7f8c8d;">No plans available to compare.</p>';
        }

        let html = `
            <div class="alert alert-info">
                <span>ℹ️</span>
                <span>Comparing ${plans.length} plans</span>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>Plan Code</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Sq Ft</th>
                        <th>Beds</th>
                        <th>Baths</th>
                        <th>Garage</th>
                        <th>Style</th>
                        <th>Elevations</th>
                    </tr>
                </thead>
                <tbody>
        `;

        plans.forEach(plan => {
            html += `
                <tr>
                    <td><strong>${plan.code}</strong></td>
                    <td>${plan.name || 'N/A'}</td>
                    <td>${plan.type}</td>
                    <td>${plan.sqft ? plan.sqft.toLocaleString() : 'N/A'}</td>
                    <td>${plan.bedrooms || 'N/A'}</td>
                    <td>${plan.bathrooms || 'N/A'}</td>
                    <td>${plan.garage || 'N/A'}</td>
                    <td>${plan.style || 'N/A'}</td>
                    <td>${plan.elevations.join(', ')}</td>
                </tr>
            `;
        });

        // Calculate averages
        const avgSqft = plans.reduce((sum, p) => sum + (p.sqft || 0), 0) / plans.length;
        const avgBeds = plans.reduce((sum, p) => sum + (p.bedrooms || 0), 0) / plans.length;
        const avgBaths = plans.reduce((sum, p) => sum + (p.bathrooms || 0), 0) / plans.length;

        html += `
                </tbody>
            </table>

            <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="color: #2c3e50; margin-bottom: 15px;">Portfolio Statistics</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div>
                        <div style="font-size: 14px; color: #7f8c8d;">Avg Square Footage</div>
                        <div style="font-size: 20px; font-weight: 600; color: #2c3e50;">${avgSqft.toFixed(0)} sqft</div>
                    </div>
                    <div>
                        <div style="font-size: 14px; color: #7f8c8d;">Avg Bedrooms</div>
                        <div style="font-size: 20px; font-weight: 600; color: #2c3e50;">${avgBeds.toFixed(1)}</div>
                    </div>
                    <div>
                        <div style="font-size: 14px; color: #7f8c8d;">Avg Bathrooms</div>
                        <div style="font-size: 20px; font-weight: 600; color: #2c3e50;">${avgBaths.toFixed(1)}</div>
                    </div>
                </div>
            </div>

            <div style="margin-top: 30px; display: flex; gap: 10px;">
                <button class="btn btn-export" onclick="Storage.exportToCSV(Storage.getPlans(), 'plan_comparison_${Date.now()}.csv')">
                    📥 Export to CSV
                </button>
                <button class="btn btn-secondary" onclick="Reports.closeReport()">Close</button>
            </div>
        `;

        return html;
    },

    // ==================== OPTIONS PRICING ====================
    generateOptionsReport() {
        const options = Storage.getOptions();

        if (options.length === 0) {
            return '<p style="padding: 20px; color: #7f8c8d;">No options available to report.</p>';
        }

        // Group by category
        const categories = {};
        options.forEach(opt => {
            const cat = opt.category || 'Uncategorized';
            if (!categories[cat]) {
                categories[cat] = [];
            }
            categories[cat].push(opt);
        });

        let html = `
            <div class="alert alert-info">
                <span>ℹ️</span>
                <span>Options pricing report for ${options.length} options across ${Object.keys(categories).length} categories</span>
            </div>
        `;

        Object.keys(categories).sort().forEach(cat => {
            const opts = categories[cat];
            const totalValue = opts.reduce((sum, opt) => sum + (opt.basePrice || 0), 0);
            const avgPrice = totalValue / opts.length;

            html += `
                <div style="margin: 20px 0;">
                    <h4 style="color: #2c3e50; margin-bottom: 10px;">
                        ${cat} (${opts.length} options, Avg: $${avgPrice.toFixed(2)})
                    </h4>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Base Price</th>
                                <th>Triggers Packs</th>
                                <th>Applies To Plans</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            opts.forEach(opt => {
                html += `
                    <tr>
                        <td><strong>${opt.code}</strong></td>
                        <td>${opt.description}</td>
                        <td>$${parseFloat(opt.basePrice || 0).toFixed(2)}</td>
                        <td>${opt.triggersPacks?.length ? opt.triggersPacks.join(', ') : 'None'}</td>
                        <td>${opt.appliesTo?.length ? opt.appliesTo.join(', ') : 'All Plans'}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });

        html += `
            <div style="margin-top: 30px; display: flex; gap: 10px;">
                <button class="btn btn-export" onclick="Storage.exportToCSV(Storage.getOptions(), 'options_pricing_${Date.now()}.csv')">
                    📥 Export to CSV
                </button>
                <button class="btn btn-secondary" onclick="Reports.closeReport()">Close</button>
            </div>
        `;

        return html;
    },

    // Export margin report
    exportMarginReport() {
        const pricing = Storage.getPricing();
        const reportData = pricing.map(item => {
            const unitPrice = item.unitCost / (1 - (item.margin / 100));
            const profit = unitPrice - item.unitCost;

            return {
                ItemNumber: item.itemNumber,
                Description: item.description,
                Category: item.category,
                UM: item.um,
                UnitCost: item.unitCost,
                Margin: item.margin,
                UnitPrice: unitPrice.toFixed(2),
                Profit: profit.toFixed(2)
            };
        });

        Storage.exportToCSV(reportData, `margin_analysis_${Date.now()}.csv`);
    }
};
