export class LCSSolver {
    constructor(str1, str2) {
        this.str1 = str1;
        this.str2 = str2;
        this.rows = str1.length;
        this.cols = str2.length;
        this.dp = [];
        this.steps = [];
    }

    solve() {
        this._resetState();
        this._buildTable();
        return { dp: this.dp, steps: this.steps };
    }

    _resetState() {
        this.dp = Array(this.rows + 1)
            .fill(null)
            .map(() => Array(this.cols + 1).fill(0));
        this.steps = [];
    }

    _buildTable() {
        for (let i = 0; i <= this.rows; i++) {
            for (let j = 0; j <= this.cols; j++) {
                if (i === 0 || j === 0) {
                    this._handleBaseCell(i, j);
                    continue;
                }
                this._handleDecisionCell(i, j);
            }
        }
    }

    _handleBaseCell(row, col) {
        this.dp[row][col] = 0;
        this.steps.push({
            row,
            col,
            type: 'update',
            value: 0,
            description: 'Base case: 0 length.'
        });
    }

    _handleDecisionCell(row, col) {
        const char1 = this.str1[row - 1];
        const char2 = this.str2[col - 1];

        if (char1 === char2) {
            this._recordMatch(row, col, char1, char2);
            return;
        }

        this._recordMismatch(row, col, char1, char2);
        this.dp[row][col] = Math.max(this.dp[row - 1][col], this.dp[row][col - 1]);
        this._recordMismatchResult(row, col);
    }

    _recordMatch(row, col, char1, char2) {
        this.steps.push({
            row,
            col,
            type: 'inspect',
            value: '?',
            description: `Match '${char1}' == '${char2}'.`,
            highlight: [{ r: row - 1, c: col - 1 }]
        });

        this.dp[row][col] = 1 + this.dp[row - 1][col - 1];

        this.steps.push({
            row,
            col,
            type: 'update',
            value: this.dp[row][col],
            description: `Match found! Value = ${this.dp[row][col]}`,
            highlight: [{ r: row - 1, c: col - 1 }]
        });
    }

    _recordMismatch(row, col, char1, char2) {
        this.steps.push({
            row,
            col,
            type: 'inspect',
            value: '?',
            description: `No match '${char1}' != '${char2}'. Max of top/left.`,
            highlight: [
                { r: row - 1, c: col },
                { r: row, c: col - 1 }
            ]
        });
    }

    _recordMismatchResult(row, col) {
        const topVal = this.dp[row - 1][col];
        const leftVal = this.dp[row][col - 1];

        this.steps.push({
            row,
            col,
            type: 'update',
            value: this.dp[row][col],
            description: `Max value is ${this.dp[row][col]}`,
            highlight: topVal > leftVal ? [{ r: row - 1, c: col }] : [{ r: row, c: col - 1 }]
        });
    }
}

export function generateRandomLCS() {
    const chars = 'ABCDEF';
    const len1 = Math.floor(Math.random() * 4) + 6;
    const len2 = Math.floor(Math.random() * 4) + 6;
    const s1 = Array.from({ length: len1 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const s2 = Array.from({ length: len2 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return { s1, s2 };
}
