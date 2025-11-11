// ==================== ENHANCED DATA STORAGE MODULE ====================
const Storage = {
    currentBuilder: 'holt',

    setBuilder(builder) {
        this.currentBuilder = builder;
    },

    get(key, defaultValue = []) {
        try {
            const fullKey = `${this.currentBuilder}_${key}`;
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : defaultValue;
        } catch (err) {
            console.error('Storage error:', err);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            const fullKey = `${this.currentBuilder}_${key}`;
            localStorage.setItem(fullKey, JSON.stringify(value));
            this.updateLastModified();
            return true;
        } catch (err) {
            console.error('Storage error:', err);
            alert('Unable to save data. Please check browser storage.');
            return false;
        }
    },

    updateLastModified() {
        const timestamp = new Date().toISOString();
        localStorage.setItem(`${this.currentBuilder}_lastModified`, timestamp);
    },

    getLastModified() {
        return localStorage.getItem(`${this.currentBuilder}_lastModified`) || 'Never';
    },

    // Data accessors
    getPlans() { return this.get('plans', []); },
    setPlans(data) { return this.set('plans', data); },

    getPricing() { return this.get('pricing', []); },
    setPricing(data) { return this.set('pricing', data); },

    getOptions() { return this.get('options', []); },
    setOptions(data) { return this.set('options', data); },

    getCommunities() { return this.get('communities', []); },
    setCommunities(data) { return this.set('communities', data); },

    getPacks() { return this.get('packs', []); },
    setPacks(data) { return this.set('packs', data); },

    getMaterials() { return this.get('materials', []); },
    setMaterials(data) { return this.set('materials', data); },

    // UOM Conversions
    getUOMConversions() { return this.get('uomConversions', this.getDefaultUOMConversions()); },
    setUOMConversions(data) { return this.set('uomConversions', data); },

    // Categories with numbers
    getCategories() { return this.get('categories', this.getDefaultCategories()); },
    setCategories(data) { return this.set('categories', data); },

    // RL Pricing
    getRLPricing() { return this.get('rlPricing', []); },
    setRLPricing(data) { return this.set('rlPricing', data); },

    // RL Historical Data
    getRLHistory() { return this.get('rlHistory', []); },
    setRLHistory(data) { return this.set('rlHistory', data); },

    // Default UOM conversion factors
    getDefaultUOMConversions() {
        return [
            { id: 'conv1', fromUOM: 'BF', toUOM: 'LF', factor: 1, description: 'Board Feet to Linear Feet (varies by dimensions)' },
            { id: 'conv2', fromUOM: 'LF', toUOM: 'EA', factor: 1, description: 'Linear Feet to Each (specify length)' },
            { id: 'conv3', fromUOM: 'SHT', toUOM: 'SF', factor: 32, description: 'Sheet (4x8) to Square Feet' },
            { id: 'conv4', fromUOM: 'SQR', toUOM: 'SF', factor: 100, description: 'Square (roofing) to Square Feet' },
            { id: 'conv5', fromUOM: 'M', toUOM: 'EA', factor: 1000, description: 'Thousand to Each' },
            { id: 'conv6', fromUOM: 'MBF', toUOM: 'BF', factor: 1000, description: 'Thousand Board Feet to Board Feet' },
            { id: 'conv7', fromUOM: 'CWT', toUOM: 'LBS', factor: 100, description: 'Hundred Weight to Pounds' }
        ];
    },

    // Default categories with numbers
    getDefaultCategories() {
        return [
            { id: 'cat01', number: '01', name: 'Dimensional Lumber', description: 'Framing lumber and studs' },
            { id: 'cat02', number: '02', name: 'Engineered Lumber', description: 'LVL, LSL, I-Joists' },
            { id: 'cat03', number: '03', name: 'Sheathing', description: 'OSB, Plywood panels' },
            { id: 'cat04', number: '04', name: 'Pressure Treated', description: 'PT lumber for decks and exterior' },
            { id: 'cat05', number: '05', name: 'Hardware', description: 'Nails, screws, brackets, connectors' },
            { id: 'cat06', number: '06', name: 'Concrete', description: 'Concrete, rebar, forms' },
            { id: 'cat07', number: '07', name: 'Roofing', description: 'Shingles, underlayment, flashing' },
            { id: 'cat08', number: '08', name: 'Siding', description: 'Exterior siding materials' },
            { id: 'cat09', number: '09', name: 'Trim', description: 'Interior and exterior trim' },
            { id: 'cat10', number: '10', name: 'Insulation', description: 'Batt, spray, rigid insulation' },
            { id: 'cat99', number: '99', name: 'Other', description: 'Miscellaneous materials' }
        ];
    },

    // Convert between UOMs for a specific material
    convertUOM(material, quantity, fromUOM, toUOM) {
        if (fromUOM === toUOM) return quantity;

        // Handle lumber conversions
        if (material.boardFeet && material.linearFeet) {
            if (fromUOM === 'EA' && toUOM === 'BF') return quantity * material.boardFeet;
            if (fromUOM === 'BF' && toUOM === 'EA') return quantity / material.boardFeet;
            if (fromUOM === 'EA' && toUOM === 'LF') return quantity * material.linearFeet;
            if (fromUOM === 'LF' && toUOM === 'EA') return quantity / material.linearFeet;
        }

        // Handle sheet material conversions
        if (material.squareFeet) {
            if (fromUOM === 'SHT' && toUOM === 'SF') return quantity * material.squareFeet;
            if (fromUOM === 'SF' && toUOM === 'SHT') return quantity / material.squareFeet;
        }

        // Check conversion table
        const conversions = this.getUOMConversions();
        const conversion = conversions.find(c => c.fromUOM === fromUOM && c.toUOM === toUOM);
        if (conversion) return quantity * conversion.factor;

        return quantity;
    },

    // Get price for material in specific UOM
    getMaterialPrice(materialSKU, uom) {
        const pricing = this.getPricing();
        const item = pricing.find(p => p.itemNumber === materialSKU);

        if (!item) return null;

        if (item.uomPricing) {
            const uomPrice = item.uomPricing.find(u => u.um === uom);
            if (uomPrice) {
                const unitPrice = uomPrice.unitCost / (1 - (uomPrice.margin / 100));
                return { unitCost: uomPrice.unitCost, margin: uomPrice.margin, unitPrice: unitPrice };
            }
        }

        if (item.primaryUM === uom && item.unitCost) {
            const unitPrice = item.unitCost / (1 - ((item.margin || 15) / 100));
            return { unitCost: item.unitCost, margin: item.margin || 15, unitPrice: unitPrice };
        }

        return null;
    },

    // Get material by RL Tag
    getMaterialByRLTag(rlTag) {
        const materials = this.getMaterials();
        return materials.find(m => m.rlTag === rlTag);
    },

    // Get pricing by RL Tag
    getPricingByRLTag(rlTag) {
        const pricing = this.getPricing();
        return pricing.find(p => p.rlTag === rlTag);
    },

    // Update material costs from RL data
    updateCostsFromRL() {
        const rlPricing = this.getRLPricing();
        const materials = this.getMaterials();

        let updated = 0;
        const updatedMaterials = materials.map(material => {
            const rlTag = material.rlTag;
            if (rlTag) {
                const rl = rlPricing.find(r => r.rlTag === rlTag);
                if (rl) {
                    updated++;
                    return {
                        ...material,
                        vendorCost: rl.pricePerBF,
                        freight: rl.freightPerBF,
                        rlPriceDate: rl.priceDate,
                        lastRLUpdate: new Date().toISOString()
                    };
                }
            }
            return material;
        });

        this.setMaterials(updatedMaterials);
        console.log(`✓ Updated ${updated} materials with current RL pricing`);
        return updated;
    },

    // Initialize sample data
    initializeSampleData() {
        if (!this.getCategories().length) {
            this.setCategories(this.getDefaultCategories());
        }

        if (!this.getUOMConversions().length) {
            this.setUOMConversions(this.getDefaultUOMConversions());
        }

        if (this.currentBuilder === 'holt' && !this.getPlans().length) {
            this.setPlans([
                { id: '1670', code: '1670', name: 'Coyote Ridge', type: 'Two Story', sqft: 1670, bedrooms: 3, bathrooms: 2.5, garage: '2-Car', elevations: ['A', 'B', 'C', 'D'], style: 'Traditional' },
                { id: '2184', code: '2184', name: 'Golden Grove', type: 'Two Story', sqft: 2184, bedrooms: 4, bathrooms: 2.5, garage: '2-Car', elevations: ['A', 'C', 'D'], style: 'Modern' },
                { id: '1649', code: '1649', name: 'Heartwood', type: 'Single Story', sqft: 1649, bedrooms: 3, bathrooms: 2, garage: '2-Car', elevations: ['A', 'B', 'C'], style: 'Ranch' }
            ]);

            this.setCommunities([
                { id: 'willow', name: 'Willow Ridge', builder: 'Holt Homes', yard: 'FOGRORYD', activePlans: 12, requirements: 'All decks include post wraps' },
                { id: 'coyote', name: 'Coyote Ridge', builder: 'Holt Homes', yard: 'FOGRORYD', activePlans: 8, requirements: 'Standard' }
            ]);

            this.setPricing([
                { id: 'p1', itemNumber: '2X4-8-SPF', description: '2x4x8 SPF Stud', category: 'Lumber', categoryNumber: '01', primaryUM: 'EA', uomPricing: [{ um: 'EA', unitCost: 3.25, margin: 15 }] },
                { id: 'p2', itemNumber: '2X6-8-SPF', description: '2x6x8 SPF', category: 'Lumber', categoryNumber: '01', primaryUM: 'EA', uomPricing: [{ um: 'EA', unitCost: 6.50, margin: 15 }] },
                { id: 'p3', itemNumber: 'OSB-716-4X8', description: '7/16" OSB 4x8', category: 'Panels', categoryNumber: '03', primaryUM: 'SHT', uomPricing: [{ um: 'SHT', unitCost: 12.75, margin: 18 }] }
            ]);

            this.setOptions([
                { id: 'opt1', code: 'DECK-12X12', description: '12x12 Deck Package', category: 'Deck', basePrice: 2450, triggersPacks: ['Deck Frame', 'Deck Surface'], appliesTo: ['1670', '2184'] },
                { id: 'opt2', code: 'FENCE-6FT', description: '6ft Privacy Fence', category: 'Fencing', basePrice: 28.50, triggersPacks: [], appliesTo: [] }
            ]);

            this.setMaterials([
                { id: 'm1', sku: '2X4-8-SPF', description: '2x4x8 SPF Stud', categoryNumber: '01', category: 'Dimensional Lumber', subcategory: 'Framing', primaryUM: 'EA', vendorCost: 2.85, freight: 0.40, uomOptions: ['EA', 'BF', 'LF'] },
                { id: 'm2', sku: '2X6-8-SPF', description: '2x6x8 SPF', categoryNumber: '01', category: 'Dimensional Lumber', subcategory: 'Framing', primaryUM: 'EA', vendorCost: 5.75, freight: 0.75, uomOptions: ['EA', 'BF', 'LF'] },
                { id: 'm3', sku: '2X6-16-SPF', description: '2x6x16 SPF', categoryNumber: '01', category: 'Dimensional Lumber', subcategory: 'Framing', primaryUM: 'EA', vendorCost: 11.50, freight: 1.50, uomOptions: ['EA', 'BF', 'LF'] },
                { id: 'm4', sku: 'OSB-716-4X8', description: '7/16" OSB 4x8 Sheet', categoryNumber: '03', category: 'Sheathing', subcategory: 'Wall Sheathing', primaryUM: 'SHT', vendorCost: 11.25, freight: 1.50, uomOptions: ['SHT', 'SF'] },
                { id: 'm5', sku: 'OSB-1124-4X8', description: '11/24" OSB 4x8 Sheet', categoryNumber: '03', category: 'Sheathing', subcategory: 'Roof Sheathing', primaryUM: 'SHT', vendorCost: 14.75, freight: 1.75, uomOptions: ['SHT', 'SF'] },
                { id: 'm6', sku: 'PT-2X6-8', description: '2x6x8 Pressure Treated', categoryNumber: '04', category: 'Pressure Treated', subcategory: 'Deck/Exterior', primaryUM: 'EA', vendorCost: 8.25, freight: 1.00, uomOptions: ['EA', 'BF', 'LF'] },
                { id: 'm7', sku: 'LVL-1.75X14-16', description: '1.75"x14" LVL 16ft', categoryNumber: '02', category: 'Engineered Lumber', subcategory: 'Beams', primaryUM: 'EA', vendorCost: 92.50, freight: 12.00, uomOptions: ['EA', 'LF'] }
            ]);
        }

        if (this.currentBuilder === 'richmond' && !this.getPlans().length) {
            this.setPlans([
                { id: 'G21D', code: 'G21D', name: 'Daniel', type: 'Two Story', sqft: 2130, bedrooms: 4, bathrooms: 3, garage: '2-Car', elevations: ['A', 'B', 'C'], style: 'Traditional' },
                { id: 'G250', code: 'G250', name: 'Hemingway', type: 'Single Story', sqft: 1852, bedrooms: 3, bathrooms: 2, garage: '2-Car', elevations: ['A', 'B'], style: 'Ranch' },
                { id: 'G721', code: 'G721', name: 'Arlington', type: 'Two Story', sqft: 2456, bedrooms: 4, bathrooms: 3.5, garage: '3-Car', elevations: ['A', 'B', 'C', 'D'], style: 'Craftsman' }
            ]);

            this.setCommunities([
                { id: 'northhaven', name: 'North Haven', builder: 'Richmond American', yard: 'FOGRORYD', activePlans: 15, requirements: '2-story requires deck surface' },
                { id: 'heartwood', name: 'Heartwood Acres', builder: 'Richmond American', yard: 'FOGRORYD', activePlans: 10, requirements: 'Standard' }
            ]);

            this.setPricing([
                { id: 'p1', itemNumber: '2X4-8-SPF', description: '2x4x8 SPF Stud', category: 'Lumber', categoryNumber: '01', primaryUM: 'EA', uomPricing: [{ um: 'EA', unitCost: 3.15, margin: 15 }] },
                { id: 'p2', itemNumber: '2X6-8-SPF', description: '2x6x8 SPF', category: 'Lumber', categoryNumber: '01', primaryUM: 'EA', uomPricing: [{ um: 'EA', unitCost: 6.25, margin: 15 }] }
            ]);

            this.setOptions([
                { id: 'opt1', code: 'SUNROOM', description: 'Sunroom Addition', category: 'Room Addition', basePrice: 15000, triggersPacks: ['Sunroom'], appliesTo: ['G21D', 'G721'] }
            ]);
        }

        // Common pack data
        if (!this.getPacks().length) {
            this.setPacks([
                { id: 'pb', name: 'P&B', category: 'Foundation', daySingle: 1, dayTwo: 1, leadTime: 3, materialCount: 0 },
                { id: '1walls', name: '1st Walls', category: 'Framing', daySingle: 4, dayTwo: 2, leadTime: 5, materialCount: 0 },
                { id: '2walls', name: '2nd Walls', category: 'Framing', daySingle: null, dayTwo: 8, leadTime: 7, materialCount: 0 },
                { id: 'roof', name: 'Roof', category: 'Framing', daySingle: 14, dayTwo: 15, leadTime: 4, materialCount: 0 },
                { id: 'hwrap', name: 'House Wrap', category: 'Envelope', daySingle: 21, dayTwo: 23, leadTime: 8, materialCount: 0 },
                { id: 'siding', name: 'Siding', category: 'Envelope', daySingle: 27, dayTwo: 30, leadTime: 14, materialCount: 0 }
            ]);
        }
    },

    // Generate unique ID
    generateId(prefix = '') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // Export data to CSV
    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const rows = data.map(obj =>
            headers.map(header => {
                const value = obj[header];
                if (value === null || value === undefined) return '';
                if (Array.isArray(value)) return `"${JSON.stringify(value)}"`;
                if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        );

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
};
