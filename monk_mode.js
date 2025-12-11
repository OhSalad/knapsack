class MonkMode {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.answerKey = null; // The full DP table
        this.currentAlgo = null;
    }

    startLevel(algoType, inputData) {
        this.currentAlgo = algoType;
        let solver;
        let rowHeaders, colHeaders;

        if (algoType === 'knapsack') {
            const { capacity, weights, values } = inputData;
            solver = new KnapsackSolver(capacity, weights, values);
            const solution = solver.solve();
            this.answerKey = solution.dp;

            // Format headers
            colHeaders = Array.from({ length: capacity + 1 }, (_, i) => i);
            rowHeaders = ['-']; // Base case row 0
            weights.forEach((w, i) => rowHeaders.push(`I${i + 1} (${w}kg, $${values[i]})`));

            this.visualizer.renderGrid(weights.length + 1, capacity + 1, rowHeaders, colHeaders, true);

        } else if (algoType === 'lcs') {
            const { s1, s2 } = inputData;
            solver = new LCSSolver(s1, s2);
            const solution = solver.solve();
            this.answerKey = solution.dp;

            // Format headers
            colHeaders = ['-', ...s2.split('')];
            rowHeaders = ['-', ...s1.split('')];

            this.visualizer.renderGrid(s1.length + 1, s2.length + 1, rowHeaders, colHeaders, true);
        }

        this._attachInputListeners();
    }

    _attachInputListeners() {
        const inputs = document.querySelectorAll('.grid-cell input');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this._validateSingleInput(e.target);
            });
        });
    }

    _validateSingleInput(inputElement) {
        const r = parseInt(inputElement.dataset.row);
        const c = parseInt(inputElement.dataset.col);
        const userVal = parseInt(inputElement.value);
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
        let allCorrect = true;
        let score = 0;
        let total = 0;

        inputs.forEach(input => {
            const r = parseInt(input.dataset.row);
            const c = parseInt(input.dataset.col);
            const userVal = parseInt(input.value);
            const correctVal = this.answerKey[r][c];
            total++;

            input.parentElement.classList.remove('correct', 'incorrect');

            if (userVal === correctVal) {
                input.parentElement.classList.add('correct');
                score++;
            } else {
                input.parentElement.classList.add('incorrect');
                allCorrect = false;
            }
        });

        return { allCorrect, score, total };
    }
}
