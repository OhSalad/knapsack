document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const state = {
        algo: 'knapsack', // 'knapsack' | 'lcs'
        mode: 'visualize', // 'visualize' | 'monk'
        data: null,
        lastSolvedDp: null,
        lastAlgoData: null,
        isSimulationComplete: false
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
        itemsPreview: document.getElementById('items-preview'),

        startBtn: document.getElementById('start-btn'),
        randomBtn: document.getElementById('random-btn'),

        // Inputs
        inputCap: document.getElementById('capacity-input'),
        inputCount: document.getElementById('item-count-input'),
        inputStrA: document.getElementById('str-a-input'),
        inputStrB: document.getElementById('str-b-input'),

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
        cellCountLabel: document.getElementById('cell-count')
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

            if (algo === 'knapsack') {
                els.knapsackConfig.classList.remove('hidden');
                els.lcsConfig.classList.add('hidden');
                els.gridTitle.textContent = "Knapsack Table";
                renderItemsPreview();
            } else {
                els.knapsackConfig.classList.add('hidden');
                els.lcsConfig.classList.remove('hidden');
                els.gridTitle.textContent = "LCS Table";
            }

            // Generate new data for the switched algo if needed or just clear
            // For smoother UX, let's regen data on switch if null, or just keep what's in inputs
            // We'll leave inputs as is.
            state.data = null; // Clear cached data to force re-read from inputs
            state.lastSolvedDp = null;
            state.lastAlgoData = null;
            state.isSimulationComplete = false;
            els.tracebackBtn.disabled = true;
            tracebackManager.stopTraceback();
            visualizer.resetVisuals();
            visualizer.container.innerHTML = '';
        });
    });

    // Random Button
    els.randomBtn.addEventListener('click', () => {
        populateRandomData();
        renderItemsPreview();
        // Optional: Auto-start? No, user asked to stop auto-starting.
        state.lastSolvedDp = null;
        state.lastAlgoData = null;
        state.isSimulationComplete = false;
        els.tracebackBtn.disabled = true;
        tracebackManager.stopTraceback();
        visualizer.resetVisuals();
        visualizer.container.innerHTML = '';
        state.data = null; // Force refresh
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

    // Controls
    els.playBtn.addEventListener('click', () => visualizer.play());
    els.pauseBtn.addEventListener('click', () => visualizer.pause());
    els.nextBtn.addEventListener('click', () => visualizer.next());
    els.prevBtn.addEventListener('click', () => visualizer.prev());

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
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (visualizer.isPlaying) visualizer.pause();
            else visualizer.play();
        } else if (e.code === 'ArrowRight') {
            visualizer.next();
        } else if (e.code === 'ArrowLeft') {
            visualizer.prev();
        } else if (e.code === 'KeyR') {
            runSimulation();
        }
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

        } else {
            const data = generateRandomLCS();
            state.data = data;
            els.inputStrA.value = data.s1;
            els.inputStrB.value = data.s2;
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

        } else {
            const s1 = els.inputStrA.value;
            const s2 = els.inputStrB.value;
            return { s1, s2 };
        }
    }

    function runSimulation() {
        const inputData = getDataFromInputs();

        // Reset traceback state
        state.isSimulationComplete = false;
        state.lastSolvedDp = null;
        state.lastAlgoData = null;
        els.tracebackBtn.disabled = true;
        tracebackManager.stopTraceback();

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
        } else {
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
});
