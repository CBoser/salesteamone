// ==================== DATA STORAGE MODULE ====================
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

    // Initialize sample data
    initializeSampleData() {
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
                { id: 'p1', itemNumber: '2X4-8-SPF', description: '2x4x8 SPF Stud', category: 'Lumber', um: 'EA', unitCost: 3.25, margin: 15 },
                { id: 'p2', itemNumber: '2X6-8-SPF', description: '2x6x8 SPF', category: 'Lumber', um: 'EA', unitCost: 6.50, margin: 15 },
                { id: 'p3', itemNumber: 'OSB-716-4X8', description: '7/16" OSB 4x8', category: 'Panels', um: 'SHT', unitCost: 12.75, margin: 18 }
            ]);

            this.setOptions([
                { id: 'opt1', code: 'DECK-12X12', description: '12x12 Deck Package', category: 'Deck', basePrice: 2450, triggersPacks: ['Deck Frame', 'Deck Surface'], appliesTo: ['1670', '2184'] },
                { id: 'opt2', code: 'FENCE-6FT', description: '6ft Privacy Fence', category: 'Fencing', basePrice: 28.50, triggersPacks: [], appliesTo: [] }
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
                { id: 'p1', itemNumber: '2X4-8-SPF', description: '2x4x8 SPF Stud', category: 'Lumber', um: 'EA', unitCost: 3.15, margin: 15 },
                { id: 'p2', itemNumber: '2X6-8-SPF', description: '2x6x8 SPF', category: 'Lumber', um: 'EA', unitCost: 6.25, margin: 15 }
            ]);

            this.setOptions([
                { id: 'opt1', code: 'SUNROOM', description: 'Sunroom Addition', category: 'Room Addition', basePrice: 15000, triggersPacks: ['Sunroom'], appliesTo: ['G21D', 'G721'] }
            ]);
        }

        // Common pack data
        if (!this.getPacks().length) {
            this.setPacks([
                { id: 'pb', name: 'P&B', category: 'Foundation', daySingle: 1, dayTwo: 1, leadTime: 3, materialCount: 45 },
                { id: '1walls', name: '1st Walls', category: 'Framing', daySingle: 4, dayTwo: 2, leadTime: 5, materialCount: 120 },
                { id: '2walls', name: '2nd Walls', category: 'Framing', daySingle: null, dayTwo: 8, leadTime: 7, materialCount: 95 },
                { id: 'roof', name: 'Roof', category: 'Framing', daySingle: 14, dayTwo: 15, leadTime: 4, materialCount: 85 },
                { id: 'hwrap', name: 'House Wrap', category: 'Envelope', daySingle: 21, dayTwo: 23, leadTime: 8, materialCount: 15 },
                { id: 'siding', name: 'Siding', category: 'Envelope', daySingle: 27, dayTwo: 30, leadTime: 14, materialCount: 65 }
            ]);
        }

        // Sample materials
        if (!this.getMaterials().length) {
            this.setMaterials([
                { id: 'm1', sku: '2X4-8-SPF', description: '2x4x8 SPF Stud', category: 'Dimensional Lumber', subcategory: 'Framing', um: 'EA', vendorCost: 2.85, freight: 0.40 },
                { id: 'm2', sku: '2X6-8-SPF', description: '2x6x8 SPF', category: 'Dimensional Lumber', subcategory: 'Framing', um: 'EA', vendorCost: 5.75, freight: 0.75 },
                { id: 'm3', sku: '2X6-16-SPF', description: '2x6x16 SPF', category: 'Dimensional Lumber', subcategory: 'Framing', um: 'EA', vendorCost: 11.50, freight: 1.50 },
                { id: 'm4', sku: 'OSB-716-4X8', description: '7/16" OSB 4x8 Sheet', category: 'Sheathing', subcategory: 'Wall Sheathing', um: 'SHT', vendorCost: 11.25, freight: 1.50 },
                { id: 'm5', sku: 'OSB-1124-4X8', description: '11/24" OSB 4x8 Sheet', category: 'Sheathing', subcategory: 'Roof Sheathing', um: 'SHT', vendorCost: 14.75, freight: 1.75 },
                { id: 'm6', sku: 'PT-2X6-8', description: '2x6x8 Pressure Treated', category: 'Pressure Treated', subcategory: 'Deck/Exterior', um: 'EA', vendorCost: 8.25, freight: 1.00 },
                { id: 'm7', sku: 'LVL-1.75X14-16', description: '1.75"x14" LVL 16ft', category: 'Engineered Lumber', subcategory: 'Beams', um: 'EA', vendorCost: 92.50, freight: 12.00 }
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
                if (Array.isArray(value)) return `"${value.join(', ')}"`;
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
    },

    // Import CSV data
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const obj = {};
            headers.forEach((header, index) => {
                let value = values[index] ? values[index].trim() : '';
                // Remove quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                obj[header] = value;
            });
            data.push(obj);
        }

        return data;
    }
};
