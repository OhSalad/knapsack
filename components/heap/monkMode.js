import { HeapSolver } from './solver.js';

export class HeapMonkMode {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.solver = null;
        this.expectedSwaps = [];
        this.currentSwapIndex = 0;
        this.userArray = [];
        this.selectedNode = null;
        this.isActive = false;
        this.clickHandlers = new Map();
        this.operation = 'build';
        this.userStats = {
            heapifyCalls: 0,
            swapCount: 0,
            recursiveCalls: 0
        };
    }

    startLevel(operationData) {
        this._removeClickListeners();
        
        const { array, operation, insertValue } = operationData;
        this.operation = operation || 'build';
        this.userStats = { heapifyCalls: 0, swapCount: 0, recursiveCalls: 0 };
        
        this.solver = new HeapSolver(array, operation);
        let result;
        
        if (this.operation === 'build') {
            result = this.solver.buildMaxHeap();
            this.userArray = [...array];
        } else if (this.operation === 'extract') {
            result = this.solver.extractMax();
            // For extract in monk mode, start with the built heap, then user performs extract
            // Build the heap first for the user
            const builder = new HeapSolver(array, 'build');
            builder.buildMaxHeap();
            this.userArray = [...builder.array];
            
            // Now set up for extract - swap first and last, pop
            if (this.userArray.length > 0) {
                this.userArray[0] = this.userArray[this.userArray.length - 1];
                this.userArray.pop();
            }
        } else if (this.operation === 'insert') {
            result = this.solver.insertElement(insertValue);
            // For insert in monk mode, start with the built heap
            const builder = new HeapSolver(array, 'build');
            builder.buildMaxHeap();
            this.userArray = [...builder.array];
            // Add the new element at the end
            this.userArray.push(insertValue);
        }
        
        // Get only the swaps for the actual operation (not the pre-build)
        const allSwaps = this.solver.getSwapSequence();
        if (this.operation === 'extract' || this.operation === 'insert') {
            // Filter to get only swaps from the actual operation (after pre-build)
            this.expectedSwaps = allSwaps.filter((swap, idx) => {
                const step = this.solver.steps.find(s => 
                    s.type === 'swap' && s.from === swap.from && s.to === swap.to
                );
                return step && (
                    step.type.includes('bubble') || 
                    this.solver.steps.indexOf(step) > this.solver.steps.findIndex(s => 
                        s.type === 'pre-extract-complete' || s.type === 'pre-insert-complete'
                    )
                );
            });
            
            // Simpler approach: just get swaps after the operation starts
            const operationStartIndex = this.solver.steps.findIndex(s => 
                s.type === 'extract-heapify-start' || s.type === 'insert-add'
            );
            this.expectedSwaps = [];
            for (let i = operationStartIndex; i < this.solver.steps.length; i++) {
                const step = this.solver.steps[i];
                if (step.type === 'swap' || step.type === 'bubble-swap') {
                    this.expectedSwaps.push({
                        from: step.from,
                        to: step.to,
                        fromValue: step.fromValue,
                        toValue: step.toValue
                    });
                }
            }
        } else {
            this.expectedSwaps = allSwaps;
        }
        
        this.currentSwapIndex = 0;
        this.selectedNode = null;
        this.isActive = true;
        this.visualizer.renderHeap(this.userArray);
        this._attachClickListeners();
        this._updateMonkStats();
        this._updateHeapStats();
        
        return { 
            totalSwaps: this.expectedSwaps.length, 
            finalHeap: result.heap,
            finalArray: this.userArray
        };
    }

    reset() {
        this.isActive = false;
        this.selectedNode = null;
        this.currentSwapIndex = 0;
        this.userStats = { heapifyCalls: 0, swapCount: 0, recursiveCalls: 0 };
        this._removeClickListeners();
        this.visualizer.clearHighlights();
    }

    _removeClickListeners() {
        this.clickHandlers.forEach((handler, element) => {
            element.removeEventListener('click', handler);
            element.classList.remove('monk-clickable');
        });
        this.clickHandlers.clear();
    }

    _attachClickListeners() {
        const nodes = document.querySelectorAll('.heap-node');
        const cells = document.querySelectorAll('.array-cell');
        
        nodes.forEach(node => {
            const handler = (e) => {
                if (!this.isActive) return;
                const index = parseInt(e.currentTarget.dataset.index, 10);
                this._handleNodeClick(index);
            };
            node.classList.add('monk-clickable');
            node.addEventListener('click', handler);
            this.clickHandlers.set(node, handler);
        });
        
        cells.forEach(cell => {
            const handler = (e) => {
                if (!this.isActive) return;
                const index = parseInt(e.currentTarget.dataset.index, 10);
                this._handleNodeClick(index);
            };
            cell.classList.add('monk-clickable');
            cell.addEventListener('click', handler);
            this.clickHandlers.set(cell, handler);
        });
    }

    _handleNodeClick(index) {
        if (this.selectedNode === null) {
            this.selectedNode = index;
            this._highlightSelected(index);
            this._updateStatus(`Selected node at index ${index} (value: ${this.userArray[index]}). Click another node to swap.`);
            return;
        }
        if (this.selectedNode === index) {
            this.selectedNode = null;
            this.visualizer.clearHighlights();
            this._updateStatus('Selection cancelled. Click a node to start a swap.');
            return;
        }
        this._attemptSwap(this.selectedNode, index);
        this.selectedNode = null;
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
            [this.userArray[fromIndex], this.userArray[toIndex]] = [this.userArray[toIndex], this.userArray[fromIndex]];
            this.currentSwapIndex++;
            this.userStats.swapCount++;
            
            // Update heapify and recursive calls based on the swap context
            // For build-heap, each swap is part of a heapify operation
            if (this.operation === 'build') {
                // Estimate heapify calls - in build heap, we heapify from bottom up
                // For simplicity, increment heapify on each swap (can be refined)
                if (this.currentSwapIndex === 1 || toIndex < fromIndex) {
                    this.userStats.heapifyCalls++;
                }
                if (toIndex !== fromIndex && toIndex > 0) {
                    this.userStats.recursiveCalls++;
                }
            } else if (this.operation === 'extract' || this.operation === 'insert') {
                // For extract/insert, count heapify calls when working on different subtrees
                if (this.currentSwapIndex === 1) {
                    this.userStats.heapifyCalls++;
                } else {
                    this.userStats.recursiveCalls++;
                }
            }
            
            this._updateArrayDisplay();
            this._highlightCorrect(fromIndex, toIndex);
            this._updateStatus(result.message);
            this._updateMonkStats();
            this._updateHeapStats();
            if (this.currentSwapIndex >= this.expectedSwaps.length) this._onComplete();
        } else {
            this._highlightIncorrect(fromIndex, toIndex);
            this._updateStatus(result.message);
        }
    }

    _updateArrayDisplay() {
        // Re-render if the size changed (shouldn't happen during swaps, but safety check)
        const existingCells = document.querySelectorAll('.array-cell');
        if (existingCells.length !== this.userArray.length) {
            this._removeClickListeners();
            this.visualizer.renderHeap(this.userArray);
            this._attachClickListeners();
            return;
        }
        
        document.querySelectorAll('.array-cell').forEach((cell, idx) => {
            if (idx < this.userArray.length) {
                cell.querySelector('.cell-value').textContent = this.userArray[idx];
            }
        });
        document.querySelectorAll('.heap-node').forEach(node => {
            const idx = parseInt(node.dataset.index, 10);
            if (idx < this.userArray.length) {
                const valueSpan = node.querySelector('.node-value');
                if (valueSpan) valueSpan.textContent = this.userArray[idx];
            }
        });
    }

    _highlightSelected(index) {
        this._highlightPair([index], 'current');
    }

    _highlightCorrect(idx1, idx2) {
        this._highlightPair([idx1, idx2], 'correct');
    }

    _highlightIncorrect(idx1, idx2) {
        this._highlightPair([idx1, idx2], 'incorrect');
    }

    _highlightPair(indices, cls) {
        indices.forEach(idx => {
            const node = document.querySelector(`.heap-node[data-index="${idx}"]`);
            const cell = document.querySelector(`.array-cell[data-index="${idx}"]`);
            node?.classList.add(`highlight-${cls}`);
            cell?.classList.add(`highlight-${cls}`);
        });
    }

    _updateStatus(message) {
        const statusEl = document.getElementById('status-text');
        if (statusEl) statusEl.innerHTML = message;
    }

    _updateMonkStats() {
        const progressEl = document.getElementById('monk-progress');
        if (progressEl) progressEl.textContent = `${this.currentSwapIndex} / ${this.expectedSwaps.length}`;
    }

    _updateHeapStats() {
        const heapifyEl = document.getElementById('heapify-count');
        const swapEl = document.getElementById('swap-count');
        const recursiveEl = document.getElementById('recursive-count');
        
        if (heapifyEl) heapifyEl.textContent = this.userStats.heapifyCalls;
        if (swapEl) swapEl.textContent = this.userStats.swapCount;
        if (recursiveEl) recursiveEl.textContent = this.userStats.recursiveCalls;
    }

    _onComplete() {
        this.isActive = false;
        let message = '🎉 Congratulations! ';
        if (this.operation === 'build') {
            message += 'You have successfully built the max-heap!';
        } else if (this.operation === 'extract') {
            message += 'You have successfully extracted the maximum element!';
        } else if (this.operation === 'insert') {
            message += 'You have successfully inserted the element into the heap!';
        }
        this._updateStatus(message);
        document.querySelectorAll('.heap-node, .array-cell').forEach(el => el.classList.add('highlight-correct'));
    }
}
