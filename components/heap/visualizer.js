export class HeapVisualizer {
    constructor(containerId, statusId) {
        this.container = document.getElementById(containerId);
        this.statusElement = document.getElementById(statusId);
        this.array = [];
        this.steps = [];
        this.currentStepIndex = 0;
        this.isPlaying = false;
        this.animationId = null;
        this.speed = 500;
    }

    renderHeap(array, options = {}) {
        this.array = [...array];
        this._render(options);
    }

    loadSteps(steps) {
        this.pause();
        this.steps = steps;
        this.currentStepIndex = 0;
        this.clearHighlights();
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
        if (this.currentStepIndex < this.steps.length) {
            this._executeStep(this.currentStepIndex);
            this.currentStepIndex++;
        }
    }

    prev() {
        this.pause();
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this._replayToStep(this.currentStepIndex);
        }
    }

    _render(options = {}) {
        this.container.innerHTML = '';
        const treeContainer = document.createElement('div');
        treeContainer.className = 'heap-tree-container';
        const arrayContainer = document.createElement('div');
        arrayContainer.className = 'heap-array-container';
        this._renderTree(treeContainer, options);
        this._renderArray(arrayContainer);
        this.container.appendChild(treeContainer);
        this.container.appendChild(arrayContainer);
    }

    _renderTree(container, options) {
        const treeRoot = this._buildRecursiveTree(0, options);
        if (treeRoot) container.appendChild(treeRoot);
    }

    _buildRecursiveTree(index, options) {
        const isGhost = index === options.ghostIndex;
        if (index >= this.array.length && !isGhost) return null;

        const wrapper = document.createElement('div');
        wrapper.className = 'tree-wrapper';

        const node = document.createElement('div');
        node.className = 'heap-node';
        node.dataset.index = index;
        node.innerHTML = this._nodeMarkup(index, isGhost, options);
        if (isGhost) node.classList.add('ghost');
        wrapper.appendChild(node);

        const leftIdx = 2 * index + 1;
        const rightIdx = 2 * index + 2;
        const maxIdx = this.array.length + (options.ghostIndex !== undefined ? 1 : 0);

        if (leftIdx < maxIdx) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            const leftChild = this._buildRecursiveTree(leftIdx, options);
            if (leftChild) childrenContainer.appendChild(leftChild);
            if (rightIdx < maxIdx) {
                const rightChild = this._buildRecursiveTree(rightIdx, options);
                if (rightChild) childrenContainer.appendChild(rightChild);
            }
            wrapper.appendChild(childrenContainer);
        }

        return wrapper;
    }

    _nodeMarkup(index, isGhost, options) {
        if (isGhost) return '<span style="font-size: 1.5rem; font-weight: bold;">+</span>';
        if (options.editable) {
            return `
                <input class="node-input" value="${this.array[index]}" data-index="${index}">
                <span class="node-index">[${index}]</span>
            `;
        }
        return `
            <span class="node-value">${this.array[index]}</span>
            <span class="node-index">[${index}]</span>
        `;
    }

    _renderArray(container) {
        const arrayViz = document.createElement('div');
        arrayViz.className = 'heap-array';
        const label = document.createElement('div');
        label.className = 'array-label';
        label.textContent = 'Array Representation:';
        arrayViz.appendChild(label);

        const cellsRow = document.createElement('div');
        cellsRow.className = 'array-cells';
        this.array.forEach((val, idx) => {
            const cell = document.createElement('div');
            cell.className = 'array-cell';
            cell.dataset.index = idx;
            cell.innerHTML = `
                <span class="cell-value">${val}</span>
                <span class="cell-index">[${idx}]</span>
            `;
            cellsRow.appendChild(cell);
        });
        arrayViz.appendChild(cellsRow);
        container.appendChild(arrayViz);
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
        const prevLength = this.array.length;
        this.array = [...step.array];
        
        // Re-render if array size changed (extract/insert operations)
        if (this.array.length !== prevLength) {
            this._render();
        } else {
            this._updateArrayDisplay();
        }
        
        this._applyHighlights(step);
        if (this.statusElement) this.statusElement.innerHTML = step.description;
        this._updateStats(step.stats);
    }

    _applyHighlights(step) {
        if (step.highlightIndex !== undefined) this._highlightNode(step.highlightIndex, 'current');
        if (step.compareIndices) step.compareIndices.forEach(idx => this._highlightNode(idx, 'compare'));
        if (step.swapIndices) step.swapIndices.forEach(idx => this._highlightNode(idx, 'swap'));
    }

    _updateArrayDisplay() {
        const existingCells = document.querySelectorAll('.array-cell');
        
        // If cell count doesn't match array length, need full re-render
        if (existingCells.length !== this.array.length) {
            this._render();
            return;
        }
        
        existingCells.forEach((cell, idx) => {
            if (idx < this.array.length) {
                cell.querySelector('.cell-value').textContent = this.array[idx];
            }
        });

        document.querySelectorAll('.heap-node').forEach(node => {
            const idx = parseInt(node.dataset.index, 10);
            if (idx < this.array.length) {
                const valueSpan = node.querySelector('.node-value');
                if (valueSpan) valueSpan.textContent = this.array[idx];
            }
        });
    }

    _highlightNode(index, type) {
        const node = document.querySelector(`.heap-node[data-index="${index}"]`);
        const cell = document.querySelector(`.array-cell[data-index="${index}"]`);
        node?.classList.add(`highlight-${type}`);
        cell?.classList.add(`highlight-${type}`);
    }

    clearHighlights() {
        document.querySelectorAll('.heap-node, .array-cell').forEach(el => {
            el.classList.remove('highlight-current', 'highlight-compare', 'highlight-swap', 'highlight-correct', 'highlight-incorrect');
        });
    }

    _updateStats(stats) {
        if (!stats) return;
        const heapifyEl = document.getElementById('heapify-count');
        const swapEl = document.getElementById('swap-count');
        const recursiveEl = document.getElementById('recursive-count');
        if (heapifyEl) heapifyEl.textContent = stats.heapifyCalls;
        if (swapEl) swapEl.textContent = stats.swapCount;
        if (recursiveEl) recursiveEl.textContent = stats.recursiveCalls;
    }

    _replayToStep(targetIndex) {
        if (this.steps.length === 0) return;
        const initStep = this.steps[0];
        this.array = [...initStep.array];
        for (let i = 0; i <= targetIndex; i++) {
            const step = this.steps[i];
            if (step.type === 'after-swap') this.array = [...step.array];
        }
        this._updateArrayDisplay();
        const step = this.steps[targetIndex];
        if (this.statusElement) this.statusElement.innerHTML = step.description;
        this._updateStats(step.stats);
    }

    setSpeed(ms) {
        this.speed = ms;
    }

    resetVisuals() {
        this.clearHighlights();
        if (this.statusElement) this.statusElement.textContent = 'Ready to start...';
    }
}
