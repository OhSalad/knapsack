/**
 * Heap Solver - Max-Heap Operations with Step Tracking
 * Tracks: heapify calls, swaps, recursive calls, array state after each operation
 */

class HeapSolver {
    constructor(array) {
        this.originalArray = [...array];
        this.array = [...array];
        this.n = array.length;
        this.steps = [];
        this.heapifyCalls = 0;
        this.swapCount = 0;
        this.recursiveCalls = 0;
    }

    /**
     * Build Max-Heap from unsorted array
     * Uses bottom-up approach starting from last non-leaf node
     */
    buildMaxHeap() {
        this.steps = [];
        this.heapifyCalls = 0;
        this.swapCount = 0;
        this.recursiveCalls = 0;
        this.array = [...this.originalArray];

        this.steps.push({
            type: 'init',
            array: [...this.array],
            description: `Starting Build-Max-Heap on array: [${this.array.join(', ')}]`,
            stats: this._getStats()
        });

        const startIndex = Math.floor(this.n / 2) - 1;

        this.steps.push({
            type: 'info',
            array: [...this.array],
            description: `Last non-leaf node is at index ${startIndex}. Starting heapify from bottom-up.`,
            highlightIndex: startIndex,
            stats: this._getStats()
        });

        // Build heap (bottom-up)
        for (let i = startIndex; i >= 0; i--) {
            this.steps.push({
                type: 'loop-start',
                loopIndex: i,
                array: [...this.array],
                description: `── Loop iteration: Calling Max-Heapify on index ${i} (value: ${this.array[i]})`,
                highlightIndex: i,
                stats: this._getStats()
            });

            this._maxHeapify(i, this.n);

            this.steps.push({
                type: 'loop-end',
                loopIndex: i,
                array: [...this.array],
                description: `✓ Completed heapify for subtree rooted at index ${i}. Array state: [${this.array.join(', ')}]`,
                stats: this._getStats()
            });
        }

        this.steps.push({
            type: 'complete',
            array: [...this.array],
            description: `🎉 Build-Max-Heap complete! Final heap: [${this.array.join(', ')}]`,
            stats: this._getStats()
        });

        return {
            heap: [...this.array],
            steps: this.steps,
            stats: this._getStats()
        };
    }

    /**
     * Max-Heapify: Maintain max-heap property for subtree rooted at index i
     * @param {number} i - Root index of subtree
     * @param {number} heapSize - Size of heap to consider
     * @param {number} depth - Recursion depth for tracking
     */
    _maxHeapify(i, heapSize, depth = 0) {
        this.heapifyCalls++;
        if (depth > 0) {
            this.recursiveCalls++;
        }

        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let largest = i;

        this.steps.push({
            type: 'heapify-start',
            index: i,
            left: left < heapSize ? left : null,
            right: right < heapSize ? right : null,
            array: [...this.array],
            description: `${' '.repeat(depth * 2)}Heapify(${i}): Comparing node ${i} (${this.array[i]}) with children`,
            highlightIndex: i,
            compareIndices: [left < heapSize ? left : null, right < heapSize ? right : null].filter(x => x !== null),
            depth: depth,
            stats: this._getStats()
        });

        // Check if left child exists and is greater than root
        if (left < heapSize && this.array[left] > this.array[largest]) {
            this.steps.push({
                type: 'compare',
                index: i,
                compareWith: left,
                array: [...this.array],
                description: `${' '.repeat(depth * 2)}Left child (${this.array[left]}) > current largest (${this.array[largest]})`,
                highlightIndex: left,
                stats: this._getStats()
            });
            largest = left;
        }

        // Check if right child exists and is greater than current largest
        if (right < heapSize && this.array[right] > this.array[largest]) {
            this.steps.push({
                type: 'compare',
                index: i,
                compareWith: right,
                array: [...this.array],
                description: `${' '.repeat(depth * 2)}Right child (${this.array[right]}) > current largest (${this.array[largest]})`,
                highlightIndex: right,
                stats: this._getStats()
            });
            largest = right;
        }

        // If largest is not root, swap and recursively heapify
        if (largest !== i) {
            this.steps.push({
                type: 'swap',
                from: i,
                to: largest,
                fromValue: this.array[i],
                toValue: this.array[largest],
                array: [...this.array],
                description: `${' '.repeat(depth * 2)}🔄 Swapping: ${this.array[i]} (index ${i}) ↔ ${this.array[largest]} (index ${largest})`,
                swapIndices: [i, largest],
                stats: this._getStats()
            });

            // Perform swap
            [this.array[i], this.array[largest]] = [this.array[largest], this.array[i]];
            this.swapCount++;

            this.steps.push({
                type: 'after-swap',
                array: [...this.array],
                description: `${' '.repeat(depth * 2)}After swap: [${this.array.join(', ')}]`,
                highlightIndex: largest,
                stats: this._getStats()
            });

            // Recursively heapify the affected subtree
            this.steps.push({
                type: 'recurse',
                fromIndex: i,
                toIndex: largest,
                array: [...this.array],
                description: `${' '.repeat(depth * 2)}↪ Recursively calling Heapify on index ${largest}`,
                highlightIndex: largest,
                stats: this._getStats()
            });

            this._maxHeapify(largest, heapSize, depth + 1);
        } else {
            this.steps.push({
                type: 'no-swap',
                index: i,
                array: [...this.array],
                description: `${' '.repeat(depth * 2)}✓ Node ${i} (${this.array[i]}) satisfies heap property. No swap needed.`,
                highlightIndex: i,
                stats: this._getStats()
            });
        }
    }

    _getStats() {
        return {
            heapifyCalls: this.heapifyCalls,
            swapCount: this.swapCount,
            recursiveCalls: this.recursiveCalls
        };
    }

    /**
     * Generate answer key for Monk Mode
     * Returns the expected swap sequence
     */
    getSwapSequence() {
        const swaps = this.steps.filter(step => step.type === 'swap').map(step => ({
            from: step.from,
            to: step.to,
            fromValue: step.fromValue,
            toValue: step.toValue
        }));
        return swaps;
    }

    /**
     * Validate a user's swap attempt
     */
    validateSwap(currentArray, fromIndex, toIndex, expectedSwaps, swapIndex) {
        if (swapIndex >= expectedSwaps.length) {
            return { valid: false, message: 'No more swaps expected!' };
        }

        const expected = expectedSwaps[swapIndex];

        // Check if the swap matches (could be in either direction)
        const isMatch =
            (fromIndex === expected.from && toIndex === expected.to) ||
            (fromIndex === expected.to && toIndex === expected.from);

        if (isMatch) {
            return {
                valid: true,
                message: `✓ Correct swap! ${currentArray[fromIndex]} ↔ ${currentArray[toIndex]}`
            };
        } else {
            return {
                valid: false,
                message: `✗ Incorrect! Expected swap at indices ${expected.from} ↔ ${expected.to}`
            };
        }
    }
}

/**
 * Generate random array for heap operations
 */
function generateRandomHeapArray(size = 10, maxValue = 50) {
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * maxValue) + 1);
    }
    return array;
}

/**
 * Heap Visualizer - Renders heap as tree and array
 */
class HeapVisualizer {
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

    _render(options = {}) {
        this.container.innerHTML = '';

        // Create tree visualization
        const treeContainer = document.createElement('div');
        treeContainer.className = 'heap-tree-container';

        // Create array visualization
        const arrayContainer = document.createElement('div');
        arrayContainer.className = 'heap-array-container';

        // Render tree
        this._renderTree(treeContainer, options);

        // Render array
        this._renderArray(arrayContainer);

        this.container.appendChild(treeContainer);
        this.container.appendChild(arrayContainer);
    }

    _renderTree(container, options) {
        // Effective length includes ghost node if present
        const n = this.array.length + (options.ghostIndex !== undefined ? 1 : 0);
        if (n === 0) return;

        const treeRoot = this._buildRecursiveTree(0, options);
        if (treeRoot) container.appendChild(treeRoot);
    }

    _buildRecursiveTree(index, options) {
        // Check bounds logic including ghost node
        const isGhost = (index === options.ghostIndex);
        if (index >= this.array.length && !isGhost) return null;

        const wrapper = document.createElement('div');
        wrapper.className = 'tree-wrapper';

        // Node itself
        const node = document.createElement('div');
        node.className = 'heap-node';
        node.dataset.index = index;

        if (isGhost) {
            node.classList.add('ghost');
            node.innerHTML = `<span style="font-size: 1.5rem; font-weight: bold;">+</span>`;
        } else if (options.editable) {
            node.innerHTML = `
                <input class="node-input" value="${this.array[index]}" data-index="${index}">
                <span class="node-index">[${index}]</span>
            `;
        } else {
            node.innerHTML = `
                <span class="node-value">${this.array[index]}</span>
                <span class="node-index">[${index}]</span>
            `;
        }

        wrapper.appendChild(node);

        // Children indices
        const leftIdx = 2 * index + 1;
        const rightIdx = 2 * index + 2;

        // Effective max index
        const maxIdx = this.array.length + (options.ghostIndex !== undefined ? 1 : 0);

        // Create children container if at least one child exists (real or ghost)
        if (leftIdx < maxIdx) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';

            // Left Child
            const leftChild = this._buildRecursiveTree(leftIdx, options);
            if (leftChild) childrenContainer.appendChild(leftChild);

            // Right Child
            if (rightIdx < maxIdx) {
                const rightChild = this._buildRecursiveTree(rightIdx, options);
                if (rightChild) childrenContainer.appendChild(rightChild);
            }

            wrapper.appendChild(childrenContainer);
        }

        return wrapper;
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
            // Re-render from beginning up to current step
            this._replayToStep(this.currentStepIndex);
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

        this.clearHighlights();

        // Update array visualization
        this.array = [...step.array];
        this._updateArrayDisplay();

        // Apply highlights based on step type
        if (step.highlightIndex !== undefined) {
            this._highlightNode(step.highlightIndex, 'current');
        }

        if (step.compareIndices) {
            step.compareIndices.forEach(idx => {
                if (idx !== null) this._highlightNode(idx, 'compare');
            });
        }

        if (step.swapIndices) {
            step.swapIndices.forEach(idx => {
                this._highlightNode(idx, 'swap');
            });
        }

        // Update status text
        if (this.statusElement) {
            this.statusElement.innerHTML = step.description;
        }

        // Update stats display
        this._updateStats(step.stats);
    }

    _updateArrayDisplay() {
        const cells = document.querySelectorAll('.array-cell');
        cells.forEach((cell, idx) => {
            if (idx < this.array.length) {
                cell.querySelector('.cell-value').textContent = this.array[idx];
            }
        });

        const nodes = document.querySelectorAll('.heap-node');
        nodes.forEach((node) => {
            const idx = parseInt(node.dataset.index);
            if (idx < this.array.length) {
                node.querySelector('.node-value').textContent = this.array[idx];
            }
        });
    }

    _highlightNode(index, type) {
        const node = document.querySelector(`.heap-node[data-index="${index}"]`);
        const cell = document.querySelector(`.array-cell[data-index="${index}"]`);

        if (node) node.classList.add(`highlight-${type}`);
        if (cell) cell.classList.add(`highlight-${type}`);
    }

    clearHighlights() {
        const allNodes = document.querySelectorAll('.heap-node, .array-cell');
        allNodes.forEach(el => {
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
        // Get initial state
        if (this.steps.length === 0) return;

        const initStep = this.steps[0];
        this.array = [...initStep.array];

        // Replay all swaps up to target step
        for (let i = 0; i <= targetIndex; i++) {
            const step = this.steps[i];
            if (step.type === 'after-swap') {
                this.array = [...step.array];
            }
        }

        this._updateArrayDisplay();

        // Show current step info
        const step = this.steps[targetIndex];
        if (this.statusElement) {
            this.statusElement.innerHTML = step.description;
        }
        this._updateStats(step.stats);
    }

    setSpeed(ms) {
        this.speed = ms;
    }

    resetVisuals() {
        this.clearHighlights();
        if (this.statusElement) {
            this.statusElement.textContent = 'Ready to start...';
        }
    }
}

/**
 * Heap Monk Mode - User manually performs heap operations
 */
class HeapMonkMode {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.solver = null;
        this.expectedSwaps = [];
        this.currentSwapIndex = 0;
        this.userArray = [];
        this.selectedNode = null;
        this.isActive = false;
    }

    startLevel(array) {
        this.solver = new HeapSolver(array);
        const result = this.solver.buildMaxHeap();

        this.expectedSwaps = this.solver.getSwapSequence();
        this.currentSwapIndex = 0;
        this.userArray = [...array];
        this.selectedNode = null;
        this.isActive = true;

        // Render the initial heap
        this.visualizer.renderHeap(this.userArray);

        // Make nodes clickable
        this._attachClickListeners();

        // Update stats to show expected totals
        this._updateMonkStats();

        return {
            totalSwaps: this.expectedSwaps.length,
            finalHeap: result.heap
        };
    }

    _attachClickListeners() {
        const nodes = document.querySelectorAll('.heap-node');
        const cells = document.querySelectorAll('.array-cell');

        const clickHandler = (e) => {
            if (!this.isActive) return;

            const index = parseInt(e.currentTarget.dataset.index);
            this._handleNodeClick(index);
        };

        nodes.forEach(node => {
            node.classList.add('monk-clickable');
            node.addEventListener('click', clickHandler);
        });

        cells.forEach(cell => {
            cell.classList.add('monk-clickable');
            cell.addEventListener('click', clickHandler);
        });
    }

    _handleNodeClick(index) {
        if (this.selectedNode === null) {
            // First selection
            this.selectedNode = index;
            this._highlightSelected(index);
            this._updateStatus(`Selected node at index ${index} (value: ${this.userArray[index]}). Click another node to swap.`);
        } else if (this.selectedNode === index) {
            // Deselect
            this.selectedNode = null;
            this.visualizer.clearHighlights();
            this._updateStatus('Selection cancelled. Click a node to start a swap.');
        } else {
            // Attempt swap
            const fromIndex = this.selectedNode;
            const toIndex = index;

            this._attemptSwap(fromIndex, toIndex);
            this.selectedNode = null;
        }
    }

    _attemptSwap(fromIndex, toIndex) {
        const result = this.solver.validateSwap(
            this.userArray,
            fromIndex,
            toIndex,
            this.expectedSwaps,
            this.currentSwapIndex
        );

        this.visualizer.clearHighlights();

        if (result.valid) {
            // Perform the swap
            [this.userArray[fromIndex], this.userArray[toIndex]] =
                [this.userArray[toIndex], this.userArray[fromIndex]];

            this.currentSwapIndex++;

            // Update display
            this._updateArrayDisplay();
            this._highlightCorrect(fromIndex, toIndex);
            this._updateStatus(result.message);
            this._updateMonkStats();

            // Check if complete
            if (this.currentSwapIndex >= this.expectedSwaps.length) {
                this._onComplete();
            }
        } else {
            // Wrong swap
            this._highlightIncorrect(fromIndex, toIndex);
            this._updateStatus(result.message);
        }
    }
    _updateArrayDisplay() {
        const cells = document.querySelectorAll('.array-cell');
        cells.forEach((cell, idx) => {
            if (idx < this.userArray.length) {
                cell.querySelector('.cell-value').textContent = this.userArray[idx];
            }
        });

        const nodes = document.querySelectorAll('.heap-node');
        nodes.forEach((node) => {
            const idx = parseInt(node.dataset.index);
            if (idx < this.userArray.length) {
                node.querySelector('.node-value').textContent = this.userArray[idx];
            }
        });
    }

    _highlightSelected(index) {
        const node = document.querySelector(`.heap-node[data-index="${index}"]`);
        const cell = document.querySelector(`.array-cell[data-index="${index}"]`);

        if (node) node.classList.add('highlight-current');
        if (cell) cell.classList.add('highlight-current');
    }

    _highlightCorrect(idx1, idx2) {
        [idx1, idx2].forEach(idx => {
            const node = document.querySelector(`.heap-node[data-index="${idx}"]`);
            const cell = document.querySelector(`.array-cell[data-index="${idx}"]`);

            if (node) node.classList.add('highlight-correct');
            if (cell) cell.classList.add('highlight-correct');
        });
    }

    _highlightIncorrect(idx1, idx2) {
        [idx1, idx2].forEach(idx => {
            const node = document.querySelector(`.heap-node[data-index="${idx}"]`);
            const cell = document.querySelector(`.array-cell[data-index="${idx}"]`);

            if (node) node.classList.add('highlight-incorrect');
            if (cell) cell.classList.add('highlight-incorrect');
        });
    }

    _updateStatus(message) {
        const statusEl = document.getElementById('status-text');
        if (statusEl) {
            statusEl.innerHTML = message;
        }
    }

    _updateMonkStats() {
        const progressEl = document.getElementById('monk-progress');
        if (progressEl) {
            progressEl.textContent = `${this.currentSwapIndex} / ${this.expectedSwaps.length}`;
        }
    }

    _onComplete() {
        this.isActive = false;
        this._updateStatus('🎉 Congratulations! You have successfully built the max-heap!');

        // Highlight all nodes as correct
        const nodes = document.querySelectorAll('.heap-node');
        const cells = document.querySelectorAll('.array-cell');

        nodes.forEach(node => node.classList.add('highlight-correct'));
        cells.forEach(cell => cell.classList.add('highlight-correct'));
    }

    reset() {
        this.isActive = false;
        this.selectedNode = null;
        this.currentSwapIndex = 0;
        this.visualizer.clearHighlights();
    }
}

/**
 * Heap Builder - Allows user to build custom heap tree
 */
class HeapBuilder {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.array = [];
        this.isActive = false;
        this._attachGlobalListeners();
    }

    init(initialArray = []) {
        this.array = initialArray.length > 0 ? [...initialArray] : [10];
        this.isActive = true;
        this.render();
        this._updateStatus("Builder Mode: Click ghost node (+) to add a child. Click numbers to edit.");
    }

    render() {
        if (!this.isActive) return;
        this.visualizer.renderHeap(this.array, {
            editable: true,
            ghostIndex: this.array.length // Next available spot
        });

        // Stats update
        const countEl = document.getElementById('cell-count');
        if (countEl) countEl.textContent = this.array.length;

        // Update preview array
        this._renderArrayPreview();
    }

    addNode(value = null) {
        const val = value !== null ? value : Math.floor(Math.random() * 90) + 10;
        this.array.push(val);
        this.render();
    }

    updateNode(index, value) {
        if (index >= 0 && index < this.array.length) {
            this.array[index] = parseInt(value) || 0;
        }
    }

    clear() {
        this.array = [];
        this.render();
    }

    stop() {
        this.isActive = false;
    }

    getArray() {
        return [...this.array];
    }

    _updateStatus(msg) {
        const el = document.getElementById('status-text');
        if (el) el.textContent = msg;
    }

    _renderArrayPreview() {
        const previewEl = document.getElementById('heap-array-preview');
        if (!previewEl) return;

        previewEl.innerHTML = '';
        this.array.forEach((val, i) => {
            const tag = document.createElement('div');
            tag.className = 'heap-array-tag';
            tag.textContent = `[${i}]: ${val}`;
            previewEl.appendChild(tag);
        });
    }

    // Attach listeners once
    _attachGlobalListeners() {
        document.addEventListener('click', (e) => {
            if (!this.isActive) return;

            // Ghost Node Click
            if (e.target.closest('.heap-node.ghost')) {
                this.addNode();
            }
        });

        document.addEventListener('input', (e) => {
            if (!this.isActive) return;

            if (e.target.classList.contains('node-input')) {
                const index = parseInt(e.target.dataset.index);
                this.updateNode(index, e.target.value);
            }
        });
    }
}
