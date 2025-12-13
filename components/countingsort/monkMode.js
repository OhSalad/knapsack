/**
 * Counting Sort Monk Mode
 * Interactive practice mode for learning counting sort
 * 
 * The user must fill in:
 * 1. Phase 1: Count array (count occurrences of each value)
 * 2. Phase 2: Cumulative count array (prefix sums)
 * 3. Phase 3: Output array (place elements at correct positions)
 */

import { CountingSortSolver } from './solver.js';

export class CountingSortMonkMode {
    constructor(containerId, statusId) {
        this.container = document.getElementById(containerId);
        this.statusElement = document.getElementById(statusId);
        this.inputArray = [];
        this.maxValue = 0;

        // Answer keys for validation
        this.countArrayKey = [];      // Phase 1: Count occurrences
        this.cumulativeArrayKey = []; // Phase 2: Cumulative counts
        this.outputArrayKey = [];     // Phase 3: Sorted output

        // Current state
        this.currentPhase = 1;
        this.userCountArray = [];
        this.userCumulativeArray = [];
        this.userOutputArray = [];

        // Progress tracking
        this.phase1Complete = false;
        this.phase2Complete = false;
        this.phase3Complete = false;

        this.isActive = false;
    }

    /**
     * Start Monk Mode with the given input array
     */
    startLevel(inputArray) {
        this.inputArray = [...inputArray];
        this.isActive = true;

        // Calculate the answer keys
        this._buildAnswerKeys();

        // Reset user arrays
        this.userCountArray = new Array(this.maxValue + 1).fill(null);
        this.userCumulativeArray = new Array(this.maxValue + 1).fill(null);
        this.userOutputArray = new Array(this.inputArray.length).fill(null);

        // Reset phase tracking
        this.currentPhase = 1;
        this.phase1Complete = false;
        this.phase2Complete = false;
        this.phase3Complete = false;

        // Render the monk mode UI
        this._render();
        this._updateStatus('📝 Phase 1: Fill in the count array. Count how many times each value (0 to ' + this.maxValue + ') appears in the input.');

        return {
            inputArray: this.inputArray,
            maxValue: this.maxValue,
            countArrayLength: this.maxValue + 1,
            outputArrayLength: this.inputArray.length
        };
    }

    /**
     * Build the correct answer keys by solving the algorithm
     */
    _buildAnswerKeys() {
        // Find max value
        this.maxValue = Math.max(...this.inputArray);

        // Phase 1: Count occurrences
        this.countArrayKey = new Array(this.maxValue + 1).fill(0);
        for (let i = 0; i < this.inputArray.length; i++) {
            this.countArrayKey[this.inputArray[i]]++;
        }

        // Phase 2: Cumulative counts
        this.cumulativeArrayKey = [...this.countArrayKey];
        for (let i = 1; i <= this.maxValue; i++) {
            this.cumulativeArrayKey[i] += this.cumulativeArrayKey[i - 1];
        }

        // Phase 3: Output array (sorted)
        const solver = new CountingSortSolver(this.inputArray);
        const result = solver.solve();
        this.outputArrayKey = result.sortedArray;
    }

    /**
     * Reset the monk mode
     */
    reset() {
        this.isActive = false;
        this.currentPhase = 1;
        this.container.innerHTML = '';
    }

    /**
     * Render the monk mode interface
     */
    _render() {
        this.container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'counting-sort-monk-container';

        // Phase indicator
        const phaseIndicator = this._createPhaseIndicator();
        wrapper.appendChild(phaseIndicator);

        // Instructions panel
        const instructionsPanel = this._createInstructionsPanel();
        wrapper.appendChild(instructionsPanel);

        // Input Array (always visible, read-only)
        wrapper.appendChild(this._createInputArraySection());

        // Count Array (Phase 1 - interactive during phase 1)
        wrapper.appendChild(this._createCountArraySection());

        // Cumulative Array (Phase 2 - interactive during phase 2)
        wrapper.appendChild(this._createCumulativeArraySection());

        // Output Array (Phase 3 - interactive during phase 3)
        wrapper.appendChild(this._createOutputArraySection());

        // Check/Submit button
        wrapper.appendChild(this._createCheckButton());

        // Progress panel
        wrapper.appendChild(this._createProgressPanel());

        this.container.appendChild(wrapper);
    }

    _createPhaseIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'cs-monk-phase-indicator';
        indicator.id = 'cs-monk-phase';
        indicator.innerHTML = `
            <div class="phase-step ${this.currentPhase >= 1 ? 'active' : ''} ${this.phase1Complete ? 'complete' : ''}" data-phase="1">
                <span class="phase-number">1</span>
                <span class="phase-label">Count</span>
            </div>
            <div class="phase-connector ${this.phase1Complete ? 'complete' : ''}"></div>
            <div class="phase-step ${this.currentPhase >= 2 ? 'active' : ''} ${this.phase2Complete ? 'complete' : ''}" data-phase="2">
                <span class="phase-number">2</span>
                <span class="phase-label">Cumulative</span>
            </div>
            <div class="phase-connector ${this.phase2Complete ? 'complete' : ''}"></div>
            <div class="phase-step ${this.currentPhase >= 3 ? 'active' : ''} ${this.phase3Complete ? 'complete' : ''}" data-phase="3">
                <span class="phase-number">3</span>
                <span class="phase-label">Output</span>
            </div>
        `;
        return indicator;
    }

    _createInstructionsPanel() {
        const panel = document.createElement('div');
        panel.className = 'cs-monk-instructions';
        panel.id = 'cs-monk-instructions';

        const instructions = {
            1: `<strong>Phase 1: Count Occurrences</strong><br>
                For each index i (0 to ${this.maxValue}), count how many times the value i appears in the input array.<br>
                <code>count[i] = number of times value i appears</code>`,
            2: `<strong>Phase 2: Cumulative Sum</strong><br>
                Transform the count array into cumulative sums.<br>
                <code>count[i] = count[i] + count[i-1]</code><br>
                This tells us the ending position for each value.`,
            3: `<strong>Phase 3: Build Output</strong><br>
                Place each element from the input array (right to left) into the output array.<br>
                For each value v: position = count[v] - 1, then decrement count[v].`
        };

        panel.innerHTML = instructions[this.currentPhase];
        return panel;
    }

    _createInputArraySection() {
        const section = document.createElement('div');
        section.className = 'cs-monk-section cs-input-section';

        section.innerHTML = `
            <div class="cs-monk-header">
                <span class="cs-monk-title">Input Array</span>
                <span class="cs-monk-hint">[${this.inputArray.length} elements]</span>
            </div>
            <div class="cs-monk-cells" id="cs-monk-input">
                ${this.inputArray.map((val, idx) => `
                    <div class="cs-monk-cell cs-input-cell" data-index="${idx}">
                        <span class="cs-cell-value">${val}</span>
                        <span class="cs-cell-index">${idx}</span>
                    </div>
                `).join('')}
            </div>
        `;

        return section;
    }

    _createCountArraySection() {
        const section = document.createElement('div');
        section.className = `cs-monk-section cs-count-section ${this.currentPhase === 1 ? 'active-phase' : ''}`;

        const isInteractive = this.currentPhase === 1;
        const isLocked = this.phase1Complete;

        section.innerHTML = `
            <div class="cs-monk-header">
                <span class="cs-monk-title">Count Array (Phase 1)</span>
                <span class="cs-monk-hint">[indices 0 to ${this.maxValue}]</span>
                ${isLocked ? '<span class="phase-badge complete">✓ Complete</span>' : ''}
            </div>
            <div class="cs-monk-cells" id="cs-monk-count">
                ${Array.from({ length: this.maxValue + 1 }, (_, idx) => {
            const value = isLocked ? this.countArrayKey[idx] : (this.userCountArray[idx] ?? '');
            return `
                        <div class="cs-monk-cell cs-count-cell ${isLocked ? 'locked' : ''}" data-index="${idx}">
                            ${isLocked ?
                    `<span class="cs-cell-value">${value}</span>` :
                    `<input type="number" class="cs-monk-input" data-phase="1" data-index="${idx}" 
                                    value="${value}" ${!isInteractive ? 'disabled' : ''} min="0">`
                }
                            <span class="cs-cell-index">${idx}</span>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        // Attach listeners after adding to DOM
        if (isInteractive && !isLocked) {
            setTimeout(() => this._attachInputListeners(1), 0);
        }

        return section;
    }

    _createCumulativeArraySection() {
        const section = document.createElement('div');
        section.className = `cs-monk-section cs-cumulative-section ${this.currentPhase === 2 ? 'active-phase' : ''}`;

        const isInteractive = this.currentPhase === 2;
        const isLocked = this.phase2Complete;
        const isVisible = this.currentPhase >= 2 || this.phase1Complete;

        if (!isVisible) {
            section.classList.add('hidden-phase');
        }

        section.innerHTML = `
            <div class="cs-monk-header">
                <span class="cs-monk-title">Cumulative Count (Phase 2)</span>
                <span class="cs-monk-hint">[prefix sums]</span>
                ${isLocked ? '<span class="phase-badge complete">✓ Complete</span>' : ''}
            </div>
            <div class="cs-monk-cells" id="cs-monk-cumulative">
                ${Array.from({ length: this.maxValue + 1 }, (_, idx) => {
            const value = isLocked ? this.cumulativeArrayKey[idx] : (this.userCumulativeArray[idx] ?? '');
            return `
                        <div class="cs-monk-cell cs-cumulative-cell ${isLocked ? 'locked' : ''}" data-index="${idx}">
                            ${isLocked ?
                    `<span class="cs-cell-value">${value}</span>` :
                    `<input type="number" class="cs-monk-input" data-phase="2" data-index="${idx}" 
                                    value="${value}" ${!isInteractive ? 'disabled' : ''} min="0">`
                }
                            <span class="cs-cell-index">${idx}</span>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        if (isInteractive && !isLocked) {
            setTimeout(() => this._attachInputListeners(2), 0);
        }

        return section;
    }

    _createOutputArraySection() {
        const section = document.createElement('div');
        section.className = `cs-monk-section cs-output-section ${this.currentPhase === 3 ? 'active-phase' : ''}`;

        const isInteractive = this.currentPhase === 3;
        const isLocked = this.phase3Complete;
        const isVisible = this.currentPhase >= 3 || this.phase2Complete;

        if (!isVisible) {
            section.classList.add('hidden-phase');
        }

        section.innerHTML = `
            <div class="cs-monk-header">
                <span class="cs-monk-title">Output Array (Phase 3)</span>
                <span class="cs-monk-hint">[sorted result]</span>
                ${isLocked ? '<span class="phase-badge complete">✓ Complete</span>' : ''}
            </div>
            <div class="cs-monk-cells" id="cs-monk-output">
                ${Array.from({ length: this.inputArray.length }, (_, idx) => {
            const value = isLocked ? this.outputArrayKey[idx] : (this.userOutputArray[idx] ?? '');
            return `
                        <div class="cs-monk-cell cs-output-cell ${isLocked ? 'locked' : ''}" data-index="${idx}">
                            ${isLocked ?
                    `<span class="cs-cell-value">${value}</span>` :
                    `<input type="number" class="cs-monk-input" data-phase="3" data-index="${idx}" 
                                    value="${value}" ${!isInteractive ? 'disabled' : ''} min="0">`
                }
                            <span class="cs-cell-index">${idx}</span>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        if (isInteractive && !isLocked) {
            setTimeout(() => this._attachInputListeners(3), 0);
        }

        return section;
    }

    _createCheckButton() {
        const container = document.createElement('div');
        container.className = 'cs-monk-actions';

        const phaseLabels = {
            1: 'Check Count Array',
            2: 'Check Cumulative Array',
            3: 'Check Output Array'
        };

        container.innerHTML = `
            <button id="cs-monk-check-btn" class="primary-btn cs-monk-check-btn">
                ✓ ${phaseLabels[this.currentPhase]}
            </button>
            <button id="cs-monk-hint-btn" class="sm-btn cs-monk-hint-btn">
                💡 Show Hint
            </button>
        `;

        setTimeout(() => {
            document.getElementById('cs-monk-check-btn')?.addEventListener('click', () => this._checkCurrentPhase());
            document.getElementById('cs-monk-hint-btn')?.addEventListener('click', () => this._showHint());
        }, 0);

        return container;
    }

    _createProgressPanel() {
        const panel = document.createElement('div');
        panel.className = 'cs-monk-progress-panel';
        panel.id = 'cs-monk-progress';

        panel.innerHTML = `
            <div class="progress-item">
                <span class="progress-label">Phase 1:</span>
                <span class="progress-value" id="cs-phase1-progress">${this.phase1Complete ? '✓' : '...'}</span>
            </div>
            <div class="progress-item">
                <span class="progress-label">Phase 2:</span>
                <span class="progress-value" id="cs-phase2-progress">${this.phase2Complete ? '✓' : '...'}</span>
            </div>
            <div class="progress-item">
                <span class="progress-label">Phase 3:</span>
                <span class="progress-value" id="cs-phase3-progress">${this.phase3Complete ? '✓' : '...'}</span>
            </div>
        `;

        return panel;
    }

    _attachInputListeners(phase) {
        const inputs = document.querySelectorAll(`.cs-monk-input[data-phase="${phase}"]`);
        inputs.forEach(input => {
            input.addEventListener('input', (e) => this._onInputChange(e, phase));
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this._checkCurrentPhase();
                }
            });
        });
    }

    _onInputChange(event, phase) {
        const index = parseInt(event.target.dataset.index, 10);
        const value = event.target.value === '' ? null : parseInt(event.target.value, 10);

        if (phase === 1) {
            this.userCountArray[index] = value;
        } else if (phase === 2) {
            this.userCumulativeArray[index] = value;
        } else if (phase === 3) {
            this.userOutputArray[index] = value;
        }

        // Clear previous validation styling
        event.target.parentElement.classList.remove('correct', 'incorrect');

        // Immediate feedback: validate the input as user types
        if (value !== null) {
            let correctVal;
            if (phase === 1) {
                correctVal = this.countArrayKey[index];
            } else if (phase === 2) {
                correctVal = this.cumulativeArrayKey[index];
            } else if (phase === 3) {
                correctVal = this.outputArrayKey[index];
            }

            if (value === correctVal) {
                event.target.parentElement.classList.add('correct');
            } else {
                event.target.parentElement.classList.add('incorrect');
            }
        }
    }

    _checkCurrentPhase() {
        if (this.currentPhase === 1) {
            this._checkPhase1();
        } else if (this.currentPhase === 2) {
            this._checkPhase2();
        } else if (this.currentPhase === 3) {
            this._checkPhase3();
        }
    }

    _checkPhase1() {
        let allCorrect = true;
        let score = 0;
        const total = this.maxValue + 1;

        for (let i = 0; i <= this.maxValue; i++) {
            const cell = document.querySelector(`.cs-count-cell[data-index="${i}"]`);
            const input = cell?.querySelector('input');
            if (!input) continue;

            const userVal = this.userCountArray[i];
            const correctVal = this.countArrayKey[i];

            cell.classList.remove('correct', 'incorrect');

            if (userVal === correctVal) {
                cell.classList.add('correct');
                score++;
            } else {
                cell.classList.add('incorrect');
                allCorrect = false;
            }
        }

        if (allCorrect) {
            this.phase1Complete = true;
            this.currentPhase = 2;
            this._updateStatus('🎉 Phase 1 complete! Now fill in the cumulative counts. count[i] = count[i] + count[i-1]');
            this._render();
        } else {
            this._updateStatus(`❌ ${score}/${total} correct. Check your count values and try again.`);
        }

        this._updateProgress();
    }

    _checkPhase2() {
        let allCorrect = true;
        let score = 0;
        const total = this.maxValue + 1;

        for (let i = 0; i <= this.maxValue; i++) {
            const cell = document.querySelector(`.cs-cumulative-cell[data-index="${i}"]`);
            const input = cell?.querySelector('input');
            if (!input) continue;

            const userVal = this.userCumulativeArray[i];
            const correctVal = this.cumulativeArrayKey[i];

            cell.classList.remove('correct', 'incorrect');

            if (userVal === correctVal) {
                cell.classList.add('correct');
                score++;
            } else {
                cell.classList.add('incorrect');
                allCorrect = false;
            }
        }

        if (allCorrect) {
            this.phase2Complete = true;
            this.currentPhase = 3;
            this._updateStatus('🎉 Phase 2 complete! Now fill in the output array. Place elements from right-to-left.');
            this._render();
        } else {
            this._updateStatus(`❌ ${score}/${total} correct. Remember: count[i] = count[i] + count[i-1]`);
        }

        this._updateProgress();
    }

    _checkPhase3() {
        let allCorrect = true;
        let score = 0;
        const total = this.inputArray.length;

        for (let i = 0; i < this.inputArray.length; i++) {
            const cell = document.querySelector(`.cs-output-cell[data-index="${i}"]`);
            const input = cell?.querySelector('input');
            if (!input) continue;

            const userVal = this.userOutputArray[i];
            const correctVal = this.outputArrayKey[i];

            cell.classList.remove('correct', 'incorrect');

            if (userVal === correctVal) {
                cell.classList.add('correct');
                score++;
            } else {
                cell.classList.add('incorrect');
                allCorrect = false;
            }
        }

        if (allCorrect) {
            this.phase3Complete = true;
            this.isActive = false;
            this._updateStatus('🎉 Congratulations! You have successfully completed the Counting Sort algorithm!');
            this._render();
            this._onComplete();
        } else {
            this._updateStatus(`❌ ${score}/${total} correct. Remember: position = count[value] - 1, then decrement count[value].`);
        }

        this._updateProgress();
    }

    _showHint() {
        let hint = '';

        if (this.currentPhase === 1) {
            // Find first incorrect or empty cell
            for (let i = 0; i <= this.maxValue; i++) {
                if (this.userCountArray[i] !== this.countArrayKey[i]) {
                    const occurrences = this.inputArray.filter(v => v === i).length;
                    hint = `💡 Hint: Value ${i} appears ${occurrences} time(s) in the input array [${this.inputArray.join(', ')}].`;
                    break;
                }
            }
        } else if (this.currentPhase === 2) {
            for (let i = 0; i <= this.maxValue; i++) {
                if (this.userCumulativeArray[i] !== this.cumulativeArrayKey[i]) {
                    if (i === 0) {
                        hint = `💡 Hint: cumulative[0] = count[0] = ${this.countArrayKey[0]}`;
                    } else {
                        hint = `💡 Hint: cumulative[${i}] = count[${i}] + cumulative[${i - 1}] = ${this.countArrayKey[i]} + ${this.cumulativeArrayKey[i - 1]} = ${this.cumulativeArrayKey[i]}`;
                    }
                    break;
                }
            }
        } else if (this.currentPhase === 3) {
            hint = `💡 Hint: Traverse input array from RIGHT to LEFT. For the last element ${this.inputArray[this.inputArray.length - 1]}, ` +
                `its position would be cumulative[${this.inputArray[this.inputArray.length - 1]}] - 1.`;
        }

        if (!hint) {
            hint = '✅ All values look correct! Click "Check" to verify.';
        }

        this._updateStatus(hint);
    }

    _updateStatus(message) {
        if (this.statusElement) {
            this.statusElement.innerHTML = message;
        }
    }

    _updateProgress() {
        const p1 = document.getElementById('cs-phase1-progress');
        const p2 = document.getElementById('cs-phase2-progress');
        const p3 = document.getElementById('cs-phase3-progress');

        if (p1) p1.textContent = this.phase1Complete ? '✓' : (this.currentPhase === 1 ? 'In Progress' : '...');
        if (p2) p2.textContent = this.phase2Complete ? '✓' : (this.currentPhase === 2 ? 'In Progress' : '...');
        if (p3) p3.textContent = this.phase3Complete ? '✓' : (this.currentPhase === 3 ? 'In Progress' : '...');
    }

    _onComplete() {
        // Add celebration animation to all cells
        document.querySelectorAll('.cs-monk-cell').forEach((cell, idx) => {
            setTimeout(() => {
                cell.classList.add('celebrate');
            }, idx * 50);
        });
    }
}
