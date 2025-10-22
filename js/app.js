// ==================== MAIN APPLICATION ====================
const App = {
    currentBuilder: 'holt',
    editingPlanId: null,

    // Initialize the application
    init() {
        Storage.setBuilder(this.currentBuilder);
        Storage.initializeSampleData();
        this.renderAll();
        this.attachEventListeners();
        this.updatePricingTimestamp();
    },

    // Attach event listeners
    attachEventListeners() {
        // Builder selector
        document.getElementById('builderSelect').addEventListener('change', (e) => {
            this.switchBuilder(e.target.value);
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    },

    // Switch builder
    switchBuilder(builder) {
        this.currentBuilder = builder;
        Storage.setBuilder(builder);
        Storage.initializeSampleData();
        this.renderAll();
        this.updatePricingTimestamp();
    },

    // Update pricing timestamp
    updatePricingTimestamp() {
        const lastModified = Storage.getLastModified();
        const element = document.getElementById('pricingLastUpdated');
        if (element) {
            if (lastModified === 'Never') {
                element.textContent = lastModified;
            } else {
                const date = new Date(lastModified);
                element.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            }
        }
    },

    // Render all sections
    renderAll() {
        this.renderStats();
        this.renderPlans();
        this.renderCommunities();
        this.renderPacks();
        this.renderPricing();
        this.renderOptions();
        this.renderMaterials();
    },

    // ==================== TAB NAVIGATION ====================
    showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        const tabContent = document.getElementById(tabName + '-tab');
        if (tabContent) {
            tabContent.classList.add('active');
        }

        // Find and activate the corresponding nav tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            if (tab.textContent.toLowerCase().includes(tabName) ||
                tab.getAttribute('onclick')?.includes(tabName)) {
                tab.classList.add('active');
            }
        });
    },

    // ==================== RENDERING FUNCTIONS ====================
    renderStats() {
        const plans = Storage.getPlans();
        const communities = Storage.getCommunities();
        const options = Storage.getOptions();
        const materials = Storage.getMaterials();

        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${plans.length}</div>
                    <div class="stat-label">Active Plans</div>
                </div>
                <div class="stat-card" style="border-left-color: #3498db;">
                    <div class="stat-value">${communities.length}</div>
                    <div class="stat-label">Communities</div>
                </div>
                <div class="stat-card" style="border-left-color: #f39c12;">
                    <div class="stat-value">${options.length}</div>
                    <div class="stat-label">Options</div>
                </div>
                <div class="stat-card" style="border-left-color: #9b59b6;">
                    <div class="stat-value">${materials.length}</div>
                    <div class="stat-label">Materials</div>
                </div>
            `;
        }
    },

    renderPlans() {
        const plans = Storage.getPlans();
        const grid = document.getElementById('planGrid');

        if (!grid) return;

        if (plans.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No plans defined yet. Click "Add New Plan" to get started.</p></div>';
            return;
        }

        grid.innerHTML = plans.map(plan => {
            const typeColor = plan.type === 'Single Story' ? '#2d5a3d' :
                plan.type === 'Two Story' ? '#1a472a' : '#3498db';

            return `
                <div class="plan-card" onclick="App.editPlan('${plan.id}')">
                    <div class="plan-header">
                        <span class="plan-code">${this.escapeHtml(plan.code)}</span>
                        <span class="plan-type" style="background: ${typeColor}">
                            ${this.escapeHtml(plan.type)}
                        </span>
                    </div>
                    <div class="plan-details">
                        <div class="plan-detail"><strong>Name:</strong> ${this.escapeHtml(plan.name || 'N/A')}</div>
                        <div class="plan-detail"><strong>Sq Ft:</strong> ${plan.sqft ? plan.sqft.toLocaleString() : 'N/A'}</div>
                        <div class="plan-detail"><strong>Beds/Baths:</strong> ${plan.bedrooms || '?'}/${plan.bathrooms || '?'}</div>
                        <div class="plan-detail"><strong>Garage:</strong> ${this.escapeHtml(plan.garage || 'N/A')}</div>
                    </div>
                    <div class="plan-footer">
                        <span style="font-size: 12px; color: #7f8c8d;">Elevations: ${plan.elevations.join(', ')}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderCommunities() {
        const communities = Storage.getCommunities();
        const tbody = document.getElementById('communitiesTableBody');

        if (!tbody) return;

        if (communities.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">No communities defined yet.</td></tr>';
            return;
        }

        tbody.innerHTML = communities.map(comm => `
            <tr>
                <td><strong>${this.escapeHtml(comm.name)}</strong></td>
                <td>${this.escapeHtml(comm.builder)}</td>
                <td>${this.escapeHtml(comm.yard)}</td>
                <td>${comm.activePlans || 0}</td>
                <td>${this.escapeHtml(comm.requirements || 'Standard')}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="Modals.openCommunityModal('${comm.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="Modals.deleteCommunity('${comm.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    },

    renderPacks() {
        const packs = Storage.getPacks();
        const tbody = document.getElementById('packsTableBody');

        if (!tbody) return;

        if (packs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">No packs defined yet.</td></tr>';
            return;
        }

        tbody.innerHTML = packs.map(pack => `
            <tr>
                <td><strong>${this.escapeHtml(pack.name)}</strong></td>
                <td>${this.escapeHtml(pack.category)}</td>
                <td>Day ${pack.daySingle || 'N/A'} / Day ${pack.dayTwo || 'N/A'}</td>
                <td>${pack.leadTime} days</td>
                <td>${pack.materialCount || 0}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="Modals.openPackModal('${pack.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="Modals.deletePack('${pack.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    },

    renderPricing() {
        const pricing = Storage.getPricing();
        const tbody = document.getElementById('pricingTableBody');

        if (!tbody) return;

        if (pricing.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #7f8c8d;">No pricing data available. Import from Excel or add manually.</td></tr>';
            return;
        }

        tbody.innerHTML = pricing.map(item => {
            const unitPrice = (item.unitCost / (1 - (item.margin / 100))).toFixed(2);
            return `
                <tr>
                    <td>${this.escapeHtml(item.itemNumber)}</td>
                    <td>${this.escapeHtml(item.description)}</td>
                    <td>${this.escapeHtml(item.category)}</td>
                    <td>${this.escapeHtml(item.um)}</td>
                    <td>$${parseFloat(item.unitCost).toFixed(2)}</td>
                    <td>${item.margin}%</td>
                    <td>$${unitPrice}</td>
                    <td>
                        <button class="btn btn-small btn-primary" onclick="Modals.openPricingModal('${item.id}')">Edit</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderOptions() {
        const options = Storage.getOptions();
        const tbody = document.getElementById('optionsTableBody');

        if (!tbody) return;

        if (options.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #7f8c8d;">No options defined yet.</td></tr>';
            return;
        }

        tbody.innerHTML = options.map(opt => `
            <tr>
                <td><strong>${this.escapeHtml(opt.code)}</strong></td>
                <td>${this.escapeHtml(opt.description)}</td>
                <td>${this.escapeHtml(opt.category)}</td>
                <td>$${parseFloat(opt.basePrice || 0).toFixed(2)}</td>
                <td>${opt.triggersPacks?.join(', ') || 'None'}</td>
                <td>${opt.appliesTo?.join(', ') || 'All'}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="Modals.openOptionModal('${opt.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="Modals.deleteOption('${opt.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    },

    renderMaterials() {
        const materials = Storage.getMaterials();
        const tbody = document.getElementById('materialsTableBody');

        if (!tbody) return;

        if (materials.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #7f8c8d;">No materials in database. Import from Excel to populate.</td></tr>';
            return;
        }

        tbody.innerHTML = materials.slice(0, 50).map(mat => {
            const totalCost = (parseFloat(mat.vendorCost || 0) + parseFloat(mat.freight || 0)).toFixed(2);
            return `
                <tr>
                    <td>${this.escapeHtml(mat.sku)}</td>
                    <td>${this.escapeHtml(mat.description)}</td>
                    <td>${this.escapeHtml(mat.category)}</td>
                    <td>${this.escapeHtml(mat.subcategory || '')}</td>
                    <td>${this.escapeHtml(mat.um)}</td>
                    <td>$${parseFloat(mat.vendorCost || 0).toFixed(2)}</td>
                    <td>$${parseFloat(mat.freight || 0).toFixed(2)}</td>
                    <td><strong>$${totalCost}</strong></td>
                    <td>
                        <button class="btn btn-small btn-primary" onclick="Modals.openMaterialModal('${mat.id}')">Edit</button>
                    </td>
                </tr>
            `;
        }).join('');

        if (materials.length > 50) {
            tbody.innerHTML += `<tr><td colspan="9" style="text-align: center; color: #7f8c8d; padding: 15px;">Showing first 50 of ${materials.length} materials. Use search to filter.</td></tr>`;
        }
    },

    // ==================== PLAN MANAGEMENT ====================
    openPlanModal() {
        this.editingPlanId = null;
        document.getElementById('planModalTitle').textContent = 'Add New Plan';
        document.getElementById('planCode').value = '';
        document.getElementById('planName').value = '';
        document.getElementById('planType').value = 'Single Story';
        document.getElementById('planSqft').value = '';
        document.getElementById('planBedrooms').value = '';
        document.getElementById('planBathrooms').value = '';
        document.getElementById('planGarage').value = '';
        document.getElementById('planStyle').value = '';
        document.getElementById('planElevations').value = '';
        document.getElementById('planNotes').value = '';
        document.getElementById('planModal').classList.add('active');
    },

    editPlan(id) {
        const plans = Storage.getPlans();
        const plan = plans.find(p => p.id === id);
        if (!plan) return;

        this.editingPlanId = id;
        document.getElementById('planModalTitle').textContent = 'Edit Plan';
        document.getElementById('planCode').value = plan.code;
        document.getElementById('planName').value = plan.name || '';
        document.getElementById('planType').value = plan.type;
        document.getElementById('planSqft').value = plan.sqft || '';
        document.getElementById('planBedrooms').value = plan.bedrooms || '';
        document.getElementById('planBathrooms').value = plan.bathrooms || '';
        document.getElementById('planGarage').value = plan.garage || '';
        document.getElementById('planStyle').value = plan.style || '';
        document.getElementById('planElevations').value = plan.elevations.join(', ');
        document.getElementById('planNotes').value = plan.notes || '';
        document.getElementById('planModal').classList.add('active');
    },

    closePlanModal() {
        document.getElementById('planModal').classList.remove('active');
    },

    savePlan() {
        const code = document.getElementById('planCode').value.trim();
        const name = document.getElementById('planName').value.trim();
        const type = document.getElementById('planType').value;
        const sqft = document.getElementById('planSqft').value;
        const bedrooms = document.getElementById('planBedrooms').value;
        const bathrooms = document.getElementById('planBathrooms').value;
        const garage = document.getElementById('planGarage').value;
        const style = document.getElementById('planStyle').value.trim();
        const elevationsStr = document.getElementById('planElevations').value.trim();
        const notes = document.getElementById('planNotes').value.trim();

        if (!code) {
            alert('Plan code is required');
            return;
        }

        if (!elevationsStr) {
            alert('At least one elevation is required');
            return;
        }

        const elevations = elevationsStr.split(',').map(e => e.trim().toUpperCase()).filter(Boolean);

        const plans = Storage.getPlans();
        const id = this.editingPlanId || code.replace(/[^a-z0-9]/gi, '').toLowerCase();

        // Check for duplicate code
        if (!this.editingPlanId && plans.find(p => p.code === code)) {
            alert('A plan with this code already exists');
            return;
        }

        const plan = {
            id,
            code,
            name,
            type,
            sqft: sqft ? parseInt(sqft) : null,
            bedrooms: bedrooms ? parseInt(bedrooms) : null,
            bathrooms: bathrooms ? parseFloat(bathrooms) : null,
            garage: garage || null,
            style: style || null,
            elevations,
            notes: notes || null
        };

        if (this.editingPlanId) {
            const index = plans.findIndex(p => p.id === this.editingPlanId);
            plans[index] = plan;
        } else {
            plans.push(plan);
        }

        Storage.setPlans(plans);
        this.renderPlans();
        this.renderStats();
        this.closePlanModal();
    },

    // ==================== FILTER FUNCTIONS ====================
    filterPlans() {
        const searchTerm = document.getElementById('planSearch')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('planTypeFilter')?.value || '';

        const plans = Storage.getPlans();
        const filtered = plans.filter(plan => {
            const matchesSearch = !searchTerm ||
                plan.code.toLowerCase().includes(searchTerm) ||
                (plan.name && plan.name.toLowerCase().includes(searchTerm));
            const matchesType = !typeFilter || plan.type === typeFilter;
            return matchesSearch && matchesType;
        });

        const grid = document.getElementById('planGrid');
        if (!grid) return;

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No plans match your search criteria.</p></div>';
            return;
        }

        grid.innerHTML = filtered.map(plan => {
            const typeColor = plan.type === 'Single Story' ? '#2d5a3d' :
                plan.type === 'Two Story' ? '#1a472a' : '#3498db';
            return `
                <div class="plan-card" onclick="App.editPlan('${plan.id}')">
                    <div class="plan-header">
                        <span class="plan-code">${this.escapeHtml(plan.code)}</span>
                        <span class="plan-type" style="background: ${typeColor}">
                            ${this.escapeHtml(plan.type)}
                        </span>
                    </div>
                    <div class="plan-details">
                        <div class="plan-detail"><strong>Name:</strong> ${this.escapeHtml(plan.name || 'N/A')}</div>
                        <div class="plan-detail"><strong>Sq Ft:</strong> ${plan.sqft ? plan.sqft.toLocaleString() : 'N/A'}</div>
                        <div class="plan-detail"><strong>Beds/Baths:</strong> ${plan.bedrooms || '?'}/${plan.bathrooms || '?'}</div>
                        <div class="plan-detail"><strong>Garage:</strong> ${this.escapeHtml(plan.garage || 'N/A')}</div>
                    </div>
                    <div class="plan-footer">
                        <span style="font-size: 12px; color: #7f8c8d;">Elevations: ${plan.elevations.join(', ')}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==================== EXPORT/IMPORT ====================
    exportPlans() {
        const plans = Storage.getPlans();
        Storage.exportToCSV(plans, `${this.currentBuilder}_plans_${Date.now()}.csv`);
    },

    exportPricing() {
        const pricing = Storage.getPricing();
        Storage.exportToCSV(pricing, `${this.currentBuilder}_pricing_${Date.now()}.csv`);
    },

    exportMaterials() {
        const materials = Storage.getMaterials();
        Storage.exportToCSV(materials, `${this.currentBuilder}_materials_${Date.now()}.csv`);
    },

    importPricing() {
        alert('Import feature: Upload your Excel file and we\'ll extract pricing data.\n\nTo implement:\n1. Export current data to see format\n2. Update your spreadsheet\n3. Save as CSV and use browser file selector\n\nFull Excel import coming soon!');
    },

    importMaterials() {
        alert('Import feature: Upload your Random Lengths reports or vendor quotes.\n\nTo implement:\n1. Export current materials to see format\n2. Update your spreadsheet\n3. Save as CSV and use browser file selector\n\nFull Excel import coming soon!');
    },

    // ==================== UTILITY ====================
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export functions to global scope for inline onclick handlers
window.App = App;
window.Storage = Storage;
window.Modals = Modals;
window.Calculators = Calculators;
window.Reports = Reports;

// Global functions for onclick handlers
function showTab(tab) { App.showTab(tab); }
function switchBuilder() { App.switchBuilder(document.getElementById('builderSelect').value); }
function openPlanModal() { App.openPlanModal(); }
function editPlan(id) { App.editPlan(id); }
function closePlanModal() { App.closePlanModal(); }
function savePlan() { App.savePlan(); }
function filterPlans() { App.filterPlans(); }
function exportPlans() { App.exportPlans(); }
function exportPricing() { App.exportPricing(); }
function exportMaterials() { App.exportMaterials(); }
function importPricing() { App.importPricing(); }
function importMaterials() { App.importMaterials(); }
function openCalculator(type) { Calculators.openCalculator(type); }
function generateReport(type) { Reports.generateReport(type); }
