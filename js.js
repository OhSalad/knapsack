document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const state = {
        algo: 'knapsack', // 'knapsack' | 'lcs' | 'heap'
        mode: 'visualize', // 'visualize' | 'monk'
        data: null,
        lastSolvedDp: null,
        lastAlgoData: null,
        isSimulationComplete: false,
        // Heap-specific state
        heapData: null,
        heapVisualizer: null,
        heapMonkMode: null,
        heapBuilder: null,
        isHeapBuilderActive: false // Track if we are in builder mode
    };

    // --- Components ---
    const visualizer = new Visualizer('grid-container', 'status-text');
    const monkMode = new MonkMode(visualizer);
    const tracebackManager = new TracebackManager(visualizer);

    // --- DOM Elements ---
    const els = {
        tabBtns: document.querySelectorAll('.tab-btn'),
        knapsackConfig: document.getElementById('knapsack-config'),
        lcsConfig: document.getElementById('lcs-config'),
        heapConfig: document.getElementById('heap-config'),
        itemsPreview: document.getElementById('items-preview'),
        heapArrayPreview: document.getElementById('heap-array-preview'),

        startBtn: document.getElementById('start-btn'),
        randomBtn: document.getElementById('random-btn'),

        // Inputs
        inputCap: document.getElementById('capacity-input'),
        inputCount: document.getElementById('item-count-input'),
        inputStrA: document.getElementById('str-a-input'),
        inputStrB: document.getElementById('str-b-input'),
        inputHeapSize: document.getElementById('heap-size-input'),
        inputHeapMaxValue: document.getElementById('heap-max-value'),

        // Controls
        playBtn: document.getElementById('play-btn'),
        pauseBtn: document.getElementById('pause-btn'),
        nextBtn: document.getElementById('next-step-btn'),
        prevBtn: document.getElementById('prev-step-btn'),
        tracebackBtn: document.getElementById('traceback-btn'),
        speedRange: document.getElementById('speed-range'),
        speedLabel: document.getElementById('speed-label'),

        // Mode
        pillBtns: document.querySelectorAll('.pill-btn'),

        // Status/Grid Headers
        gridTitle: document.getElementById('grid-title'),
        cellCountLabel: document.getElementById('cell-count'),

        // Legend
        legendList: document.getElementById('legend-list'),

        // Viz card
        vizCard: document.querySelector('.viz-card')
    };

    // --- Initialization ---
    populateRandomData();
    // Do not auto-run, just prep data

    // --- Event Listeners ---

    // Tabs
    els.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            els.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const algo = btn.dataset.algo;
            state.algo = algo;

            // Hide all config panels first
            els.knapsackConfig.classList.add('hidden');
            els.lcsConfig.classList.add('hidden');
            els.heapConfig.classList.add('hidden');

            // Hide/show heap-specific legend items
            const heapLegendItems = document.querySelectorAll('.heap-legend');
            const dpLegendItems = document.querySelectorAll('#legend-list > li:not(.heap-legend)');

            if (algo === 'knapsack') {
                els.knapsackConfig.classList.remove('hidden');
                els.gridTitle.textContent = "Knapsack Table";
                renderItemsPreview();
                els.vizCard.classList.remove('heap-mode');
                heapLegendItems.forEach(li => li.classList.add('hidden'));
                dpLegendItems.forEach(li => li.classList.remove('hidden'));
                els.tracebackBtn.classList.remove('hidden');
            } else if (algo === 'lcs') {
                els.lcsConfig.classList.remove('hidden');
                els.gridTitle.textContent = "LCS Table";
                els.vizCard.classList.remove('heap-mode');
                heapLegendItems.forEach(li => li.classList.add('hidden'));
                dpLegendItems.forEach(li => li.classList.remove('hidden'));
                els.tracebackBtn.classList.remove('hidden');
            } else if (algo === 'heap') {
                els.heapConfig.classList.remove('hidden');
                els.gridTitle.textContent = "Heap Visualization";
                els.vizCard.classList.add('heap-mode');
                heapLegendItems.forEach(li => li.classList.remove('hidden'));
                dpLegendItems.forEach(li => li.classList.add('hidden'));
                els.tracebackBtn.classList.add('hidden');
                renderHeapArrayPreview();
            }

            // Clear states
            state.data = null;
            state.lastSolvedDp = null;
            state.lastAlgoData = null;
            state.heapData = null;
            state.isSimulationComplete = false;
            els.tracebackBtn.disabled = true;
            tracebackManager.stopTraceback();
            visualizer.resetVisuals();
            visualizer.container.innerHTML = '';

            // Reset heap stats
            resetHeapStats();
        });
    });

    // Random Button
    els.randomBtn.addEventListener('click', () => {
        populateRandomData();

        // Render appropriate preview
        if (state.algo === 'knapsack') {
            renderItemsPreview();
        } else if (state.algo === 'heap') {
            renderHeapArrayPreview();
        }

        // Clear states
        state.lastSolvedDp = null;
        state.lastAlgoData = null;
        state.heapData = null;
        state.isSimulationComplete = false;
        els.tracebackBtn.disabled = true;
        tracebackManager.stopTraceback();
        visualizer.resetVisuals();
        visualizer.container.innerHTML = '';
        state.data = null;

        // Reset heap stats
        resetHeapStats();
    });

    // Start Button
    els.startBtn.addEventListener('click', () => {
        runSimulation();
    });

    // Mode Toggle
    els.pillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            els.pillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.mode = btn.dataset.mode;

            if (state.mode === 'monk') {
                document.querySelector('.controls-grid').style.opacity = '0.5';
                document.querySelector('.controls-grid').style.pointerEvents = 'none';
                els.startBtn.textContent = 'Start Practice';
            } else {
                document.querySelector('.controls-grid').style.opacity = '1';
                document.querySelector('.controls-grid').style.pointerEvents = 'all';
                els.startBtn.textContent = 'Start / Restart';
            }
            // Re-run to reset grid interactive state
            if (state.data) runSimulation();
        });
    });

    // Controls - work with both visualizers
    els.playBtn.addEventListener('click', () => {
        if (state.algo === 'heap' && state.heapVisualizer) {
            state.heapVisualizer.play();
        } else {
            visualizer.play();
        }
    });

    els.pauseBtn.addEventListener('click', () => {
        if (state.algo === 'heap' && state.heapVisualizer) {
            state.heapVisualizer.pause();
        } else {
            visualizer.pause();
        }
    });

    els.nextBtn.addEventListener('click', () => {
        if (state.algo === 'heap' && state.heapVisualizer) {
            state.heapVisualizer.next();
        } else {
            visualizer.next();
        }
    });

    els.prevBtn.addEventListener('click', () => {
        if (state.algo === 'heap' && state.heapVisualizer) {
            state.heapVisualizer.prev();
        } else {
            visualizer.prev();
        }
    });

    // Traceback Button
    els.tracebackBtn.addEventListener('click', () => {
        if (!state.lastSolvedDp || !state.lastAlgoData) {
            document.getElementById('status-text').textContent = 'Please complete the simulation first before tracing back.';
            return;
        }

        // Stop any ongoing traceback
        tracebackManager.stopTraceback();

        // Initialize traceback with the solved DP table
        tracebackManager.init(
            state.algo,
            state.lastSolvedDp,
            state.lastAlgoData,
            state.mode === 'monk'
        );

        // Start traceback
        tracebackManager.startTraceback();
    });

    els.speedRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        els.speedLabel.textContent = `${val}ms`;
        visualizer.setSpeed(val);
        tracebackManager.setSpeed(val);

        // Also update heap visualizer speed
        if (state.heapVisualizer) {
            state.heapVisualizer.setSpeed(val);
        }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (state.algo === 'heap' && state.heapVisualizer) {
                if (state.heapVisualizer.isPlaying) state.heapVisualizer.pause();
                else state.heapVisualizer.play();
            } else {
                if (visualizer.isPlaying) visualizer.pause();
                else visualizer.play();
            }
        } else if (e.code === 'ArrowRight') {
            if (state.algo === 'heap' && state.heapVisualizer) {
                state.heapVisualizer.next();
            } else {
                visualizer.next();
            }
        } else if (e.code === 'ArrowLeft') {
            if (state.algo === 'heap' && state.heapVisualizer) {
                state.heapVisualizer.prev();
            } else {
                visualizer.prev();
            }
        } else if (e.code === 'KeyR') {
            runSimulation();
        }
    });

    // --- Heap Builder Controls ---
    const customHeapBtn = document.getElementById('custom-heap-btn');
    const builderControls = document.getElementById('builder-controls');
    const builderInstructions = document.getElementById('builder-instructions');
    const addNodeBtn = document.getElementById('add-node-btn');
    const clearHeapBtn = document.getElementById('clear-heap-btn');
    const newNodeVal = document.getElementById('new-node-val');

    customHeapBtn.addEventListener('click', () => {
        state.isHeapBuilderActive = !state.isHeapBuilderActive;

        if (state.isHeapBuilderActive) {
            // Enable Builder Mode
            builderControls.classList.remove('hidden');
            builderInstructions.classList.remove('hidden');
            customHeapBtn.textContent = "✅ Done Building";
            customHeapBtn.classList.remove('secondary');
            customHeapBtn.classList.add('success');

            // Init builder
            if (!state.heapVisualizer) state.heapVisualizer = new HeapVisualizer('grid-container', 'status-text');
            state.heapBuilder = new HeapBuilder(state.heapVisualizer);

            // Start with current random data if empty, or just fresh?
            // Let's start with current heapData if exists
            state.heapBuilder.init(state.heapData || []);

            // Disable other controls
            els.startBtn.disabled = true;
            els.randomBtn.disabled = true;

        } else {
            // Disable Builder Mode (Save & Exit)
            builderControls.classList.add('hidden');
            builderInstructions.classList.add('hidden');
            customHeapBtn.textContent = "✏️ Custom Build Mode";
            customHeapBtn.classList.remove('success');

            // Save data
            state.heapData = state.heapBuilder.getArray();
            state.heapBuilder.stop();

            // Re-enable controls
            els.startBtn.disabled = false;
            els.randomBtn.disabled = false;

            // Update preview
            renderHeapArrayPreview();
            document.getElementById('status-text').textContent = "Custom heap saved. Press 'Start' to visualize.";

            // Clear builder from view (optional, or leave it)
            // Ideally we render the static tree now
            if (!state.heapVisualizer) state.heapVisualizer = new HeapVisualizer('grid-container', 'status-text');
            state.heapVisualizer.renderHeap(state.heapData);
        }
    });

    addNodeBtn.addEventListener('click', () => {
        if (state.heapBuilder) {
            const val = parseInt(newNodeVal.value);
            state.heapBuilder.addNode(!isNaN(val) ? val : null);
            newNodeVal.value = '';
        }
    });

    clearHeapBtn.addEventListener('click', () => {
        if (state.heapBuilder) state.heapBuilder.clear();
    });

    // --- Functions ---

    function populateRandomData() {
        if (state.algo === 'knapsack') {
            // Respect current limits if reasonable, or use defaults
            let cap = parseInt(els.inputCap.value) || 10;
            let count = parseInt(els.inputCount.value) || 5;

            // Constrain 
            if (cap < 5) cap = 5; if (cap > 20) cap = 20;
            if (count < 8) count = 8; if (count > 12) count = 12;

            const data = generateRandomKnapsack(cap, count);
            state.data = data;

            els.inputCap.value = data.capacity;
            els.inputCount.value = data.weights.length;
            renderItemsPreview();

        } else if (state.algo === 'lcs') {
            const data = generateRandomLCS();
            state.data = data;
            els.inputStrA.value = data.s1;
            els.inputStrB.value = data.s2;
        } else if (state.algo === 'heap') {
            let size = parseInt(els.inputHeapSize.value) || 10;
            let maxValue = parseInt(els.inputHeapMaxValue.value) || 50;

            // Constrain
            if (size < 5) size = 5; if (size > 15) size = 15;
            if (maxValue < 10) maxValue = 10; if (maxValue > 100) maxValue = 100;

            const array = generateRandomHeapArray(size, maxValue);
            state.heapData = array;

            els.inputHeapSize.value = size;
            els.inputHeapMaxValue.value = maxValue;
            renderHeapArrayPreview();
        }
    }

    function renderItemsPreview() {
        // Show Knapsack items as small tags
        if (!state.data || !state.data.weights) return;

        els.itemsPreview.innerHTML = '';
        state.data.weights.forEach((w, i) => {
            const v = state.data.values[i];
            const tag = document.createElement('div');
            tag.className = 'item-tag';
            tag.textContent = `#${i + 1} [${w}kg, $${v}]`;
            els.itemsPreview.appendChild(tag);
        });
    }

    function getDataFromInputs() {
        if (state.algo === 'knapsack') {
            // Need to reconstruct objects from existing state or inputs
            // For robust manual input, we'd need complex inputs. 
            // For now, if we have state.data matching counts, use it.
            // Else regenerate.

            let cap = parseInt(els.inputCap.value);
            let count = parseInt(els.inputCount.value);

            // If simple params changed, regen data.
            if (state.data && state.data.capacity === cap && state.data.weights.length === count) {
                return state.data;
            }

            // Regenerate
            const data = generateRandomKnapsack(cap, count);
            state.data = data;
            renderItemsPreview();
            return data;

        } else if (state.algo === 'lcs') {
            const s1 = els.inputStrA.value;
            const s2 = els.inputStrB.value;
            return { s1, s2 };
        } else if (state.algo === 'heap') {
            // For heap, return the heap array data
            let size = parseInt(els.inputHeapSize.value) || 10;
            let maxValue = parseInt(els.inputHeapMaxValue.value) || 50;

            if (state.heapData && state.heapData.length === size) {
                return state.heapData;
            }

            // Regenerate
            const array = generateRandomHeapArray(size, maxValue);
            state.heapData = array;
            renderHeapArrayPreview();
            return array;
        }
    }

    function runSimulation() {
        const inputData = getDataFromInputs();

        // Reset traceback state
        state.isSimulationComplete = false;
        state.lastSolvedDp = null;
        state.lastAlgoData = null;

        // Only manage traceback button for DP algorithms
        if (state.algo !== 'heap') {
            els.tracebackBtn.disabled = true;
            tracebackManager.stopTraceback();
        }

        // Handle heap algorithm separately
        if (state.algo === 'heap') {
            runHeapSimulation(inputData);
            return;
        }

        if (state.mode === 'monk') {
            // In monk mode, solve first to get DP table for traceback
            let solver;
            if (state.algo === 'knapsack') {
                solver = new KnapsackSolver(inputData.capacity, inputData.weights, inputData.values);
            } else {
                solver = new LCSSolver(inputData.s1, inputData.s2);
            }
            const result = solver.solve();
            state.lastSolvedDp = result.dp;
            state.lastAlgoData = inputData;

            monkMode.startLevel(state.algo, inputData);
            document.getElementById('status-text').textContent = "In Monk Mode. Click a cell and type the correct value.";

            // Enable traceback button after a short delay to let monk mode initialize
            setTimeout(() => {
                els.tracebackBtn.disabled = false;
                state.isSimulationComplete = true;
            }, 500);
        } else {
            startVisualization(state.algo, inputData);
        }
    }

    function startVisualization(algo, data) {
        let solver, rowHeaders, colHeaders;

        if (algo === 'knapsack') {
            solver = new KnapsackSolver(data.capacity, data.weights, data.values);
            colHeaders = Array.from({ length: data.capacity + 1 }, (_, i) => i);
            rowHeaders = ['-']; // Base case
            data.weights.forEach((w, i) => rowHeaders.push(`I${i + 1} (${w}kg)`));
        } else if (algo === 'lcs') {
            solver = new LCSSolver(data.s1, data.s2);
            colHeaders = ['-', ...data.s2.split('')];
            rowHeaders = ['-', ...data.s1.split('')];
        }

        const result = solver.solve();

        // Store the DP table for traceback
        state.lastSolvedDp = result.dp;
        state.lastAlgoData = data;

        // Render
        visualizer.renderGrid(
            rowHeaders.length,
            colHeaders.length,
            rowHeaders,
            colHeaders,
            false
        );

        els.cellCountLabel.textContent = (rowHeaders.length * colHeaders.length);

        visualizer.loadSteps(result.steps);

        // Enable traceback button
        els.tracebackBtn.disabled = false;
        state.isSimulationComplete = true;

        document.getElementById('status-text').textContent = "Ready. Press Play or use Traceback after completing.";
    }

    // ========================================
    // HEAP-SPECIFIC FUNCTIONS
    // ========================================

    function runHeapSimulation(array) {
        // Create heap visualizer if not exists
        if (!state.heapVisualizer) {
            state.heapVisualizer = new HeapVisualizer('grid-container', 'status-text');
        }

        // Reset heap stats
        resetHeapStats();

        // Show monk progress if in monk mode
        const monkProgressContainer = document.getElementById('monk-progress-container');

        if (state.mode === 'monk') {
            // Monk Mode for heap
            if (!state.heapMonkMode) {
                state.heapMonkMode = new HeapMonkMode(state.heapVisualizer);
            }

            const result = state.heapMonkMode.startLevel(array);

            if (monkProgressContainer) {
                monkProgressContainer.classList.remove('hidden');
            }

            document.getElementById('status-text').textContent =
                `Monk Mode: Build the max-heap by clicking nodes to swap. ${result.totalSwaps} swaps needed.`;

            els.cellCountLabel.textContent = array.length;
            state.isSimulationComplete = true;

        } else {
            // Animated visualization mode
            if (monkProgressContainer) {
                monkProgressContainer.classList.add('hidden');
            }

            const solver = new HeapSolver(array);
            const result = solver.buildMaxHeap();

            // Render initial heap
            state.heapVisualizer.renderHeap(array);

            // Load steps for animation
            state.heapVisualizer.loadSteps(result.steps);

            els.cellCountLabel.textContent = array.length;
            state.isSimulationComplete = true;

            document.getElementById('status-text').textContent =
                `Ready. Press Play to visualize Build-Max-Heap. Total steps: ${result.steps.length}`;
        }
    }

    function renderHeapArrayPreview() {
        if (!state.heapData || !els.heapArrayPreview) return;

        els.heapArrayPreview.innerHTML = '';
        state.heapData.forEach((val, i) => {
            const tag = document.createElement('div');
            tag.className = 'heap-array-tag';
            tag.textContent = `[${i}]: ${val}`;
            els.heapArrayPreview.appendChild(tag);
        });
    }

    function resetHeapStats() {
        const heapifyEl = document.getElementById('heapify-count');
        const swapEl = document.getElementById('swap-count');
        const recursiveEl = document.getElementById('recursive-count');
        const progressEl = document.getElementById('monk-progress');

        if (heapifyEl) heapifyEl.textContent = '0';
        if (swapEl) swapEl.textContent = '0';
        if (recursiveEl) recursiveEl.textContent = '0';
        if (progressEl) progressEl.textContent = '0 / 0';
    }
});

