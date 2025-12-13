/**
 * Counting Sort Visualizer
 * Displays three arrays: Input, Count, and Output
 * Shows step-by-step animation of the counting sort algorithm
 */

export class CountingSortVisualizer {
    constructor(containerId, statusId) {
        this.container = document.getElementById(containerId);
        this.statusElement = document.getElementById(statusId);
        this.inputArray = [];
        this.countArray = [];
        this.outputArray = [];
        this.steps = [];
        this.currentStepIndex = 0;
        this.isPlaying = false;
        this.animationId = null;
        this.speed = 500;
    }

    render(inputArray, countArray = [], outputArray = []) {
        this.inputArray = [...inputArray];
        this.countArray = [...countArray];
        this.outputArray = [...outputArray];
        this._render();
    }

    loadSteps(steps) {
        this.pause();
        this.steps = steps;
        this.currentStepIndex = 0;
        if (steps.length > 0) {
            const firstStep = steps[0];
            this.inputArray = [...(firstStep.inputArray || [])];
            this.countArray = [...(firstStep.countArray || [])];
            this.outputArray = [...(firstStep.outputArray || [])];
            this._render();
            this.clearHighlights();
        }
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

    setSpeed(ms) {
        this.speed = ms;
    }

    resetVisuals() {
        this.clearHighlights();
        if (this.statusElement) {
            this.statusElement.textContent = 'Ready to start...';
        }
    }

    clearHighlights() {
        this.container.querySelectorAll('.cs-cell').forEach(cell => {
            cell.classList.remove(
                'highlight-current',
                'highlight-compare',
                'highlight-update',
                'highlight-source',
                'highlight-target',
                'highlight-complete'
            );
        });
    }

    _render() {
        this.container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'counting-sort-container';

        // Phase indicator
        const phaseIndicator = document.createElement('div');
        phaseIndicator.className = 'cs-phase-indicator';
        phaseIndicator.id = 'cs-phase';
        phaseIndicator.innerHTML = '<span class="phase-title">Ready to Start</span>';
        wrapper.appendChild(phaseIndicator);

        // Loop info panel
        const loopPanel = document.createElement('div');
        loopPanel.className = 'cs-loop-panel hidden';
        loopPanel.id = 'cs-loop-panel';
        loopPanel.innerHTML = `
            <div class="loop-header">🔄 Current Loop</div>
            <div class="loop-content">
                <div class="loop-variable" id="loop-variable"></div>
                <div class="loop-progress-bar">
                    <div class="loop-progress-fill" id="loop-progress"></div>
                </div>
                <div class="loop-code" id="loop-code"></div>
            </div>
        `;
        wrapper.appendChild(loopPanel);

        // Input Array Section
        const inputSection = this._createArraySection('Input Array', 'input-array', this.inputArray, 'input');
        wrapper.appendChild(inputSection);

        // Count Array Section
        const countSection = this._createArraySection('Count Array', 'count-array', this.countArray, 'count', true);
        wrapper.appendChild(countSection);

        // Output Array Section
        const outputSection = this._createArraySection('Output Array (Sorted)', 'output-array', this.outputArray, 'output');
        wrapper.appendChild(outputSection);

        // Stats Panel
        const statsPanel = document.createElement('div');
        statsPanel.className = 'cs-stats-panel';
        statsPanel.innerHTML = `
            <div class="cs-stat">
                <span class="stat-label">Array Accesses:</span>
                <span class="stat-value" id="cs-array-accesses">0</span>
            </div>
            <div class="cs-stat">
                <span class="stat-label">Count Updates:</span>
                <span class="stat-value" id="cs-count-updates">0</span>
            </div>
            <div class="cs-stat">
                <span class="stat-label">Placements:</span>
                <span class="stat-value" id="cs-placements">0</span>
            </div>
        `;
        wrapper.appendChild(statsPanel);

        this.container.appendChild(wrapper);
    }

    _createArraySection(title, id, array, type, showIndices = true) {
        const section = document.createElement('div');
        section.className = `cs-array-section cs-${type}-section`;

        const header = document.createElement('div');
        header.className = 'cs-array-header';
        header.innerHTML = `<span class="cs-array-title">${title}</span>`;
        if (array.length > 0) {
            header.innerHTML += `<span class="cs-array-length">[${array.length} elements]</span>`;
        }
        section.appendChild(header);

        const arrayContainer = document.createElement('div');
        arrayContainer.className = 'cs-array-cells';
        arrayContainer.id = id;

        if (array.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'cs-empty-array';
            emptyMsg.textContent = type === 'output' ? 'Output will appear here...' : 'Waiting for data...';
            arrayContainer.appendChild(emptyMsg);
        } else {
            array.forEach((val, idx) => {
                const cell = document.createElement('div');
                cell.className = `cs-cell cs-${type}-cell`;
                cell.dataset.index = idx;
                cell.dataset.type = type;

                const value = document.createElement('span');
                value.className = 'cs-cell-value';
                value.textContent = val !== null && val !== undefined ? val : '-';
                cell.appendChild(value);

                const index = document.createElement('span');
                index.className = 'cs-cell-index';
                index.textContent = idx;
                cell.appendChild(index);

                arrayContainer.appendChild(cell);
            });
        }

        section.appendChild(arrayContainer);
        return section;
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

        // Update arrays
        this.inputArray = [...(step.inputArray || this.inputArray)];
        this.countArray = [...(step.countArray || [])];
        this.outputArray = [...(step.outputArray || [])];

        // Check if we need to re-render (array sizes changed)
        const needsRerender = this._checkNeedsRerender(step);
        if (needsRerender) {
            this._render();
            // After render, apply transition display if needed
            this._applyCountTransition(step);
        } else {
            this._updateArrayDisplays(step);
        }

        // Apply highlights
        this._applyHighlights(step);

        // Update phase indicator
        this._updatePhaseIndicator(step);

        // Update loop panel
        this._updateLoopPanel(step);

        // Update stats
        this._updateStats(step.stats);

        // Update status
        if (this.statusElement && step.description) {
            this.statusElement.innerHTML = step.description;
        }
    }

    _checkNeedsRerender(step) {
        const currentCountCells = this.container.querySelectorAll('.cs-count-cell').length;
        const currentOutputCells = this.container.querySelectorAll('.cs-output-cell').length;
        const newCountLength = (step.countArray || []).length;
        const newOutputLength = (step.outputArray || []).length;

        return currentCountCells !== newCountLength ||
            (currentOutputCells === 0 && newOutputLength > 0) ||
            (newOutputLength > 0 && currentOutputCells !== newOutputLength);
    }

    _updateArrayDisplays(step = null) {
        // Update count array display
        this.countArray.forEach((val, idx) => {
            const cell = this.container.querySelector(`.cs-count-cell[data-index="${idx}"]`);
            if (cell) {
                const valueEl = cell.querySelector('.cs-cell-value');

                // Check if this is an output phase step with a count transition for THIS cell
                if (step && step.type === 'output' && step.highlightCountIndex === idx &&
                    step.countBefore !== undefined && step.countAfter !== undefined) {
                    // Show "before → after" transition
                    valueEl.innerHTML = `<span class="count-before">${step.countBefore}</span><span class="count-arrow">→</span><span class="count-after">${step.countAfter}</span>`;
                    cell.classList.add('count-transition');
                } else {
                    // Normal display
                    valueEl.textContent = val;
                    cell.classList.remove('count-transition');
                }
            }
        });

        // Update output array display
        this.outputArray.forEach((val, idx) => {
            const cell = this.container.querySelector(`.cs-output-cell[data-index="${idx}"]`);
            if (cell) {
                cell.querySelector('.cs-cell-value').textContent = val !== null ? val : '-';
            }
        });
    }

    _applyCountTransition(step) {
        // Apply count transition after a re-render
        if (step && step.type === 'output' && step.highlightCountIndex !== undefined &&
            step.countBefore !== undefined && step.countAfter !== undefined) {
            const cell = this.container.querySelector(`.cs-count-cell[data-index="${step.highlightCountIndex}"]`);
            if (cell) {
                const valueEl = cell.querySelector('.cs-cell-value');
                valueEl.innerHTML = `<span class="count-before">${step.countBefore}</span><span class="count-arrow">→</span><span class="count-after">${step.countAfter}</span>`;
                cell.classList.add('count-transition');
            }
        }
    }

    _applyHighlights(step) {
        // Input array highlights
        if (step.highlightInputIndex !== undefined) {
            this._highlightCell('input', step.highlightInputIndex, 'current');
        }
        if (step.highlightMaxIndex !== undefined && step.highlightMaxIndex !== step.highlightInputIndex) {
            this._highlightCell('input', step.highlightMaxIndex, 'compare');
        }

        // Count array highlights
        if (step.highlightCountIndex !== undefined) {
            this._highlightCell('count', step.highlightCountIndex, 'update');
        }
        if (step.highlightPrevCountIndex !== undefined) {
            this._highlightCell('count', step.highlightPrevCountIndex, 'source');
        }

        // Output array highlights
        if (step.highlightOutputIndex !== undefined) {
            this._highlightCell('output', step.highlightOutputIndex, 'target');
        }

        // Phase completion highlights
        if (step.type === 'complete') {
            this.container.querySelectorAll('.cs-output-cell').forEach(cell => {
                cell.classList.add('highlight-complete');
            });
        }
    }

    _highlightCell(type, index, highlightType) {
        const cell = this.container.querySelector(`.cs-${type}-cell[data-index="${index}"]`);
        if (cell) {
            cell.classList.add(`highlight-${highlightType}`);
        }
    }

    _updatePhaseIndicator(step) {
        const phaseEl = document.getElementById('cs-phase');
        if (!phaseEl) return;

        let phaseTitle = '';
        let phaseClass = '';

        switch (step.phase) {
            case 'find-max':
                phaseTitle = '🔍 Phase 0: Finding Maximum';
                phaseClass = 'phase-find-max';
                break;
            case 'count':
                phaseTitle = '📊 Phase 1: Counting Occurrences';
                phaseClass = 'phase-count';
                break;
            case 'cumulative':
                phaseTitle = '🔢 Phase 2: Cumulative Sum';
                phaseClass = 'phase-cumulative';
                break;
            case 'output':
                phaseTitle = '📍 Phase 3: Building Output';
                phaseClass = 'phase-output';
                break;
            case 'complete':
                phaseTitle = '🎉 Sorting Complete!';
                phaseClass = 'phase-complete';
                break;
            default:
                phaseTitle = 'Ready';
                phaseClass = '';
        }

        phaseEl.className = `cs-phase-indicator ${phaseClass}`;
        phaseEl.innerHTML = `<span class="phase-title">${phaseTitle}</span>`;
    }

    _updateLoopPanel(step) {
        const loopPanel = document.getElementById('cs-loop-panel');
        const loopVariable = document.getElementById('loop-variable');
        const loopProgress = document.getElementById('loop-progress');
        const loopCode = document.getElementById('loop-code');

        if (!loopPanel || !step.loopInfo) {
            loopPanel?.classList.add('hidden');
            return;
        }

        loopPanel.classList.remove('hidden');

        const info = step.loopInfo;
        const total = info.direction === 'decrement'
            ? (info.current - info.min + 1)
            : (info.max - 0 + 1);
        const current = info.direction === 'decrement'
            ? (info.max !== undefined ? info.max - info.current + 1 : info.current - info.min + 1)
            : info.current + 1;
        const progressPercent = (current / total) * 100;

        loopVariable.innerHTML = `<strong>${info.variable}</strong> = ${info.current}`;
        loopProgress.style.width = `${progressPercent}%`;
        loopCode.innerHTML = `<code>${info.code}</code>`;
    }

    _updateStats(stats) {
        if (!stats) return;
        const accessesEl = document.getElementById('cs-array-accesses');
        const updatesEl = document.getElementById('cs-count-updates');
        const placementsEl = document.getElementById('cs-placements');

        if (accessesEl) accessesEl.textContent = stats.arrayAccesses || 0;
        if (updatesEl) updatesEl.textContent = stats.countUpdates || 0;
        if (placementsEl) placementsEl.textContent = stats.placements || 0;
    }

    _replayToStep(targetIndex) {
        if (this.steps.length === 0) return;

        // Reset to initial state
        const initStep = this.steps[0];
        this.inputArray = [...(initStep.inputArray || [])];
        this.countArray = [];
        this.outputArray = [];

        // Replay all steps up to target
        for (let i = 0; i <= targetIndex; i++) {
            const step = this.steps[i];
            if (step.inputArray) this.inputArray = [...step.inputArray];
            if (step.countArray) this.countArray = [...step.countArray];
            if (step.outputArray) this.outputArray = [...step.outputArray];
        }

        this._render();
        const step = this.steps[targetIndex];
        this._applyHighlights(step);
        this._updatePhaseIndicator(step);
        this._updateLoopPanel(step);
        this._updateStats(step.stats);

        if (this.statusElement && step.description) {
            this.statusElement.innerHTML = step.description;
        }
    }
}
