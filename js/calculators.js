// ==================== SPECIALTY CALCULATORS ====================
const Calculators = {
    currentCalculator: null,

    openCalculator(type) {
        this.currentCalculator = type;
        const modal = document.getElementById('calculatorModal');
        const title = document.getElementById('calculatorModalTitle');
        const content = document.getElementById('calculatorContent');

        switch (type) {
            case 'ponyWall':
                title.textContent = 'Pony Wall Calculator';
                content.innerHTML = this.getPonyWallForm();
                break;
            case 'fencing':
                title.textContent = 'Fencing Calculator';
                content.innerHTML = this.getFencingForm();
                break;
            case 'deck':
                title.textContent = 'Deck Calculator';
                content.innerHTML = this.getDeckForm();
                break;
            case 'stairs':
                title.textContent = 'Stairs & Landing Calculator';
                content.innerHTML = this.getStairsForm();
                break;
        }

        modal.classList.add('active');
    },

    closeCalculator() {
        document.getElementById('calculatorModal').classList.remove('active');
        this.currentCalculator = null;
    },

    // ==================== PONY WALL CALCULATOR ====================
    getPonyWallForm() {
        return `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label required">Linear Feet</label>
                    <input type="number" class="form-input" id="ponyWallLength" placeholder="20" step="0.1">
                </div>
                <div class="form-group">
                    <label class="form-label required">Height (feet)</label>
                    <input type="number" class="form-input" id="ponyWallHeight" placeholder="4" step="0.5">
                </div>
                <div class="form-group">
                    <label class="form-label">Stud Spacing (inches)</label>
                    <select class="form-select" id="ponyWallStudSpacing">
                        <option value="16">16" O.C.</option>
                        <option value="24">24" O.C.</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Wall Type</label>
                    <select class="form-select" id="ponyWallType">
                        <option value="2x4">2x4 Wall</option>
                        <option value="2x6">2x6 Wall</option>
                    </select>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="Calculators.calculatePonyWall()">Calculate</button>
            </div>
            <div id="ponyWallResults"></div>
        `;
    },

    calculatePonyWall() {
        const length = parseFloat(document.getElementById('ponyWallLength').value) || 0;
        const height = parseFloat(document.getElementById('ponyWallHeight').value) || 0;
        const studSpacing = parseInt(document.getElementById('ponyWallStudSpacing').value);
        const wallType = document.getElementById('ponyWallType').value;

        if (length <= 0 || height <= 0) {
            alert('Please enter valid dimensions');
            return;
        }

        // Calculate materials
        const plates = Math.ceil(length / 8) * 3; // Top, bottom, and cap plate
        const studs = Math.floor((length * 12) / studSpacing) + 1;
        const sheathing = Math.ceil((length * height) / 32); // 4x8 sheets

        // Get pricing
        const materials = Storage.getMaterials();
        const pricing = Storage.getPricing();

        const studItem = wallType === '2x4' ? '2X4-8-SPF' : '2X6-8-SPF';
        const studCost = this.getMaterialCost(studItem, materials, pricing) * studs;
        const plateCost = this.getMaterialCost(studItem, materials, pricing) * plates;
        const sheathingCost = this.getMaterialCost('OSB-716-4X8', materials, pricing) * sheathing;

        const totalCost = studCost + plateCost + sheathingCost;

        const resultsDiv = document.getElementById('ponyWallResults');
        resultsDiv.innerHTML = `
            <div class="calculator-result">
                <h4>Material List</h4>
                <div class="result-item">
                    <span class="result-label">${wallType.toUpperCase()} Studs (${height}'):</span>
                    <span class="result-value">${studs} pcs</span>
                </div>
                <div class="result-item">
                    <span class="result-label">${wallType.toUpperCase()} Plates (8'):</span>
                    <span class="result-value">${plates} pcs</span>
                </div>
                <div class="result-item">
                    <span class="result-label">7/16" OSB Sheathing:</span>
                    <span class="result-value">${sheathing} sheets</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Estimated Total Cost:</span>
                    <span class="result-value">$${totalCost.toFixed(2)}</span>
                </div>
            </div>
        `;
    },

    // ==================== FENCING CALCULATOR ====================
    getFencingForm() {
        return `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label required">Linear Feet</label>
                    <input type="number" class="form-input" id="fencingLength" placeholder="100" step="1">
                </div>
                <div class="form-group">
                    <label class="form-label required">Fence Height</label>
                    <select class="form-select" id="fencingHeight">
                        <option value="4">4 feet</option>
                        <option value="6" selected>6 feet</option>
                        <option value="8">8 feet</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Post Spacing</label>
                    <select class="form-select" id="fencingPostSpacing">
                        <option value="6">6 feet</option>
                        <option value="8" selected>8 feet</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Fence Type</label>
                    <select class="form-select" id="fencingType">
                        <option value="privacy">Privacy Fence</option>
                        <option value="picket">Picket Fence</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Number of Gates</label>
                    <input type="number" class="form-input" id="fencingGates" placeholder="1" value="0" min="0">
                </div>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="Calculators.calculateFencing()">Calculate</button>
            </div>
            <div id="fencingResults"></div>
        `;
    },

    calculateFencing() {
        const length = parseFloat(document.getElementById('fencingLength').value) || 0;
        const height = parseInt(document.getElementById('fencingHeight').value);
        const postSpacing = parseInt(document.getElementById('fencingPostSpacing').value);
        const fencingType = document.getElementById('fencingType').value;
        const gates = parseInt(document.getElementById('fencingGates').value) || 0;

        if (length <= 0) {
            alert('Please enter valid length');
            return;
        }

        // Calculate materials
        const posts = Math.ceil(length / postSpacing) + 1;
        const rails = posts * 3; // 3 rails per section
        const pickets = fencingType === 'privacy' ?
            Math.ceil((length * 12) / 5.5) : // Privacy: 5.5" spacing
            Math.ceil((length * 12) / 8);    // Picket: 8" spacing

        // Estimate costs
        const materials = Storage.getMaterials();
        const pricing = Storage.getPricing();

        const postCost = this.getMaterialCost('PT-2X6-8', materials, pricing) * posts;
        const railCost = this.getMaterialCost('PT-2X6-8', materials, pricing) * rails;
        const picketCost = this.getMaterialCost('2X4-8-SPF', materials, pricing) * pickets;
        const gateCost = gates * 250; // Estimate $250 per gate

        const totalCost = postCost + railCost + picketCost + gateCost;
        const pricePerFoot = totalCost / length;

        const resultsDiv = document.getElementById('fencingResults');
        resultsDiv.innerHTML = `
            <div class="calculator-result">
                <h4>Material List</h4>
                <div class="result-item">
                    <span class="result-label">4x4 Posts (${height + 2}'):</span>
                    <span class="result-value">${posts} pcs</span>
                </div>
                <div class="result-item">
                    <span class="result-label">2x4 Rails:</span>
                    <span class="result-value">${rails} pcs</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Pickets/Boards:</span>
                    <span class="result-value">${pickets} pcs</span>
                </div>
                ${gates > 0 ? `
                <div class="result-item">
                    <span class="result-label">Gates:</span>
                    <span class="result-value">${gates} ea</span>
                </div>` : ''}
                <div class="result-item">
                    <span class="result-label">Price per Linear Foot:</span>
                    <span class="result-value">$${pricePerFoot.toFixed(2)}/LF</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Estimated Total Cost:</span>
                    <span class="result-value">$${totalCost.toFixed(2)}</span>
                </div>
            </div>
        `;
    },

    // ==================== DECK CALCULATOR ====================
    getDeckForm() {
        return `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label required">Deck Width (feet)</label>
                    <input type="number" class="form-input" id="deckWidth" placeholder="12" step="0.5">
                </div>
                <div class="form-group">
                    <label class="form-label required">Deck Length (feet)</label>
                    <input type="number" class="form-input" id="deckLength" placeholder="16" step="0.5">
                </div>
                <div class="form-group">
                    <label class="form-label">Joist Spacing</label>
                    <select class="form-select" id="deckJoistSpacing">
                        <option value="12">12" O.C.</option>
                        <option value="16" selected>16" O.C.</option>
                        <option value="24">24" O.C.</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Decking Material</label>
                    <select class="form-select" id="deckMaterial">
                        <option value="pt">Pressure Treated</option>
                        <option value="composite">Composite</option>
                        <option value="cedar">Cedar</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Include Railing?</label>
                    <select class="form-select" id="deckRailing">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="Calculators.calculateDeck()">Calculate</button>
            </div>
            <div id="deckResults"></div>
        `;
    },

    calculateDeck() {
        const width = parseFloat(document.getElementById('deckWidth').value) || 0;
        const length = parseFloat(document.getElementById('deckLength').value) || 0;
        const joistSpacing = parseInt(document.getElementById('deckJoistSpacing').value);
        const deckMaterial = document.getElementById('deckMaterial').value;
        const includeRailing = document.getElementById('deckRailing').value === 'yes';

        if (width <= 0 || length <= 0) {
            alert('Please enter valid dimensions');
            return;
        }

        const area = width * length;

        // Calculate framing
        const joists = Math.floor((width * 12) / joistSpacing) + 1;
        const beams = Math.ceil(width / 2); // Assume beams every 2 feet
        const posts = Math.ceil(width / 4) * Math.ceil(length / 8); // Posts every 4' x 8'

        // Calculate decking
        const deckBoards = Math.ceil((area * 12) / 5.5); // 5.5" boards

        // Calculate railing
        const railingLength = includeRailing ? (2 * width + 2 * length) : 0;
        const railingPosts = includeRailing ? Math.ceil(railingLength / 6) : 0;

        // Estimate costs
        const materials = Storage.getMaterials();
        const pricing = Storage.getPricing();

        const joistCost = this.getMaterialCost('PT-2X6-8', materials, pricing) * joists * Math.ceil(length / 8);
        const beamCost = this.getMaterialCost('PT-2X6-8', materials, pricing) * beams * 2;
        const postCost = this.getMaterialCost('PT-2X6-8', materials, pricing) * posts;

        let deckingCost = 0;
        if (deckMaterial === 'pt') {
            deckingCost = this.getMaterialCost('PT-2X6-8', materials, pricing) * deckBoards;
        } else if (deckMaterial === 'composite') {
            deckingCost = area * 8.50; // ~$8.50/sqft for composite
        } else {
            deckingCost = area * 6.75; // ~$6.75/sqft for cedar
        }

        const railingCost = includeRailing ? railingLength * 35 : 0; // ~$35/LF for railing

        const totalCost = joistCost + beamCost + postCost + deckingCost + railingCost;
        const pricePerSqFt = totalCost / area;

        const resultsDiv = document.getElementById('deckResults');
        resultsDiv.innerHTML = `
            <div class="calculator-result">
                <h4>Deck Summary (${area.toFixed(0)} sq ft)</h4>
                <div class="result-item">
                    <span class="result-label">Joists (2x6 PT):</span>
                    <span class="result-value">${joists * Math.ceil(length / 8)} pcs</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Beams (2x6 PT):</span>
                    <span class="result-value">${beams * 2} pcs</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Posts:</span>
                    <span class="result-value">${posts} pcs</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Decking Boards:</span>
                    <span class="result-value">${deckBoards} pcs</span>
                </div>
                ${includeRailing ? `
                <div class="result-item">
                    <span class="result-label">Railing (${railingLength.toFixed(0)} LF):</span>
                    <span class="result-value">Included</span>
                </div>` : ''}
                <div class="result-item">
                    <span class="result-label">Price per Square Foot:</span>
                    <span class="result-value">$${pricePerSqFt.toFixed(2)}/sqft</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Estimated Total Cost:</span>
                    <span class="result-value">$${totalCost.toFixed(2)}</span>
                </div>
            </div>
        `;
    },

    // ==================== STAIRS CALCULATOR ====================
    getStairsForm() {
        return `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label required">Total Rise (inches)</label>
                    <input type="number" class="form-input" id="stairsRise" placeholder="96" step="1">
                </div>
                <div class="form-group">
                    <label class="form-label required">Stair Width (inches)</label>
                    <input type="number" class="form-input" id="stairsWidth" placeholder="36" step="1">
                </div>
                <div class="form-group">
                    <label class="form-label">Stringer Type</label>
                    <select class="form-select" id="stairsStringerType">
                        <option value="cut">Cut Stringers (2x12)</option>
                        <option value="solid">Solid Stringers</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Include Landing?</label>
                    <select class="form-select" id="stairsLanding">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>
                <div class="form-group" id="landingSizeGroup" style="display: none;">
                    <label class="form-label">Landing Size (sqft)</label>
                    <input type="number" class="form-input" id="stairsLandingSize" placeholder="16" step="1">
                </div>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="Calculators.calculateStairs()">Calculate</button>
            </div>
            <div id="stairsResults"></div>
            <script>
                document.getElementById('stairsLanding').addEventListener('change', function() {
                    document.getElementById('landingSizeGroup').style.display =
                        this.value === 'yes' ? 'block' : 'none';
                });
            </script>
        `;
    },

    calculateStairs() {
        const rise = parseFloat(document.getElementById('stairsRise').value) || 0;
        const width = parseFloat(document.getElementById('stairsWidth').value) || 0;
        const stringerType = document.getElementById('stairsStringerType').value;
        const includeLanding = document.getElementById('stairsLanding').value === 'yes';
        const landingSize = includeLanding ? parseFloat(document.getElementById('stairsLandingSize').value) || 0 : 0;

        if (rise <= 0 || width <= 0) {
            alert('Please enter valid dimensions');
            return;
        }

        // Calculate stairs
        const riserHeight = 7.5; // Standard 7.5" rise
        const numSteps = Math.ceil(rise / riserHeight);
        const actualRise = rise / numSteps;
        const treadDepth = 10; // Standard 10" tread
        const totalRun = (numSteps - 1) * treadDepth;

        // Materials
        const stringers = Math.ceil(width / 16) + 1; // Stringers every 16"
        const treads = numSteps;
        const risers = numSteps;

        // Landing materials
        const landingJoists = includeLanding ? Math.ceil(Math.sqrt(landingSize) / 16 * 12) : 0;
        const landingDecking = includeLanding ? Math.ceil(landingSize * 1.5) : 0;

        // Estimate costs
        const materials = Storage.getMaterials();
        const pricing = Storage.getPricing();

        const stringerCost = stringers * 45; // Assume $45 per stringer
        const treadCost = this.getMaterialCost('PT-2X6-8', materials, pricing) * treads * 2;
        const riserCost = this.getMaterialCost('2X4-8-SPF', materials, pricing) * risers * 2;
        const landingCost = includeLanding ? (landingJoists * 12 + landingDecking * 8) : 0;

        const totalCost = stringerCost + treadCost + riserCost + landingCost;

        const resultsDiv = document.getElementById('stairsResults');
        resultsDiv.innerHTML = `
            <div class="calculator-result">
                <h4>Stairs Summary</h4>
                <div class="result-item">
                    <span class="result-label">Number of Steps:</span>
                    <span class="result-value">${numSteps} steps</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Rise per Step:</span>
                    <span class="result-value">${actualRise.toFixed(2)}"</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Run:</span>
                    <span class="result-value">${totalRun}"</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Stringers:</span>
                    <span class="result-value">${stringers} pcs</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Treads:</span>
                    <span class="result-value">${treads * 2} boards</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Risers:</span>
                    <span class="result-value">${risers * 2} boards</span>
                </div>
                ${includeLanding ? `
                <div class="result-item">
                    <span class="result-label">Landing (${landingSize} sqft):</span>
                    <span class="result-value">Included</span>
                </div>` : ''}
                <div class="result-item">
                    <span class="result-label">Estimated Total Cost:</span>
                    <span class="result-value">$${totalCost.toFixed(2)}</span>
                </div>
            </div>
        `;
    },

    // ==================== HELPER FUNCTIONS ====================
    getMaterialCost(sku, materials, pricing) {
        // Try to find in materials first
        const material = materials.find(m => m.sku === sku);
        if (material) {
            return parseFloat(material.vendorCost) + parseFloat(material.freight);
        }

        // Try pricing
        const priceItem = pricing.find(p => p.itemNumber === sku);
        if (priceItem) {
            return parseFloat(priceItem.unitCost);
        }

        // Default fallback costs
        const defaults = {
            '2X4-8-SPF': 3.25,
            '2X6-8-SPF': 6.50,
            'PT-2X6-8': 9.25,
            'OSB-716-4X8': 14.25
        };

        return defaults[sku] || 5.00;
    }
};
