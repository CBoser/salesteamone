// ==================== MODAL MANAGEMENT ====================
const Modals = {
    editingId: null,
    editingType: null,

    // Utility: Escape HTML
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Close any modal
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        this.editingId = null;
        this.editingType = null;
    },

    // Open modal
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    },

    // ==================== COMMUNITIES MODAL ====================
    openCommunityModal(id = null) {
        this.editingId = id;
        this.editingType = 'community';

        const modal = document.getElementById('communityModal');
        const title = document.getElementById('communityModalTitle');

        if (id) {
            const communities = Storage.getCommunities();
            const community = communities.find(c => c.id === id);
            if (!community) return;

            title.textContent = 'Edit Community';
            document.getElementById('communityName').value = community.name;
            document.getElementById('communityBuilder').value = community.builder;
            document.getElementById('communityYard').value = community.yard;
            document.getElementById('communityActivePlans').value = community.activePlans || 0;
            document.getElementById('communityRequirements').value = community.requirements || '';
        } else {
            title.textContent = 'Add New Community';
            document.getElementById('communityName').value = '';
            document.getElementById('communityBuilder').value = Storage.currentBuilder === 'holt' ? 'Holt Homes' : 'Richmond American';
            document.getElementById('communityYard').value = 'FOGRORYD';
            document.getElementById('communityActivePlans').value = '0';
            document.getElementById('communityRequirements').value = '';
        }

        this.openModal('communityModal');
    },

    saveCommunity() {
        const name = document.getElementById('communityName').value.trim();
        const builder = document.getElementById('communityBuilder').value.trim();
        const yard = document.getElementById('communityYard').value.trim();
        const activePlans = document.getElementById('communityActivePlans').value;
        const requirements = document.getElementById('communityRequirements').value.trim();

        if (!name) {
            alert('Community name is required');
            return;
        }

        const communities = Storage.getCommunities();
        const id = this.editingId || Storage.generateId('comm_');

        const community = {
            id,
            name,
            builder,
            yard,
            activePlans: parseInt(activePlans) || 0,
            requirements: requirements || 'Standard'
        };

        if (this.editingId) {
            const index = communities.findIndex(c => c.id === this.editingId);
            communities[index] = community;
        } else {
            communities.push(community);
        }

        Storage.setCommunities(communities);
        App.renderCommunities();
        App.renderStats();
        this.closeModal('communityModal');
    },

    deleteCommunity(id) {
        if (!confirm('Are you sure you want to delete this community?')) return;

        const communities = Storage.getCommunities();
        const filtered = communities.filter(c => c.id !== id);
        Storage.setCommunities(filtered);
        App.renderCommunities();
        App.renderStats();
    },

    // ==================== OPTIONS MODAL ====================
    openOptionModal(id = null) {
        this.editingId = id;
        this.editingType = 'option';

        const modal = document.getElementById('optionModal');
        const title = document.getElementById('optionModalTitle');

        if (id) {
            const options = Storage.getOptions();
            const option = options.find(o => o.id === id);
            if (!option) return;

            title.textContent = 'Edit Option';
            document.getElementById('optionCode').value = option.code;
            document.getElementById('optionDescription').value = option.description;
            document.getElementById('optionCategory').value = option.category;
            document.getElementById('optionBasePrice').value = option.basePrice || 0;
            document.getElementById('optionTriggersPacks').value = option.triggersPacks ? option.triggersPacks.join(', ') : '';
            document.getElementById('optionAppliesTo').value = option.appliesTo ? option.appliesTo.join(', ') : '';
        } else {
            title.textContent = 'Add New Option';
            document.getElementById('optionCode').value = '';
            document.getElementById('optionDescription').value = '';
            document.getElementById('optionCategory').value = 'Deck';
            document.getElementById('optionBasePrice').value = '0';
            document.getElementById('optionTriggersPacks').value = '';
            document.getElementById('optionAppliesTo').value = '';
        }

        this.openModal('optionModal');
    },

    saveOption() {
        const code = document.getElementById('optionCode').value.trim();
        const description = document.getElementById('optionDescription').value.trim();
        const category = document.getElementById('optionCategory').value;
        const basePrice = document.getElementById('optionBasePrice').value;
        const triggersPacks = document.getElementById('optionTriggersPacks').value.trim();
        const appliesTo = document.getElementById('optionAppliesTo').value.trim();

        if (!code || !description) {
            alert('Option code and description are required');
            return;
        }

        const options = Storage.getOptions();
        const id = this.editingId || Storage.generateId('opt_');

        const option = {
            id,
            code,
            description,
            category,
            basePrice: parseFloat(basePrice) || 0,
            triggersPacks: triggersPacks ? triggersPacks.split(',').map(s => s.trim()).filter(Boolean) : [],
            appliesTo: appliesTo ? appliesTo.split(',').map(s => s.trim()).filter(Boolean) : []
        };

        if (this.editingId) {
            const index = options.findIndex(o => o.id === this.editingId);
            options[index] = option;
        } else {
            options.push(option);
        }

        Storage.setOptions(options);
        App.renderOptions();
        App.renderStats();
        this.closeModal('optionModal');
    },

    deleteOption(id) {
        if (!confirm('Are you sure you want to delete this option?')) return;

        const options = Storage.getOptions();
        const filtered = options.filter(o => o.id !== id);
        Storage.setOptions(filtered);
        App.renderOptions();
        App.renderStats();
    },

    // ==================== PACKS MODAL ====================
    openPackModal(id = null) {
        this.editingId = id;
        this.editingType = 'pack';

        const modal = document.getElementById('packModal');
        const title = document.getElementById('packModalTitle');

        if (id) {
            const packs = Storage.getPacks();
            const pack = packs.find(p => p.id === id);
            if (!pack) return;

            title.textContent = 'Edit Pack';
            document.getElementById('packName').value = pack.name;
            document.getElementById('packCategory').value = pack.category;
            document.getElementById('packDaySingle').value = pack.daySingle || '';
            document.getElementById('packDayTwo').value = pack.dayTwo || '';
            document.getElementById('packLeadTime').value = pack.leadTime || 0;
            document.getElementById('packMaterialCount').value = pack.materialCount || 0;
        } else {
            title.textContent = 'Define New Pack';
            document.getElementById('packName').value = '';
            document.getElementById('packCategory').value = 'Framing';
            document.getElementById('packDaySingle').value = '';
            document.getElementById('packDayTwo').value = '';
            document.getElementById('packLeadTime').value = '5';
            document.getElementById('packMaterialCount').value = '0';
        }

        this.openModal('packModal');
    },

    savePack() {
        const name = document.getElementById('packName').value.trim();
        const category = document.getElementById('packCategory').value;
        const daySingle = document.getElementById('packDaySingle').value;
        const dayTwo = document.getElementById('packDayTwo').value;
        const leadTime = document.getElementById('packLeadTime').value;
        const materialCount = document.getElementById('packMaterialCount').value;

        if (!name) {
            alert('Pack name is required');
            return;
        }

        const packs = Storage.getPacks();
        const id = this.editingId || Storage.generateId('pack_');

        const pack = {
            id,
            name,
            category,
            daySingle: daySingle ? parseInt(daySingle) : null,
            dayTwo: dayTwo ? parseInt(dayTwo) : null,
            leadTime: parseInt(leadTime) || 0,
            materialCount: parseInt(materialCount) || 0
        };

        if (this.editingId) {
            const index = packs.findIndex(p => p.id === this.editingId);
            packs[index] = pack;
        } else {
            packs.push(pack);
        }

        Storage.setPacks(packs);
        App.renderPacks();
        this.closeModal('packModal');
    },

    deletePack(id) {
        if (!confirm('Are you sure you want to delete this pack?')) return;

        const packs = Storage.getPacks();
        const filtered = packs.filter(p => p.id !== id);
        Storage.setPacks(filtered);
        App.renderPacks();
    },

    // ==================== PRICING MODAL ====================
    openPricingModal(id = null) {
        this.editingId = id;
        this.editingType = 'pricing';

        const modal = document.getElementById('pricingModal');
        const title = document.getElementById('pricingModalTitle');

        if (id) {
            const pricing = Storage.getPricing();
            const item = pricing.find(p => p.id === id);
            if (!item) return;

            title.textContent = 'Edit Pricing Item';
            document.getElementById('pricingItemNumber').value = item.itemNumber;
            document.getElementById('pricingDescription').value = item.description;
            document.getElementById('pricingCategory').value = item.category;
            document.getElementById('pricingUM').value = item.um;
            document.getElementById('pricingUnitCost').value = item.unitCost;
            document.getElementById('pricingMargin').value = item.margin;
        } else {
            title.textContent = 'Add Pricing Item';
            document.getElementById('pricingItemNumber').value = '';
            document.getElementById('pricingDescription').value = '';
            document.getElementById('pricingCategory').value = 'Lumber';
            document.getElementById('pricingUM').value = 'EA';
            document.getElementById('pricingUnitCost').value = '0';
            document.getElementById('pricingMargin').value = '15';
        }

        this.openModal('pricingModal');
    },

    savePricing() {
        const itemNumber = document.getElementById('pricingItemNumber').value.trim();
        const description = document.getElementById('pricingDescription').value.trim();
        const category = document.getElementById('pricingCategory').value;
        const um = document.getElementById('pricingUM').value;
        const unitCost = document.getElementById('pricingUnitCost').value;
        const margin = document.getElementById('pricingMargin').value;

        if (!itemNumber || !description) {
            alert('Item number and description are required');
            return;
        }

        const pricing = Storage.getPricing();
        const id = this.editingId || Storage.generateId('price_');

        const item = {
            id,
            itemNumber,
            description,
            category,
            um,
            unitCost: parseFloat(unitCost) || 0,
            margin: parseFloat(margin) || 15
        };

        if (this.editingId) {
            const index = pricing.findIndex(p => p.id === this.editingId);
            pricing[index] = item;
        } else {
            pricing.push(item);
        }

        Storage.setPricing(pricing);
        App.renderPricing();
        App.renderStats();
        this.closeModal('pricingModal');
    },

    // ==================== MATERIALS MODAL ====================
    openMaterialModal(id = null) {
        this.editingId = id;
        this.editingType = 'material';

        const modal = document.getElementById('materialModal');
        const title = document.getElementById('materialModalTitle');

        if (id) {
            const materials = Storage.getMaterials();
            const material = materials.find(m => m.id === id);
            if (!material) return;

            title.textContent = 'Edit Material';
            document.getElementById('materialSKU').value = material.sku;
            document.getElementById('materialDescription').value = material.description;
            document.getElementById('materialCategory').value = material.category;
            document.getElementById('materialSubcategory').value = material.subcategory || '';
            document.getElementById('materialUM').value = material.um;
            document.getElementById('materialVendorCost').value = material.vendorCost;
            document.getElementById('materialFreight').value = material.freight;
        } else {
            title.textContent = 'Add Material';
            document.getElementById('materialSKU').value = '';
            document.getElementById('materialDescription').value = '';
            document.getElementById('materialCategory').value = 'Dimensional Lumber';
            document.getElementById('materialSubcategory').value = '';
            document.getElementById('materialUM').value = 'EA';
            document.getElementById('materialVendorCost').value = '0';
            document.getElementById('materialFreight').value = '0';
        }

        this.openModal('materialModal');
    },

    saveMaterial() {
        const sku = document.getElementById('materialSKU').value.trim();
        const description = document.getElementById('materialDescription').value.trim();
        const category = document.getElementById('materialCategory').value;
        const subcategory = document.getElementById('materialSubcategory').value.trim();
        const um = document.getElementById('materialUM').value;
        const vendorCost = document.getElementById('materialVendorCost').value;
        const freight = document.getElementById('materialFreight').value;

        if (!sku || !description) {
            alert('SKU and description are required');
            return;
        }

        const materials = Storage.getMaterials();
        const id = this.editingId || Storage.generateId('mat_');

        const material = {
            id,
            sku,
            description,
            category,
            subcategory,
            um,
            vendorCost: parseFloat(vendorCost) || 0,
            freight: parseFloat(freight) || 0
        };

        if (this.editingId) {
            const index = materials.findIndex(m => m.id === this.editingId);
            materials[index] = material;
        } else {
            materials.push(material);
        }

        Storage.setMaterials(materials);
        App.renderMaterials();
        App.renderStats();
        this.closeModal('materialModal');
    }
};
