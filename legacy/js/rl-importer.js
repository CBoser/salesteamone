// ==================== RANDOM LENGTHS PRICING IMPORTER ====================
const RLImporter = {

    async importRLAdders(csvFile) {
        try {
            const csvText = await this.readFile(csvFile);
            const parsed = this.parseCSV(csvText);

            console.log(`Processing ${parsed.length} RL pricing items...`);

            const rlPricing = [];
            const sampleRow = parsed[0];
            const dateColumn = Object.keys(sampleRow).find(key => key.match(/^\d{2}\/\d{2}\/\d{4}$/));

            parsed.forEach(row => {
                const rlTag = row['RL_TAG'];
                const description = row['Product Description'];
                const currentPrice = this.cleanCurrency(row[dateColumn] || '0');
                const freightMBF = this.cleanCurrency(row['Freight (MBF)'] || '0');
                const margin = this.cleanPercent(row['Margin'] || '11%');

                if (!rlTag || !description) return;

                rlPricing.push({
                    id: `rl_${rlTag.toLowerCase()}`,
                    rlTag: rlTag,
                    description: description,
                    pricePerMBF: currentPrice,
                    pricePerBF: currentPrice / 1000,
                    freightPerMBF: freightMBF,
                    freightPerBF: freightMBF / 1000,
                    margin: margin,
                    priceDate: dateColumn,
                    category: 'Random Lengths - Lumber',
                    categoryNumber: '25',
                    source: 'RL Adders'
                });
            });

            console.log(`✓ Imported ${rlPricing.length} RL pricing items`);
            return rlPricing;

        } catch (error) {
            console.error('Error importing RL Adders:', error);
            return [];
        }
    },

    async importRLAverage(csvFile) {
        try {
            const csvText = await this.readFile(csvFile);
            const parsed = this.parseCSV(csvText);

            console.log(`Processing ${parsed.length} RL average items...`);

            const rlHistory = [];
            const sampleRow = parsed[0];
            const dateColumns = Object.keys(sampleRow).filter(key => key.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/));

            parsed.forEach(row => {
                const rlTag = row['RL_TAG'];
                const description = row['Product Description'];
                const weekAvg = parseFloat(row['1 Wk Avg']) || 0;
                const dollarDiff = this.cleanCurrency(row['$ Diff'] || '0');
                const percentDiff = this.cleanPercent(row['% Diff'] || '0%');

                if (!rlTag) return;

                const historicalPrices = {};
                dateColumns.forEach(date => {
                    const price = parseFloat(row[date]) || 0;
                    if (price > 0) historicalPrices[date] = price;
                });

                rlHistory.push({
                    id: `rlhist_${rlTag.toLowerCase()}`,
                    rlTag: rlTag,
                    description: description,
                    currentAverage: weekAvg,
                    priceChange: dollarDiff,
                    percentChange: percentDiff,
                    historicalPrices: historicalPrices,
                    source: 'RL Average'
                });
            });

            console.log(`✓ Imported ${rlHistory.length} RL historical records`);
            return rlHistory;

        } catch (error) {
            console.error('Error importing RL Average:', error);
            return [];
        }
    },

    linkRLToMaterials(rlPricing, existingMaterials) {
        console.log('Linking RL pricing to materials...');

        const rlByTag = new Map();
        rlPricing.forEach(rl => rlByTag.set(rl.rlTag, rl));

        const linkedMaterials = existingMaterials.map(material => {
            const rlTag = this.extractRLTag(material);

            if (rlTag && rlByTag.has(rlTag)) {
                const rlData = rlByTag.get(rlTag);

                return {
                    ...material,
                    rlTag: rlTag,
                    rlPricePerMBF: rlData.pricePerMBF,
                    rlPricePerBF: rlData.pricePerBF,
                    rlFreightPerMBF: rlData.freightPerMBF,
                    rlFreightPerBF: rlData.freightPerBF,
                    rlMargin: rlData.margin,
                    rlPriceDate: rlData.priceDate,
                    vendorCost: rlData.pricePerBF + rlData.freightPerBF,
                    costBreakdown: {
                        baseCost: rlData.pricePerBF,
                        freight: rlData.freightPerBF,
                        total: rlData.pricePerBF + rlData.freightPerBF
                    }
                };
            }
            return material;
        });

        const linkedCount = linkedMaterials.filter(m => m.rlTag).length;
        console.log(`✓ Linked ${linkedCount} materials to RL pricing`);
        return linkedMaterials;
    },

    extractRLTag(material) {
        const text = `${material.description || ''} ${material.sku || ''} ${material.notes || ''}`.toUpperCase();
        const tagMatch = text.match(/\b([A-Z]{4})\b/);
        if (tagMatch) return tagMatch[1];
        if (material.sku && material.sku.length === 4 && material.sku.match(/^[A-Z]{4}$/)) {
            return material.sku;
        }
        return null;
    },

    createEnhancedPricing(rlPricing) {
        console.log('Creating enhanced pricing from RL data...');

        const pricing = [];

        rlPricing.forEach(rl => {
            const costPerBF = rl.pricePerBF + rl.freightPerBF;
            const costPerMBF = rl.pricePerMBF + rl.freightPerMBF;

            pricing.push({
                id: `price_${rl.rlTag.toLowerCase()}`,
                itemNumber: rl.rlTag,
                description: rl.description,
                categoryNumber: rl.categoryNumber,
                category: rl.category,
                primaryUM: 'BF',
                rlTag: rl.rlTag,
                rlPriceDate: rl.priceDate,
                uomPricing: [
                    {
                        um: 'BF',
                        unitCost: costPerBF,
                        margin: rl.margin,
                        breakdown: { baseCost: rl.pricePerBF, freight: rl.freightPerBF }
                    },
                    {
                        um: 'MBF',
                        unitCost: costPerMBF,
                        margin: rl.margin,
                        breakdown: { baseCost: rl.pricePerMBF, freight: rl.freightPerMBF }
                    }
                ],
                source: 'Random Lengths'
            });
        });

        console.log(`✓ Created ${pricing.length} enhanced pricing entries`);
        return pricing;
    },

    generateRLReport(rlPricing, rlHistory) {
        const report = {
            summary: {
                totalItems: rlPricing.length,
                averagePrice: 0,
                averageFreight: 0,
                averageMargin: 0,
                priceDate: rlPricing[0]?.priceDate || 'Unknown'
            },
            priceChanges: [],
            topMovers: []
        };

        let totalPrice = 0, totalFreight = 0, totalMargin = 0;

        rlPricing.forEach(item => {
            totalPrice += item.pricePerMBF;
            totalFreight += item.freightPerMBF;
            totalMargin += item.margin;
        });

        report.summary.averagePrice = (totalPrice / rlPricing.length).toFixed(2);
        report.summary.averageFreight = (totalFreight / rlPricing.length).toFixed(2);
        report.summary.averageMargin = (totalMargin / rlPricing.length).toFixed(2);

        rlHistory.forEach(hist => {
            if (Math.abs(hist.percentChange) > 0) {
                report.priceChanges.push({
                    rlTag: hist.rlTag,
                    description: hist.description,
                    currentPrice: hist.currentAverage,
                    change: hist.priceChange,
                    percentChange: hist.percentChange
                });
            }
        });

        report.topMovers = report.priceChanges
            .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
            .slice(0, 10);

        return report;
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
        return [];
    },

    cleanCurrency(str) {
        if (!str) return 0;
        const cleaned = str.toString().replace(/[$,\s]/g, '');
        return parseFloat(cleaned) || 0;
    },

    cleanPercent(str) {
        if (!str) return 0;
        const cleaned = str.toString().replace(/[%\s]/g, '');
        return parseFloat(cleaned) || 0;
    }
};

window.RLImporter = RLImporter;
