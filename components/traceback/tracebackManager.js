export class TracebackManager {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.dpTable = null;
        this.algoType = null;
        this.algoData = null;
        this.isTracing = false;
        this.isMonkMode = false;
        this.tracebackSteps = [];
        this.currentTraceStep = 0;
        this.currentRow = 0;
        this.currentCol = 0;
        this.selectedItems = [];
        this.lcsResult = '';
        this.animationSpeed = 500;
        this.cellClickHandler = null;
        this._cacheDom();
        this._initEventListeners();
    }

    _cacheDom() {
        this.logContainer = document.getElementById('traceback-log');
        this.tracebackCard = document.getElementById('traceback-card');
        this.tracebackResult = document.getElementById('traceback-result');
        this.selectedItemsEl = document.getElementById('selected-items');
        this.tracebackBtn = document.getElementById('traceback-btn');
        this.closeBtn = document.getElementById('close-traceback-btn');
    }

    _initEventListeners() {
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.stopTraceback());
    }

    init(algoType, dpTable, algoData, isMonkMode = false) {
        this.algoType = algoType;
        this.dpTable = dpTable;
        this.algoData = algoData;
        this.isMonkMode = isMonkMode;
        this.selectedItems = [];
        this.lcsResult = '';
        this.tracebackSteps = [];
        this.currentTraceStep = 0;
        this.logContainer.innerHTML = '';
        this.tracebackResult.classList.add('hidden');
        this.selectedItemsEl.textContent = '';
    }

    startTraceback() {
        this.isTracing = true;
        this.tracebackCard.classList.remove('hidden');
        this.tracebackBtn.classList.add('active');
        this.tracebackBtn.textContent = '⏳ Tracing...';
        this._clearTracebackHighlights();
        if (this.algoType === 'knapsack') {
            this._startKnapsackTraceback();
        } else {
            this._startLCSTraceback();
        }
    }

    stopTraceback() {
        this.isTracing = false;
        this.tracebackBtn.classList.remove('active');
        this.tracebackBtn.textContent = '🔍 Traceback Items';
        this.tracebackCard.classList.add('hidden');
        this._clearTracebackHighlights();
        this._disableCellClicks();
    }

    setSpeed(ms) {
        this.animationSpeed = ms;
    }

    // ===================== Knapsack Traceback =====================
    _startKnapsackTraceback() {
        const { weights, values, capacity } = this.algoData;
        const n = weights.length;
        this.currentRow = n;
        this.currentCol = capacity;
        this._addLogEntry({
            step: 'Start',
            position: `DP[${n}][${capacity}]`,
            condition: `Starting at bottom-right cell with value ${this.dpTable[n][capacity]}`,
            path: 'Beginning traceback...',
            type: 'start'
        });
        this._highlightCurrentCell(n, capacity);
        if (this.isMonkMode) {
            this._addMonkHint('Click the cell that traceback should visit next');
            this._setupMonkModeKnapsack();
        } else {
            this._animateKnapsackTraceback(n, capacity);
        }
    }

    async _animateKnapsackTraceback(i, w) {
        const { weights, values } = this.algoData;
        while (i > 0 && w > 0) {
            await this._delay(this.animationSpeed);
            const currentVal = this.dpTable[i][w];
            const aboveVal = this.dpTable[i - 1][w];
            this._markAsVisited(i, w);
            if (currentVal !== aboveVal) {
                this._includeItem(i, w, weights[i - 1], values[i - 1], aboveVal);
                w -= weights[i - 1];
                i -= 1;
            } else {
                this._excludeItem(i, w, aboveVal, values[i - 1]);
                i -= 1;
            }
            if (i > 0 || w > 0) this._highlightCurrentCell(i, w);
        }
        this._completeTraceback();
    }

    _setupMonkModeKnapsack() {
        const { weights, values } = this.algoData;
        let i = this.currentRow;
        let w = this.currentCol;
        const processStep = (clickedRow, clickedCol) => {
            if (i <= 0 || w <= 0) return this._completeTraceback();
            const itemWeight = weights[i - 1];
            const currentVal = this.dpTable[i][w];
            const aboveVal = this.dpTable[i - 1][w];
            const expectedRow = i - 1;
            const expectedCol = currentVal !== aboveVal ? w - itemWeight : w;
            const isInclude = currentVal !== aboveVal;
            if (clickedRow === expectedRow && clickedCol === expectedCol) {
                this._markAsVisited(i, w);
                if (isInclude) this._includeItem(i, w, itemWeight, values[i - 1], aboveVal);
                else this._excludeItem(i, w, aboveVal, values[i - 1]);
                i = expectedRow;
                w = expectedCol;
                if (i <= 0 || w <= 0) return this._completeTraceback();
                this._highlightCurrentCell(i, w);
                this._enableCellClicks(processStep);
            } else {
                this._showWrongClick(clickedRow, clickedCol);
            }
        };
        this._enableCellClicks(processStep);
    }

    _includeItem(i, w, weight, value, aboveVal) {
        this.selectedItems.push(i);
        this._addLogEntry({
            step: `Item ${i}`,
            position: `DP[${i}][${w}]`,
            condition: `DP[${i}][${w}] (${this.dpTable[i][w]}) ≠ DP[${i - 1}][${w}] (${aboveVal})`,
            path: `✓ Include Item ${i} (Weight: ${weight}, Value: $${value})`,
            type: 'include'
        });
    }

    _excludeItem(i, w, aboveVal, value) {
        this._addLogEntry({
            step: `Item ${i}`,
            position: `DP[${i}][${w}]`,
            condition: `DP[${i}][${w}] (${this.dpTable[i][w]}) = DP[${i - 1}][${w}] (${aboveVal})`,
            path: `✗ Skip Item ${i} → Move to DP[${i - 1}][${w}]`,
            type: 'exclude'
        });
    }

    // ===================== LCS Traceback =====================
    _startLCSTraceback() {
        const { s1, s2 } = this.algoData;
        const m = s1.length;
        const n = s2.length;
        this.currentRow = m;
        this.currentCol = n;
        this.lcsResult = '';
        this._addLogEntry({
            step: 'Start',
            position: `DP[${m}][${n}]`,
            condition: `Starting at bottom-right cell. LCS length = ${this.dpTable[m][n]}`,
            path: 'Beginning traceback...',
            type: 'start'
        });
        this._highlightCurrentCell(m, n);
        if (this.isMonkMode) {
            this._addMonkHint('Click the cell that traceback should visit next');
            this._setupMonkModeLCS();
        } else {
            this._animateLCSTraceback(m, n);
        }
    }

    async _animateLCSTraceback(i, j) {
        const { s1, s2 } = this.algoData;
        const lcsChars = [];
        while (i > 0 && j > 0) {
            await this._delay(this.animationSpeed);
            this._markAsVisited(i, j);
            const char1 = s1[i - 1];
            const char2 = s2[j - 1];
            if (char1 === char2) {
                lcsChars.unshift(char1);
                this._logMatch(i, j, char1, char2);
                i -= 1;
                j -= 1;
            } else {
                ({ i, j } = this._logMove(i, j, char1, char2));
            }
            if (i > 0 && j > 0) this._highlightCurrentCell(i, j);
        }
        this.lcsResult = lcsChars.join('');
        this._completeTraceback();
    }

    _setupMonkModeLCS() {
        const { s1, s2 } = this.algoData;
        let i = this.currentRow;
        let j = this.currentCol;
        const lcsChars = [];
        const processStep = (clickedRow, clickedCol) => {
            if (i <= 0 || j <= 0) {
                this.lcsResult = lcsChars.join('');
                return this._completeTraceback();
            }
            const char1 = s1[i - 1];
            const char2 = s2[j - 1];
            const { expectedRow, expectedCol, isMatch } = this._expectedLcsMove(i, j, char1, char2);
            if (clickedRow === expectedRow && clickedCol === expectedCol) {
                this._markAsVisited(i, j);
                if (isMatch) {
                    lcsChars.unshift(char1);
                    this._logMatch(i, j, char1, char2);
                } else {
                    this._logMove(i, j, char1, char2);
                }
                i = expectedRow;
                j = expectedCol;
                if (i <= 0 || j <= 0) {
                    this.lcsResult = lcsChars.join('');
                    return this._completeTraceback();
                }
                this._highlightCurrentCell(i, j);
                this._enableCellClicks(processStep);
            } else {
                this._showWrongClick(clickedRow, clickedCol);
            }
        };
        this._enableCellClicks(processStep);
    }

    _expectedLcsMove(i, j, char1, char2) {
        if (char1 === char2) {
            return { expectedRow: i - 1, expectedCol: j - 1, isMatch: true };
        }
        const topVal = this.dpTable[i - 1][j];
        const leftVal = this.dpTable[i][j - 1];
        const moveUp = topVal >= leftVal;
        return { expectedRow: moveUp ? i - 1 : i, expectedCol: moveUp ? j : j - 1, isMatch: false };
    }

    _logMatch(i, j, char1, char2) {
        this._addLogEntry({
            step: 'Match',
            position: `DP[${i}][${j}] comparing '${char1}' with '${char2}'`,
            condition: `X[${i - 1}] = '${char1}' == Y[${j - 1}] = '${char2}'`,
            path: `✓ Match! Add '${char1}' to LCS → Go diagonal to DP[${i - 1}][${j - 1}]`,
            type: 'match'
        });
    }

    _logMove(i, j, char1, char2) {
        const topVal = this.dpTable[i - 1][j];
        const leftVal = this.dpTable[i][j - 1];
        const moveUp = topVal >= leftVal;
        const direction = moveUp ? 'up' : 'left';
        this._addLogEntry({
            step: 'No Match',
            position: `DP[${i}][${j}] comparing '${char1}' with '${char2}'`,
            condition: `'${char1}' ≠ '${char2}'. Top=${topVal} ${moveUp ? '≥' : '<'} Left=${leftVal}`,
            path: `→ Move ${direction} to DP[${moveUp ? i - 1 : i}][${moveUp ? j : j - 1}]`,
            type: `move-${direction}`
        });
        return { i: moveUp ? i - 1 : i, j: moveUp ? j : j - 1 };
    }

    // ===================== Shared Helpers =====================
    _enableCellClicks(callback) {
        if (this.cellClickHandler) this.visualizer.container.removeEventListener('click', this.cellClickHandler);
        this.visualizer.cells.flat().forEach(cell => cell.classList.add('traceback-clickable'));
        this.cellClickHandler = (e) => {
            const cell = e.target.closest('.grid-cell');
            if (!cell || cell.classList.contains('header')) return;
            callback(parseInt(cell.dataset.row, 10), parseInt(cell.dataset.col, 10));
        };
        this.visualizer.container.addEventListener('click', this.cellClickHandler);
    }

    _disableCellClicks() {
        if (this.cellClickHandler) {
            this.visualizer.container.removeEventListener('click', this.cellClickHandler);
            this.cellClickHandler = null;
        }
        this.visualizer.cells.flat().forEach(cell => cell.classList.remove('traceback-clickable'));
    }

    _completeTraceback() {
        this.isTracing = false;
        this.tracebackBtn.classList.remove('active');
        this.tracebackBtn.textContent = '🔍 Traceback Items';
        this._disableCellClicks();
        this._markTracePath();
        this.tracebackResult.classList.remove('hidden');
        if (this.algoType === 'knapsack') {
            this._finalizeKnapsackResult();
        } else {
            this._finalizeLcsResult();
        }
    }

    _finalizeKnapsackResult() {
        const sortedItems = this.selectedItems.sort((a, b) => a - b);
        const itemsStr = sortedItems.length ? sortedItems.map(i => `Item ${i}`).join(', ') : 'None';
        this.selectedItemsEl.textContent = itemsStr;
        this._addLogEntry({
            step: 'Complete',
            position: 'Traceback finished',
            condition: `Found ${sortedItems.length} item(s) in optimal solution`,
            path: `Selected: ${itemsStr}`,
            type: 'complete'
        });
        this._updateStatus(`Traceback complete! Selected items: ${itemsStr}`);
    }

    _finalizeLcsResult() {
        this.selectedItemsEl.textContent = `"${this.lcsResult}" (Length: ${this.lcsResult.length})`;
        this._addLogEntry({
            step: 'Complete',
            position: 'Traceback finished',
            condition: `LCS length = ${this.lcsResult.length}`,
            path: `LCS: "${this.lcsResult}"`,
            type: 'complete'
        });
        this._updateStatus(`Traceback complete! LCS: "${this.lcsResult}"`);
    }

    _highlightCurrentCell(row, col) {
        this.visualizer.cells.flat().forEach(cell => cell.classList.remove('traceback-current'));
        this.visualizer.cells[row]?.[col]?.classList.add('traceback-current');
    }

    _markAsVisited(row, col) {
        const cell = this.visualizer.cells[row]?.[col];
        if (!cell) return;
        cell.classList.remove('traceback-current');
        cell.classList.add('traceback-visited');
    }

    _markTracePath() {
        this.visualizer.cells.flat().forEach(cell => cell.classList.remove('traceback-current'));
        this.visualizer.cells.flat().forEach(cell => {
            if (cell.classList.contains('traceback-visited')) cell.classList.add('traceback-path');
        });
    }

    _clearTracebackHighlights() {
        this.visualizer.cells.flat().forEach(cell => {
            cell.classList.remove('traceback-current', 'traceback-visited', 'traceback-path', 'traceback-clickable', 'traceback-wrong');
        });
    }

    _showWrongClick(row, col) {
        const cell = this.visualizer.cells[row]?.[col];
        if (!cell) return;
        cell.classList.add('traceback-wrong');
        setTimeout(() => cell.classList.remove('traceback-wrong'), 500);
    }

    _addLogEntry({ step, position, condition, path, type }) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `
            <div class="log-step">${step}</div>
            <div class="log-position">${position}</div>
            <div class="log-condition">⚡ ${condition}</div>
            <div class="log-path">→ ${path}</div>
        `;
        this.logContainer.appendChild(entry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    _addMonkHint(message) {
        const hint = document.createElement('div');
        hint.className = 'traceback-hint';
        hint.textContent = message;
        this.logContainer.insertBefore(hint, this.logContainer.firstChild);
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    _updateStatus(message) {
        const el = document.getElementById('status-text');
        if (el) el.textContent = message;
    }
}
