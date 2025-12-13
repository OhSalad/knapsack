/**
 * Strassen's Matrix Multiplication Visualizer
 * Renders step-by-step visualization of the divide-and-conquer algorithm
 */

export class StrassenVisualizer {
    constructor(containerId, statusId) {
        this.container = document.getElementById(containerId);
        this.statusEl = document.getElementById(statusId);
        this.steps = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.speed = 500;
        this.playInterval = null;
        this.onStepChange = null;
        this.onComplete = null;
    }

    init(steps, matrixA, matrixB) {
        this.steps = steps;
        this.currentStep = 0;
        this.matrixA = matrixA;
        this.matrixB = matrixB;
        this._renderCurrentStep();
    }

    setSpeed(ms) {
        this.speed = ms;
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this._autoStep();
    }

    pause() {
        this.isPlaying = false;
        if (this.playInterval) {
            clearTimeout(this.playInterval);
            this.playInterval = null;
        }
    }

    stepForward() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this._renderCurrentStep();
            return true;
        }
        return false;
    }

    stepBackward() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this._renderCurrentStep();
            return true;
        }
        return false;
    }

    _autoStep() {
        if (!this.isPlaying) return;

        if (this.stepForward()) {
            this.playInterval = setTimeout(() => this._autoStep(), this.speed);
        } else {
            this.isPlaying = false;
            if (this.onComplete) this.onComplete();
        }
    }

    _renderCurrentStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;

        this._updateStatus(step);
        this._renderVisualization(step);

        if (this.onStepChange) {
            this.onStepChange(this.currentStep, this.steps.length);
        }
    }

    _updateStatus(step) {
        if (!this.statusEl) return;

        let html = '';
        if (step.title) {
            html += `<strong>${step.title}</strong><br>`;
        }
        html += step.description || '';

        this.statusEl.innerHTML = html;
    }

    _renderVisualization(step) {
        if (!this.container) return;

        let html = '<div class="strassen-viz">';

        // Always show input matrices at the top
        html += '<div class="strassen-matrices-row">';
        html += this._renderMatrix(step.matrixA || this.matrixA, 'Matrix A', 'matrix-a');
        html += '<span class="matrix-operator">×</span>';
        html += this._renderMatrix(step.matrixB || this.matrixB, 'Matrix B', 'matrix-b');

        if (step.result) {
            html += '<span class="matrix-operator">=</span>';
            html += this._renderMatrix(step.result, 'Result C', 'matrix-c result');
        }
        html += '</div>';

        // Show phase-specific content
        switch (step.type) {
            case 'divide':
                html += this._renderDivideStep(step);
                break;
            case 'strassen-2x2-start':
            case 'strassen-product':
                html += this._renderProductsStep(step);
                break;
            case 'strassen-2x2-combine':
            case 'combine':
                html += this._renderCombineStep(step);
                break;
            case 'complete':
                html += this._renderCompleteStep(step);
                break;
        }

        // Stats panel
        if (step.stats) {
            html += this._renderStatsPanel(step.stats);
        }

        html += '</div>';
        this.container.innerHTML = html;
    }

    _renderMatrix(matrix, label, className = '') {
        if (!matrix) return '';

        let html = `<div class="strassen-matrix ${className}">`;
        html += `<div class="matrix-label">${label}</div>`;
        html += '<div class="matrix-grid">';

        for (let i = 0; i < matrix.length; i++) {
            html += '<div class="matrix-row">';
            for (let j = 0; j < matrix[i].length; j++) {
                html += `<div class="matrix-cell">${matrix[i][j]}</div>`;
            }
            html += '</div>';
        }

        html += '</div></div>';
        return html;
    }

    _renderDivideStep(step) {
        let html = '<div class="strassen-divide-section">';
        html += '<h4>📐 Dividing Matrices into Quadrants</h4>';
        html += '<div class="quadrants-grid">';

        if (step.quadrantsA) {
            html += '<div class="quadrant-group">';
            html += '<div class="quadrant-title">Matrix A Quadrants</div>';
            html += '<div class="quadrant-row">';
            html += this._renderSmallMatrix(step.quadrantsA.A11, 'A11');
            html += this._renderSmallMatrix(step.quadrantsA.A12, 'A12');
            html += '</div>';
            html += '<div class="quadrant-row">';
            html += this._renderSmallMatrix(step.quadrantsA.A21, 'A21');
            html += this._renderSmallMatrix(step.quadrantsA.A22, 'A22');
            html += '</div>';
            html += '</div>';
        }

        if (step.quadrantsB) {
            html += '<div class="quadrant-group">';
            html += '<div class="quadrant-title">Matrix B Quadrants</div>';
            html += '<div class="quadrant-row">';
            html += this._renderSmallMatrix(step.quadrantsB.B11, 'B11');
            html += this._renderSmallMatrix(step.quadrantsB.B12, 'B12');
            html += '</div>';
            html += '<div class="quadrant-row">';
            html += this._renderSmallMatrix(step.quadrantsB.B21, 'B21');
            html += this._renderSmallMatrix(step.quadrantsB.B22, 'B22');
            html += '</div>';
            html += '</div>';
        }

        html += '</div></div>';
        return html;
    }

    _renderProductsStep(step) {
        let html = '<div class="strassen-products-section">';
        html += '<h4>🔢 Computing 7 Strassen Products</h4>';
        html += '<div class="products-list">';

        const products = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'];
        const formulas = [
            '(A11 + A22) × (B11 + B22)',
            '(A21 + A22) × B11',
            'A11 × (B12 - B22)',
            'A22 × (B21 - B11)',
            '(A11 + A12) × B22',
            '(A21 - A11) × (B11 + B12)',
            '(A12 - A22) × (B21 + B22)'
        ];

        products.forEach((p, i) => {
            const isActive = step.product === p;
            const isComputed = step.products && step.products[p] !== undefined;
            html += `<div class="product-item ${isActive ? 'active' : ''} ${isComputed ? 'computed' : ''}">`;
            html += `<span class="product-name">${p}</span>`;
            html += `<span class="product-formula">${formulas[i]}</span>`;
            if (step.product === p && step.value !== undefined) {
                html += `<span class="product-value">= ${step.value}</span>`;
            } else if (isComputed) {
                html += `<span class="product-value">= ${step.products[p]}</span>`;
            }
            html += '</div>';
        });

        html += '</div></div>';
        return html;
    }

    _renderCombineStep(step) {
        let html = '<div class="strassen-combine-section">';
        html += '<h4>🔗 Combining Results</h4>';

        html += '<div class="combine-formulas">';
        html += '<div class="formula">C11 = M1 + M4 - M5 + M7</div>';
        html += '<div class="formula">C12 = M3 + M5</div>';
        html += '<div class="formula">C21 = M2 + M4</div>';
        html += '<div class="formula">C22 = M1 - M2 + M3 + M6</div>';
        html += '</div>';

        if (step.quadrantsC) {
            html += '<div class="result-quadrants">';
            html += '<div class="quadrant-row">';
            html += this._renderSmallMatrix(step.quadrantsC.C11, 'C11', 'result');
            html += this._renderSmallMatrix(step.quadrantsC.C12, 'C12', 'result');
            html += '</div>';
            html += '<div class="quadrant-row">';
            html += this._renderSmallMatrix(step.quadrantsC.C21, 'C21', 'result');
            html += this._renderSmallMatrix(step.quadrantsC.C22, 'C22', 'result');
            html += '</div>';
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    _renderCompleteStep(step) {
        let html = '<div class="strassen-complete-section">';
        html += '<div class="complete-badge">✅ Multiplication Complete!</div>';

        if (step.stats) {
            const naiveMults = Math.pow(step.result?.length || 2, 3);
            const savings = ((1 - step.stats.multiplications / naiveMults) * 100).toFixed(1);
            html += '<div class="savings-info">';
            html += `<strong>Strassen:</strong> ${step.stats.multiplications} multiplications<br>`;
            html += `<strong>Naive:</strong> ${naiveMults} multiplications<br>`;
            html += `<strong>Savings:</strong> ${savings}%`;
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    _renderSmallMatrix(matrix, label, extraClass = '') {
        if (!matrix || !matrix.length) return '';

        let html = `<div class="small-matrix ${extraClass}">`;
        html += `<div class="small-matrix-label">${label}</div>`;
        html += '<div class="small-matrix-grid">';

        for (let i = 0; i < matrix.length; i++) {
            html += '<div class="small-matrix-row">';
            for (let j = 0; j < matrix[i].length; j++) {
                html += `<div class="small-matrix-cell">${matrix[i][j]}</div>`;
            }
            html += '</div>';
        }

        html += '</div></div>';
        return html;
    }

    _renderStatsPanel(stats) {
        return `
            <div class="strassen-stats-panel">
                <div class="stat-item">
                    <span class="stat-label">Multiplications:</span>
                    <span class="stat-value">${stats.multiplications}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Additions:</span>
                    <span class="stat-value">${stats.additions}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Depth:</span>
                    <span class="stat-value">${stats.maxDepth}</span>
                </div>
            </div>
        `;
    }

    getCurrentStep() {
        return this.currentStep;
    }

    getTotalSteps() {
        return this.steps.length;
    }

    isComplete() {
        return this.currentStep >= this.steps.length - 1;
    }
}
