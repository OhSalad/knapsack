import { KnapsackSolver } from '../knapsack/solver.js';
import { LCSSolver } from '../lcs/solver.js';

export class MonkMode {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.answerKey = null;
        this.currentAlgo = null;
    }

    startLevel(algoType, inputData) {
        this.currentAlgo = algoType;
        this.answerKey = this._buildAnswerKey(algoType, inputData);
        const headers = this._deriveHeaders(algoType, inputData);
        this.visualizer.renderGrid(headers.rows, headers.cols, headers.rowHeaders, headers.colHeaders, true);
        this._attachInputListeners();
    }

    _buildAnswerKey(algoType, inputData) {
        if (algoType === 'knapsack') {
            const { capacity, weights, values } = inputData;
            return new KnapsackSolver(capacity, weights, values).solve().dp;
        }
        const { s1, s2 } = inputData;
        return new LCSSolver(s1, s2).solve().dp;
    }

    _deriveHeaders(algoType, inputData) {
        if (algoType === 'knapsack') {
            const { capacity, weights, values } = inputData;
            const colHeaders = Array.from({ length: capacity + 1 }, (_, i) => i);
            const rowHeaders = ['-'];
            weights.forEach((w, i) => rowHeaders.push(`I${i + 1} (${w}kg, $${values[i]})`));
            return { rows: weights.length + 1, cols: capacity + 1, rowHeaders, colHeaders };
        }
        const { s1, s2 } = inputData;
        const colHeaders = ['-', ...s2.split('')];
        const rowHeaders = ['-', ...s1.split('')];
        return { rows: s1.length + 1, cols: s2.length + 1, rowHeaders, colHeaders };
    }

    _attachInputListeners() {
        const inputs = document.querySelectorAll('.grid-cell input');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => this._validateSingleInput(e.target));
        });
    }

    _validateSingleInput(inputElement) {
        const r = parseInt(inputElement.dataset.row, 10);
        const c = parseInt(inputElement.dataset.col, 10);
        const userVal = parseInt(inputElement.value, 10);
        const correctVal = this.answerKey[r][c];

        inputElement.parentElement.classList.remove('correct', 'incorrect');
        if (isNaN(userVal)) return;
        if (userVal === correctVal) {
            inputElement.parentElement.classList.add('correct');
        } else {
            inputElement.parentElement.classList.add('incorrect');
        }
    }

    checkAll() {
        const inputs = document.querySelectorAll('.grid-cell input');
        let score = 0;
        let total = 0;

        inputs.forEach(input => {
            const r = parseInt(input.dataset.row, 10);
            const c = parseInt(input.dataset.col, 10);
            const userVal = parseInt(input.value, 10);
            const correctVal = this.answerKey[r][c];
            total++;
            input.parentElement.classList.remove('correct', 'incorrect');
            if (userVal === correctVal) {
                input.parentElement.classList.add('correct');
                score++;
            } else {
                input.parentElement.classList.add('incorrect');
            }
        });

        return { allCorrect: score === total, score, total };
    }
}
