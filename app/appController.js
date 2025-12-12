import { KnapsackSolver, generateRandomKnapsack } from '../components/knapsack/solver.js';
import { LCSSolver, generateRandomLCS } from '../components/lcs/solver.js';
import { HeapSolver, generateRandomHeapArray } from '../components/heap/solver.js';
import { HeapVisualizer } from '../components/heap/visualizer.js';
import { HeapMonkMode } from '../components/heap/monkMode.js';
import { HeapBuilder } from '../components/heap/builder.js';
import { Visualizer } from '../components/common/visualizer.js';
import { TracebackManager } from '../components/traceback/tracebackManager.js';
import { MonkMode } from '../components/monk/monkMode.js';

const DEFAULT_STATE = {
    algo: 'knapsack',
    mode: 'visualize',
    data: null,
    lastSolvedDp: null,
    lastAlgoData: null,
    isSimulationComplete: false,
    heapData: null,
    heapVisualizer: null,
    heapMonkMode: null,
    heapBuilder: null,
    isHeapBuilderActive: false,
    heapOperation: 'build',
    hasCustomHeap: false
};

export class AppController {
    constructor() {
        this.state = { ...DEFAULT_STATE };
        this.els = this._queryDom();
        this.visualizer = new Visualizer('grid-container', 'status-text');
        this.tracebackManager = new TracebackManager(this.visualizer);
        this.monkMode = new MonkMode(this.visualizer);
        this.heapVisualizer = null;
        this.heapMonkMode = null;
        this.heapBuilder = null;
    }

    init() {
        this._populateRandomData();
        this._bindTabEvents();
        this._bindRandomButton();
        this._bindStartButton();
        this._bindModeToggle();
        this._bindPlaybackControls();
        this._bindTracebackButton();
        this._bindSpeedControl();
        this._bindKeyboardShortcuts();
        this._bindHeapBuilderControls();
        this._bindHeapOperationButtons();
    }

    // ===================== DOM & Event Binding =====================
    _queryDom() {
        return {
            tabBtns: document.querySelectorAll('.tab-btn'),
            knapsackConfig: document.getElementById('knapsack-config'),
            lcsConfig: document.getElementById('lcs-config'),
            heapConfig: document.getElementById('heap-config'),
            itemsPreview: document.getElementById('items-preview'),
            heapArrayPreview: document.getElementById('heap-array-preview'),
            startBtn: document.getElementById('start-btn'),
            randomBtn: document.getElementById('random-btn'),
            inputCap: document.getElementById('capacity-input'),
            inputCount: document.getElementById('item-count-input'),
            inputStrA: document.getElementById('str-a-input'),
            inputStrB: document.getElementById('str-b-input'),
            inputHeapSize: document.getElementById('heap-size-input'),
            inputHeapMaxValue: document.getElementById('heap-max-value'),
            playBtn: document.getElementById('play-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            nextBtn: document.getElementById('next-step-btn'),
            prevBtn: document.getElementById('prev-step-btn'),
            tracebackBtn: document.getElementById('traceback-btn'),
            speedRange: document.getElementById('speed-range'),
            speedLabel: document.getElementById('speed-label'),
            pillBtns: document.querySelectorAll('.pill-btn'),
            gridTitle: document.getElementById('grid-title'),
            cellCountLabel: document.getElementById('cell-count'),
            legendList: document.getElementById('legend-list'),
            vizCard: document.querySelector('.viz-card'),
            customHeapBtn: document.getElementById('custom-heap-btn'),
            builderControls: document.getElementById('builder-controls'),
            builderInstructions: document.getElementById('builder-instructions'),
            addNodeBtn: document.getElementById('add-node-btn'),
            clearHeapBtn: document.getElementById('clear-heap-btn'),
            newNodeVal: document.getElementById('new-node-val'),
            heapOpBtns: document.querySelectorAll('.heap-op-btn'),
            insertValueContainer: document.getElementById('insert-value-container'),
            insertValueInput: document.getElementById('insert-value-input')
        };
    }

    _bindTabEvents() {
        this.els.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this._onTabChange(btn));
        });
    }

    _bindRandomButton() {
        this.els.randomBtn.addEventListener('click', () => {
            // Clear custom heap flag when generating random data
            if (this.state.algo === 'heap') {
                this.state.hasCustomHeap = false;
            }
            this._populateRandomData();
            if (this.state.algo === 'knapsack') this._renderItemsPreview();
            if (this.state.algo === 'heap') this._renderHeapArrayPreview();
            this._resetSimulationState();
            this._resetHeapStats();
            this.visualizer.resetVisuals();
            this.visualizer.container.innerHTML = '';
        });
    }

    _bindStartButton() {
        this.els.startBtn.addEventListener('click', () => this._runSimulation());
    }

    _bindHeapOperationButtons() {
        this.els.heapOpBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                this.els.heapOpBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.heapOperation = btn.dataset.operation;
                
                // Show/hide insert value input
                if (this.state.heapOperation === 'insert') {
                    this.els.insertValueContainer?.classList.remove('hidden');
                } else {
                    this.els.insertValueContainer?.classList.add('hidden');
                }
            });
        });
    }

    _bindModeToggle() {
        this.els.pillBtns.forEach(btn => {
            btn.addEventListener('click', () => this._handleModeToggle(btn));
        });
    }

    _bindPlaybackControls() {
        this.els.playBtn.addEventListener('click', () => this._play());
        this.els.pauseBtn.addEventListener('click', () => this._pause());
        this.els.nextBtn.addEventListener('click', () => this._stepForward());
        this.els.prevBtn.addEventListener('click', () => this._stepBackward());
    }

    _bindTracebackButton() {
        this.els.tracebackBtn.addEventListener('click', () => this._startTraceback());
    }

    _bindSpeedControl() {
        this.els.speedRange.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            this.els.speedLabel.textContent = `${val}ms`;
            this.visualizer.setSpeed(val);
            this.tracebackManager.setSpeed(val);
            this.heapVisualizer?.setSpeed(val);
        });
    }

    _bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.state.algo === 'heap' ? this._toggleHeapPlay() : this._toggleDpPlay();
            }
            if (e.code === 'ArrowRight') this.state.algo === 'heap' ? this.heapVisualizer?.next() : this.visualizer.next();
            if (e.code === 'ArrowLeft') this.state.algo === 'heap' ? this.heapVisualizer?.prev() : this.visualizer.prev();
            if (e.code === 'KeyR') this._runSimulation();
        });
    }

    _bindHeapBuilderControls() {
        if (!this.els.customHeapBtn) return;
        this.els.customHeapBtn.addEventListener('click', () => this._toggleHeapBuilder());
        this.els.addNodeBtn?.addEventListener('click', () => {
            if (this.heapBuilder) {
                const val = parseInt(this.els.newNodeVal.value, 10);
                this.heapBuilder.addNode(!isNaN(val) ? val : null);
                this.els.newNodeVal.value = '';
            }
        });
        this.els.clearHeapBtn?.addEventListener('click', () => this.heapBuilder?.clear());
    }

    // ===================== Event Handlers =====================
    _onTabChange(btn) {
        this.els.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.algo = btn.dataset.algo;
        this._toggleConfigPanels();
        this._resetSimulationState();
        this._resetHeapStats();
        this.tracebackManager.stopTraceback();
        this.visualizer.resetVisuals();
        this.visualizer.container.innerHTML = '';
        // Don't repopulate if we have custom heap data
        if (!(this.state.algo === 'heap' && this.state.hasCustomHeap)) {
            this._populateRandomData();
        }
    }

    _handleModeToggle(btn) {
        this.els.pillBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.mode = btn.dataset.mode;
        const controls = document.querySelector('.controls-grid');
        if (this.state.mode === 'monk') {
            controls.style.opacity = '0.5';
            controls.style.pointerEvents = 'none';
            this.els.startBtn.textContent = 'Start Practice';
        } else {
            controls.style.opacity = '1';
            controls.style.pointerEvents = 'all';
            this.els.startBtn.textContent = 'Start / Restart';
        }
        const hasData = this.state.algo === 'heap' ? this.state.heapData : this.state.data;
        if (hasData) this._runSimulation();
    }

    _toggleConfigPanels() {
        this.els.knapsackConfig.classList.add('hidden');
        this.els.lcsConfig.classList.add('hidden');
        this.els.heapConfig.classList.add('hidden');
        const heapLegendItems = document.querySelectorAll('.heap-legend');
        const dpLegendItems = document.querySelectorAll('#legend-list > li:not(.heap-legend)');
        if (this.state.algo === 'knapsack') {
            this.els.knapsackConfig.classList.remove('hidden');
            this.els.gridTitle.textContent = 'Knapsack Table';
            this._renderItemsPreview();
            this.els.vizCard.classList.remove('heap-mode');
            heapLegendItems.forEach(li => li.classList.add('hidden'));
            dpLegendItems.forEach(li => li.classList.remove('hidden'));
            this.els.tracebackBtn.classList.remove('hidden');
        } else if (this.state.algo === 'lcs') {
            this.els.lcsConfig.classList.remove('hidden');
            this.els.gridTitle.textContent = 'LCS Table';
            this.els.vizCard.classList.remove('heap-mode');
            heapLegendItems.forEach(li => li.classList.add('hidden'));
            dpLegendItems.forEach(li => li.classList.remove('hidden'));
            this.els.tracebackBtn.classList.remove('hidden');
        } else {
            this.els.heapConfig.classList.remove('hidden');
            this.els.gridTitle.textContent = 'Heap Visualization';
            this.els.vizCard.classList.add('heap-mode');
            heapLegendItems.forEach(li => li.classList.remove('hidden'));
            dpLegendItems.forEach(li => li.classList.add('hidden'));
            this.els.tracebackBtn.classList.add('hidden');
            this._renderHeapArrayPreview();
        }
    }

    // ===================== Simulation =====================
    _runSimulation() {
        const inputData = this._getDataFromInputs();
        this._resetSimulationState();
        if (this.state.algo !== 'heap') {
            this.els.tracebackBtn.disabled = true;
            this.tracebackManager.stopTraceback();
        }
        if (this.state.algo === 'heap') {
            this._runHeapSimulation(inputData);
            return;
        }
        if (this.state.mode === 'monk') {
            this._startMonkMode(inputData);
        } else {
            this._startVisualization(this.state.algo, inputData);
        }
    }

    _startVisualization(algo, data) {
        const { solver, rowHeaders, colHeaders } = this._buildSolver(algo, data);
        const result = solver.solve();
        this.state.lastSolvedDp = result.dp;
        this.state.lastAlgoData = data;
        this.visualizer.renderGrid(rowHeaders.length, colHeaders.length, rowHeaders, colHeaders, false);
        this.els.cellCountLabel.textContent = (rowHeaders.length * colHeaders.length);
        this.visualizer.loadSteps(result.steps);
        this.els.tracebackBtn.disabled = false;
        this.state.isSimulationComplete = true;
        this._updateStatus('Ready. Press Play or use Traceback after completing.');
    }

    _startMonkMode(inputData) {
        const solver = this.state.algo === 'knapsack'
            ? new KnapsackSolver(inputData.capacity, inputData.weights, inputData.values)
            : new LCSSolver(inputData.s1, inputData.s2);
        const result = solver.solve();
        this.state.lastSolvedDp = result.dp;
        this.state.lastAlgoData = inputData;
        this.monkMode.startLevel(this.state.algo, inputData);
        this._updateStatus('In Monk Mode. Click a cell and type the correct value.');
        setTimeout(() => {
            this.els.tracebackBtn.disabled = false;
            this.state.isSimulationComplete = true;
        }, 500);
    }

    _runHeapSimulation(array) {
        if (!this.heapVisualizer) this.heapVisualizer = new HeapVisualizer('grid-container', 'status-text');
        this._resetHeapStats();
        const monkProgressContainer = document.getElementById('monk-progress-container');
        const operation = this.state.heapOperation || 'build';
        
        // Get operation parameters
        let operationData = { array, operation };
        if (operation === 'insert') {
            operationData.insertValue = parseInt(this.els.insertValueInput?.value || 25, 10);
        }
        
        if (this.state.mode === 'monk') {
            if (!this.heapMonkMode) this.heapMonkMode = new HeapMonkMode(this.heapVisualizer);
            else this.heapMonkMode.reset();
            const result = this.heapMonkMode.startLevel(operationData);
            monkProgressContainer?.classList.remove('hidden');
            
            let statusMsg = '';
            if (operation === 'build') {
                statusMsg = `Monk Mode: Build the max-heap by clicking nodes to swap. ${result.totalSwaps} swaps needed.`;
            } else if (operation === 'extract') {
                statusMsg = `Monk Mode: Extract maximum element. ${result.totalSwaps} swaps needed.`;
            } else if (operation === 'insert') {
                statusMsg = `Monk Mode: Insert ${operationData.insertValue} into heap. ${result.totalSwaps} swaps needed.`;
            }
            
            this._updateStatus(statusMsg);
            this.els.cellCountLabel.textContent = result.finalArray?.length || array.length;
            this.state.isSimulationComplete = true;
        } else {
            if (this.heapMonkMode) this.heapMonkMode.reset();
            monkProgressContainer?.classList.add('hidden');
            const solver = new HeapSolver(array, operation);
            let result;
            
            if (operation === 'build') {
                result = solver.buildMaxHeap();
            } else if (operation === 'extract') {
                result = solver.extractMax();
            } else if (operation === 'insert') {
                result = solver.insertElement(operationData.insertValue);
            }
            
            this.heapVisualizer.renderHeap(result.heap);
            this.heapVisualizer.loadSteps(result.steps);
            this.els.cellCountLabel.textContent = result.heap.length;
            this.state.isSimulationComplete = true;
            
            let statusMsg = '';
            if (operation === 'build') {
                statusMsg = `Ready. Press Play to visualize Build-Max-Heap. Total steps: ${result.steps.length}`;
            } else if (operation === 'extract') {
                statusMsg = `Ready. Press Play to visualize Extract-Max (removed: ${result.extractedValue}). Steps: ${result.steps.length}`;
            } else if (operation === 'insert') {
                statusMsg = `Ready. Press Play to visualize Insert (${operationData.insertValue}). Steps: ${result.steps.length}`;
            }
            
            this._updateStatus(statusMsg);
        }
    }

    _startTraceback() {
        if (!this.state.lastSolvedDp || !this.state.lastAlgoData) {
            this._updateStatus('Please complete the simulation first before tracing back.');
            return;
        }
        this.tracebackManager.stopTraceback();
        this.tracebackManager.init(this.state.algo, this.state.lastSolvedDp, this.state.lastAlgoData, this.state.mode === 'monk');
        this.tracebackManager.startTraceback();
    }

    // ===================== Data Management =====================
    _populateRandomData() {
        if (this.state.algo === 'knapsack') {
            let cap = parseInt(this.els.inputCap.value, 10) || 10;
            let count = parseInt(this.els.inputCount.value, 10) || 5;
            cap = Math.min(Math.max(cap, 5), 20);
            count = Math.min(Math.max(count, 8), 12);
            const data = generateRandomKnapsack(cap, count);
            this.state.data = data;
            this.els.inputCap.value = data.capacity;
            this.els.inputCount.value = data.weights.length;
            this._renderItemsPreview();
        } else if (this.state.algo === 'lcs') {
            const data = generateRandomLCS();
            this.state.data = data;
            this.els.inputStrA.value = data.s1;
            this.els.inputStrB.value = data.s2;
        } else {
            let size = parseInt(this.els.inputHeapSize.value, 10) || 10;
            let maxValue = parseInt(this.els.inputHeapMaxValue.value, 10) || 50;
            size = Math.min(Math.max(size, 5), 15);
            maxValue = Math.min(Math.max(maxValue, 10), 100);
            const array = generateRandomHeapArray(size, maxValue);
            this.state.heapData = array;
            this.els.inputHeapSize.value = size;
            this.els.inputHeapMaxValue.value = maxValue;
            this._renderHeapArrayPreview();
        }
    }

    _getDataFromInputs() {
        if (this.state.algo === 'knapsack') {
            const cap = parseInt(this.els.inputCap.value, 10);
            const count = parseInt(this.els.inputCount.value, 10);
            if (this.state.data && this.state.data.capacity === cap && this.state.data.weights.length === count) return this.state.data;
            const data = generateRandomKnapsack(cap, count);
            this.state.data = data;
            this._renderItemsPreview();
            return data;
        }
        if (this.state.algo === 'lcs') {
            const s1 = this.els.inputStrA.value;
            const s2 = this.els.inputStrB.value;
            return { s1, s2 };
        }
        // If we have custom heap data, always use it
        if (this.state.hasCustomHeap && this.state.heapData) {
            return this.state.heapData;
        }
        let size = parseInt(this.els.inputHeapSize.value, 10) || 10;
        let maxValue = parseInt(this.els.inputHeapMaxValue.value, 10) || 50;
        if (this.state.heapData && this.state.heapData.length === size) return this.state.heapData;
        const array = generateRandomHeapArray(size, maxValue);
        this.state.heapData = array;
        this._renderHeapArrayPreview();
        return array;
    }

    _buildSolver(algo, data) {
        if (algo === 'knapsack') {
            const solver = new KnapsackSolver(data.capacity, data.weights, data.values);
            const colHeaders = Array.from({ length: data.capacity + 1 }, (_, i) => i);
            const rowHeaders = ['-'];
            data.weights.forEach((w, i) => rowHeaders.push(`I${i + 1} (${w}kg)`));
            return { solver, rowHeaders, colHeaders };
        }
        const solver = new LCSSolver(data.s1, data.s2);
        const colHeaders = ['-', ...data.s2.split('')];
        const rowHeaders = ['-', ...data.s1.split('')];
        return { solver, rowHeaders, colHeaders };
    }

    // ===================== UI helpers =====================
    _renderItemsPreview() {
        if (!this.state.data?.weights) return;
        this.els.itemsPreview.innerHTML = '';
        this.state.data.weights.forEach((w, i) => {
            const v = this.state.data.values[i];
            const tag = document.createElement('div');
            tag.className = 'item-tag';
            tag.textContent = `#${i + 1} [${w}kg, $${v}]`;
            this.els.itemsPreview.appendChild(tag);
        });
    }

    _renderHeapArrayPreview() {
        if (!this.state.heapData || !this.els.heapArrayPreview) return;
        this.els.heapArrayPreview.innerHTML = '';
        this.state.heapData.forEach((val, i) => {
            const tag = document.createElement('div');
            tag.className = 'heap-array-tag';
            tag.textContent = `[${i}]: ${val}`;
            this.els.heapArrayPreview.appendChild(tag);
        });
    }

    _resetHeapStats() {
        const heapifyEl = document.getElementById('heapify-count');
        const swapEl = document.getElementById('swap-count');
        const recursiveEl = document.getElementById('recursive-count');
        const progressEl = document.getElementById('monk-progress');
        if (heapifyEl) heapifyEl.textContent = '0';
        if (swapEl) swapEl.textContent = '0';
        if (recursiveEl) recursiveEl.textContent = '0';
        if (progressEl) progressEl.textContent = '0 / 0';
    }

    _resetSimulationState() {
        this.state.data = null;
        this.state.lastSolvedDp = null;
        this.state.lastAlgoData = null;
        // Don't reset heapData if it's custom built
        if (!this.state.hasCustomHeap) {
            this.state.heapData = null;
        }
        this.state.isSimulationComplete = false;
        this.els.tracebackBtn.disabled = true;
        this.tracebackManager.stopTraceback();
    }

    _play() {
        if (this.state.algo === 'heap' && this.heapVisualizer) this.heapVisualizer.play();
        else this.visualizer.play();
    }

    _pause() {
        if (this.state.algo === 'heap' && this.heapVisualizer) this.heapVisualizer.pause();
        else this.visualizer.pause();
    }

    _stepForward() {
        if (this.state.algo === 'heap' && this.heapVisualizer) this.heapVisualizer.next();
        else this.visualizer.next();
    }

    _stepBackward() {
        if (this.state.algo === 'heap' && this.heapVisualizer) this.heapVisualizer.prev();
        else this.visualizer.prev();
    }

    _toggleHeapPlay() {
        if (!this.heapVisualizer) return;
        if (this.heapVisualizer.isPlaying) this.heapVisualizer.pause();
        else this.heapVisualizer.play();
    }

    _toggleDpPlay() {
        if (this.visualizer.isPlaying) this.visualizer.pause();
        else this.visualizer.play();
    }

    _toggleHeapBuilder() {
        this.state.isHeapBuilderActive = !this.state.isHeapBuilderActive;
        if (this.state.isHeapBuilderActive) {
            this._enableBuilderMode();
        } else {
            this._disableBuilderMode();
        }
    }

    _enableBuilderMode() {
        this.els.builderControls.classList.remove('hidden');
        this.els.builderInstructions.classList.remove('hidden');
        this.els.customHeapBtn.textContent = '✅ Done Building';
        this.els.customHeapBtn.classList.remove('secondary');
        this.els.customHeapBtn.classList.add('success');
        if (!this.heapVisualizer) this.heapVisualizer = new HeapVisualizer('grid-container', 'status-text');
        this.heapBuilder = new HeapBuilder(this.heapVisualizer);
        this.heapBuilder.init(this.state.heapData || []);
        this.els.startBtn.disabled = true;
        this.els.randomBtn.disabled = true;
    }

    _disableBuilderMode() {
        this.els.builderControls.classList.add('hidden');
        this.els.builderInstructions.classList.add('hidden');
        this.els.customHeapBtn.textContent = '✏️ Custom Build Mode';
        this.els.customHeapBtn.classList.remove('success');
        this.state.heapData = this.heapBuilder?.getArray();
        this.state.hasCustomHeap = true;
        // Update the size input to match custom heap
        if (this.state.heapData && this.els.inputHeapSize) {
            this.els.inputHeapSize.value = this.state.heapData.length;
        }
        this.heapBuilder?.stop();
        this.els.startBtn.disabled = false;
        this.els.randomBtn.disabled = false;
        this._renderHeapArrayPreview();
        this._updateStatus('Custom heap saved. Press "Start" to visualize.');
        if (!this.heapVisualizer) this.heapVisualizer = new HeapVisualizer('grid-container', 'status-text');
        this.heapVisualizer.renderHeap(this.state.heapData);
    }

    _updateStatus(message) {
        const statusEl = document.getElementById('status-text');
        if (statusEl) statusEl.textContent = message;
    }
}
