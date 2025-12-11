class Visualizer {
    constructor(gridContainerId, explanationPanelId) {
        this.container = document.getElementById(gridContainerId);
        this.explanationContent = document.getElementById(explanationPanelId);
        this.cells = []; // 2D array of cell elements
        this.animationId = null;
        this.currentStepIndex = 0;
        this.steps = [];
        this.isPlaying = false;
        this.speed = 500;
        // Audio context removed
    }

    renderGrid(rows, cols, rowHeaders, colHeaders, isInteractive = false) {
        this.container.innerHTML = '';
        this.cells = [];

        // Set CSS Grid template
        // +1 for headers
        this.container.style.gridTemplateColumns = `auto repeat(${cols}, 1fr)`;

        // Top-Left Corner (Empty)
        this._createCell('header', '');

        // Col Headers
        colHeaders.forEach(header => this._createCell('header', header));

        for (let i = 0; i < rows; i++) {
            // Row Header
            this._createCell('header', rowHeaders[i]);

            this.cells[i] = [];
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                if (isInteractive) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.dataset.row = i;
                    input.dataset.col = j;
                    cell.appendChild(input);
                } else {
                    cell.textContent = ''; // Start empty
                }

                this.container.appendChild(cell);
                this.cells[i][j] = cell;
            }
        }
    }

    _createCell(type, content) {
        const cell = document.createElement('div');
        cell.className = `grid-cell ${type}`;
        cell.innerHTML = content;
        this.container.appendChild(cell);
        return cell;
    }

    loadSteps(steps) {
        this.pause(); // Ensure no previous animation is running
        this.steps = steps;
        this.currentStepIndex = 0;
        this.resetVisuals();
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this._animate();
    }

    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
    }

    next() {
        this.pause();
        this._executeStep(this.currentStepIndex);
        if (this.currentStepIndex < this.steps.length) {
            this.currentStepIndex++;
        }
    }

    prev() {
        this.pause();
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            const step = this.steps[this.currentStepIndex];
            if (step.type === 'update') {
                this.cells[step.row][step.col].textContent = '';
                this.cells[step.row][step.col].classList.remove('target');
            }
            this.clearHighlights();
        }
    }

    _animate() {
        if (!this.isPlaying) return;

        if (this.currentStepIndex >= this.steps.length) {
            this.isPlaying = false;
            return;
        }

        this._executeStep(this.currentStepIndex);
        this.currentStepIndex++;

        this.animationId = setTimeout(() => {
            this._animate();
        }, this.speed);
    }

    _executeStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        const step = this.steps[index];

        // Clear previous highlights
        this.clearHighlights();

        // Highlight dependencies (Optimal substructure)
        if (step.highlight) {
            step.highlight.forEach(coord => {
                if (this.cells[coord.r] && this.cells[coord.r][coord.c]) {
                    this.cells[coord.r][coord.c].classList.add('highlight');
                }
            });
        }

        // Highlight current target
        const targetCell = this.cells[step.row][step.col];
        targetCell.classList.add('target');

        // Show explanation
        this.explanationContent.innerHTML = step.description;

        // If update, set value
        if (step.type === 'update') {
            targetCell.textContent = step.value;
        } else {
            // Inspecting
            targetCell.textContent = step.value; // user sees '?'
        }
    }

    clearHighlights() {
        this.cells.flat().forEach(cell => {
            cell.classList.remove('highlight', 'target');
            if (cell.textContent === '?') cell.textContent = '';
        });
    }

    resetVisuals() {
        this.clearHighlights();
        this.cells.flat().forEach(cell => cell.textContent = '');
        this.explanationContent.textContent = "Ready to start...";
    }

    setSpeed(ms) {
        this.speed = ms;
    }
}
