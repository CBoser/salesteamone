// ==================== HOLT BAT CSV IMPORTER ====================
const HoltImporter = {

    async importPlans(csvFile) {
        try {
            const csvText = await this.readFile(csvFile);
            const parsed = this.parseCSV(csvText);

            console.log(`Processing ${parsed.length} plans...`);

            const plans = parsed.map(row => {
                const planSheet = row['Plan Sheet'] || '';
                const planCode = planSheet.split(' ')[0] || '';
                const baseCode = planCode.replace(/[ABCD]+$/, '');

                const modelFull = row['Model'] || '';
                const [model, community] = modelFull.split(' - ').map(s => s.trim());

                const elevationsStr = row['Elevations'] || '';
                const elevations = elevationsStr.split(',').map(e => e.trim().charAt(0)).filter(e => e.match(/[A-Z]/));

                const mainArea = parseInt(row['Living Area Main']) || 0;
                const upperArea = row['Living Area Upper'] !== 'N/A' ? (parseInt(row['Living Area Upper']) || 0) : 0;
                const totalArea = parseInt(row['Living Area Total']) || 0;

                let type = 'Single Story';
                if (upperArea > 0 && upperArea > mainArea * 0.3) type = 'Two Story';

                const garageStr = row['Garage'] || '';
                let garage = null;
                if (garageStr.includes('3-Car')) garage = '3-Car';
                else if (garageStr.includes('2-Car')) garage = '2-Car';
                else if (garageStr.includes('1-Car')) garage = '1-Car';

                return {
                    id: baseCode.toLowerCase(),
                    code: baseCode,
                    name: community || model,
                    type: type,
                    sqft: totalArea,
                    bedrooms: null,
                    bathrooms: null,
                    garage: garage,
                    style: null,
                    elevations: elevations,
                    notes: `Plan Sheet: ${planSheet}. Main: ${mainArea} sf, Upper: ${upperArea > 0 ? upperArea + ' sf' : 'N/A'}`,
                    community: community,
                    planSheet: planSheet
                };
            });

            console.log(`✓ Imported ${plans.length} plans`);
            return plans;

        } catch (error) {
            console.error('Error importing plans:', error);
            return [];
        }
    },

    async importPricing(csvFile, defaultMargin = 15) {
        try {
            const csvText = await this.readFile(csvFile);
            const parsed = this.parseCSV(csvText);

            console.log(`Processing ${parsed.length} pricing items...`);

            const categoryMap = new Map();
            parsed.forEach(row => {
                const catDesc = row['Product Category Description'];
                if (catDesc) {
                    const match = catDesc.match(/^(\d+)\s*-\s*(.+)$/);
                    if (match) {
                        const [, num, name] = match;
                        if (!categoryMap.has(num)) {
                            categoryMap.set(num, {
                                id: `cat${num}`,
                                number: num,
                                name: name.trim(),
                                description: row['Minor Category Description'] || ''
                            });
                        }
                    }
                }
            });

            const categories = Array.from(categoryMap.values());
            console.log(`✓ Found ${categories.length} unique categories`);

            const materials = [];
            const pricing = [];

            parsed.forEach(row => {
                const itemId = row['Item ID'];
                const description = row['Item Description'];
                const categoryDesc = row['Product Category Description'];
                const minorCategory = row['Minor Category Description'];
                const uom = row['Unconverted - Costing UoM'];
                const conversionFactor = parseFloat(row['Conversion Factor']) || 1;
                const itemClass = row['Item Class'];
                const baseCost = this.cleanCurrency(row['Base Cost']);

                if (!itemId || !description) return;

                const catMatch = categoryDesc?.match(/^(\d+)/);
                const categoryNumber = catMatch ? catMatch[1] : '99';
                const categoryName = categoryDesc?.replace(/^\d+\s*-\s*/, '') || 'Other';

                const uomOptions = [uom];

                if (categoryName.includes('LUMBER') || categoryName.includes('TIMBER')) {
                    if (uom === 'EA' || uom === 'MBF') {
                        uomOptions.push('BF', 'LF');
                    }
                }

                if (categoryName.includes('PANEL') || categoryName.includes('PLYWOOD') || categoryName.includes('OSB')) {
                    if (uom === 'SHT' || uom === 'MSF') {
                        uomOptions.push('SF');
                    }
                }

                const material = {
                    id: `mat_${itemId.replace(/[^a-z0-9]/gi, '_')}`,
                    sku: itemId,
                    description: description,
                    categoryNumber: categoryNumber,
                    category: categoryName,
                    subcategory: minorCategory || '',
                    primaryUM: uom === 'MBF' ? 'BF' : (uom === 'MSF' ? 'SF' : uom),
                    vendorCost: baseCost,
                    freight: 0,
                    conversionFactor: conversionFactor,
                    itemClass: itemClass,
                    uomOptions: [...new Set(uomOptions)]
                };

                if (uom === 'MBF') {
                    material.boardFeet = 1000 * conversionFactor;
                }

                materials.push(material);

                const pricingEntry = {
                    id: `price_${itemId.replace(/[^a-z0-9]/gi, '_')}`,
                    itemNumber: itemId,
                    description: description,
                    categoryNumber: categoryNumber,
                    category: categoryName,
                    primaryUM: material.primaryUM,
                    uomPricing: [{
                        um: material.primaryUM,
                        unitCost: baseCost,
                        margin: defaultMargin
                    }]
                };

                pricing.push(pricingEntry);
            });

            console.log(`✓ Imported ${materials.length} materials`);
            console.log(`✓ Imported ${pricing.length} pricing items`);

            return { categories, materials, pricing };

        } catch (error) {
            console.error('Error importing pricing:', error);
            return null;
        }
    },

    async importMaterialIndex(csvFile) {
        try {
            const csvText = await this.readFile(csvFile);
            const parsed = this.parseCSV(csvText);

            console.log(`Processing ${parsed.length} material index entries...`);

            const packMap = new Map();

            parsed.forEach(row => {
                const packId = row['PackID'];
                if (packId && !packMap.has(packId)) {
                    const packName = packId.replace(/^\|/, '').trim();
                    const packMatch = packName.match(/^(\d+[A-Z]*)\s+(.+)$/);

                    if (packMatch) {
                        const [, code, category] = packMatch;
                        packMap.set(packId, {
                            id: `pack_${code.replace(/[^a-z0-9]/gi, '_')}`,
                            name: packName,
                            code: code,
                            category: category,
                            daySingle: null,
                            dayTwo: null,
                            leadTime: 5,
                            materialCount: 0
                        });
                    }
                }
            });

            const packs = Array.from(packMap.values());

            parsed.forEach(row => {
                const packId = row['PackID'];
                if (packId && packMap.has(packId)) {
                    packMap.get(packId).materialCount++;
                }
            });

            console.log(`✓ Found ${packs.length} unique packs`);

            const planMaterials = parsed.map(row => ({
                planTable: row['PlanTable'],
                itemId: row['ItemID'],
                packId: row['PackID'],
                description: row['Description'],
                quantity: parseFloat(row['Qty']) || 0,
                uom: row['UOM'],
                costEach: parseFloat(row['CostEach']) || 0,
                sellEach: parseFloat(row['SellEach']) || 0,
                marginPercent: row['MarginPercent']
            }));

            return { packs, planMaterials };

        } catch (error) {
            console.error('Error importing material index:', error);
            return null;
        }
    },

    async importAllHoltData(pricingFile, plansFile, materialsFile) {
        console.log('Starting Holt BAT import...');

        const results = {
            plans: [],
            categories: [],
            materials: [],
            pricing: [],
            packs: [],
            planMaterials: []
        };

        if (plansFile) {
            results.plans = await this.importPlans(plansFile);
        }

        if (pricingFile) {
            const pricingData = await this.importPricing(pricingFile);
            if (pricingData) {
                results.categories = pricingData.categories;
                results.materials = pricingData.materials;
                results.pricing = pricingData.pricing;
            }
        }

        if (materialsFile) {
            const materialIndex = await this.importMaterialIndex(materialsFile);
            if (materialIndex) {
                results.packs = materialIndex.packs;
                results.planMaterials = materialIndex.planMaterials;
            }
        }

        console.log('✓ Import complete!');
        return results;
    },

    saveToStorage(importResults) {
        let saved = 0;

        try {
            if (importResults.categories.length > 0) {
                Storage.setCategories(importResults.categories);
                saved++;
            }

            if (importResults.plans.length > 0) {
                Storage.setPlans(importResults.plans);
                saved++;
            }

            if (importResults.materials.length > 0) {
                Storage.setMaterials(importResults.materials);
                saved++;
            }

            if (importResults.pricing.length > 0) {
                Storage.setPricing(importResults.pricing);
                saved++;
            }

            if (importResults.packs.length > 0) {
                Storage.setPacks(importResults.packs);
                saved++;
            }

            console.log(`✓ Saved ${saved} data collections`);

            if (typeof App !== 'undefined' && App.renderAll) {
                App.renderAll();
            }

            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    },

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    },

    parseCSV(csvText) {
        if (typeof Papa !== 'undefined') {
            const result = Papa.parse(csvText, {
                header: true,
                dynamicTyping: false,
                skipEmptyLines: true
            });
            return result.data;
        }
        return this.simpleCSVParse(csvText);
    },

    simpleCSVParse(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
            });
            data.push(row);
        }

        return data;
    },

    cleanCurrency(str) {
        if (!str) return 0;
        const cleaned = str.toString().replace(/[$,]/g, '');
        return parseFloat(cleaned) || 0;
    }
};

window.HoltImporter = HoltImporter;
