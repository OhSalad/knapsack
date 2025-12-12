export class Visualizer {
    constructor(gridContainerId, explanationPanelId) {
        this.container = document.getElementById(gridContainerId);
        this.explanationContent = document.getElementById(explanationPanelId);
        this.cells = [];
        this.animationId = null;
        this.currentStepIndex = 0;
        this.steps = [];
        this.isPlaying = false;
        this.speed = 500;
    }

    renderGrid(rows, cols, rowHeaders, colHeaders, isInteractive = false) {
        this.container.innerHTML = '';
        this.cells = [];
        this.container.style.gridTemplateColumns = `auto repeat(${cols}, 1fr)`;
        this._createCell('header', '');
        colHeaders.forEach(header => this._createCell('header', header));

        for (let i = 0; i < rows; i++) {
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
        this.pause();
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
            if (step?.type === 'update') {
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
        this.animationId = setTimeout(() => this._animate(), this.speed);
    }

    _executeStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        const step = this.steps[index];
        this.clearHighlights();
        this._highlightDependencies(step);
        this._highlightTarget(step);
        this._updateExplanation(step.description);
        this._updateCellValue(step);
    }

    _highlightDependencies(step) {
        if (!step.highlight) return;
        step.highlight.forEach(coord => {
            this.cells[coord.r]?.[coord.c]?.classList.add('highlight');
        });
    }

    _highlightTarget(step) {
        const targetCell = this.cells[step.row]?.[step.col];
        if (targetCell) {
            targetCell.classList.add('target');
        }
    }

    _updateExplanation(text) {
        this.explanationContent.innerHTML = text;
    }

    _updateCellValue(step) {
        const targetCell = this.cells[step.row]?.[step.col];
        if (!targetCell) return;
        targetCell.textContent = step.type === 'update' ? step.value : step.value;
    }

    clearHighlights() {
        this.cells.flat().forEach(cell => {
            cell.classList.remove('highlight', 'target');
            if (cell.textContent === '?') cell.textContent = '';
        });
    }

    resetVisuals() {
        this.clearHighlights();
        this.cells.flat().forEach(cell => (cell.textContent = ''));
        this.explanationContent.textContent = 'Ready to start...';
    }

    setSpeed(ms) {
        this.speed = ms;
    }
}
