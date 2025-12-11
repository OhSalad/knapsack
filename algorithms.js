class KnapsackSolver {
    constructor(capacity, weights, values) {
        this.capacity = capacity;
        this.weights = weights;
        this.values = values;
        this.n = weights.length;
        this.dp = [];
        this.steps = [];
    }

    solve() {
        this.dp = Array(this.n + 1).fill().map(() => Array(this.capacity + 1).fill(0));

        for (let i = 0; i <= this.n; i++) {
            for (let w = 0; w <= this.capacity; w++) {

                if (i === 0 || w === 0) {
                    this.dp[i][w] = 0;
                    this.steps.push({
                        row: i,
                        col: w,
                        type: 'update',
                        value: 0,
                        description: `Base case: 0 items or 0 capacity = 0 value.`
                    });
                    continue;
                }

                const currentWeight = this.weights[i - 1];
                const currentValue = this.values[i - 1];

                if (currentWeight <= w) {
                    const includeVal = currentValue + this.dp[i - 1][w - currentWeight];
                    const excludeVal = this.dp[i - 1][w];

                    this.steps.push({
                        row: i,
                        col: w,
                        type: 'inspect',
                        value: '?',
                        description: `Comparing: Include item ${i} (${includeVal}) vs Exclude (${excludeVal}).`,
                        highlight: [{ r: i - 1, c: w - currentWeight }, { r: i - 1, c: w }]
                    });

                    this.dp[i][w] = Math.max(includeVal, excludeVal);

                    this.steps.push({
                        row: i,
                        col: w,
                        type: 'update',
                        value: this.dp[i][w],
                        description: `Set value to ${this.dp[i][w]}.`,
                        highlight: includeVal > excludeVal ? [{ r: i - 1, c: w - currentWeight }] : [{ r: i - 1, c: w }]
                    });

                } else {
                    this.steps.push({
                        row: i,
                        col: w,
                        type: 'inspect',
                        value: '?',
                        description: `Item ${i} (Weight: ${currentWeight}) > Capacity ${w}. Excluding.`,
                        highlight: [{ r: i - 1, c: w }]
                    });

                    this.dp[i][w] = this.dp[i - 1][w];

                    this.steps.push({
                        row: i,
                        col: w,
                        type: 'update',
                        value: this.dp[i][w],
                        description: `Value copied from above: ${this.dp[i][w]}`,
                        highlight: [{ r: i - 1, c: w }]
                    });
                }
            }
        }
        return { dp: this.dp, steps: this.steps };
    }
}

class LCSSolver {
    constructor(str1, str2) {
        this.str1 = str1;
        this.str2 = str2;
        this.m = str1.length;
        this.n = str2.length;
        this.dp = [];
        this.steps = [];
    }

    solve() {
        this.dp = Array(this.m + 1).fill().map(() => Array(this.n + 1).fill(0));

        for (let i = 0; i <= this.m; i++) {
            for (let j = 0; j <= this.n; j++) {

                if (i === 0 || j === 0) {
                    this.dp[i][j] = 0;
                    this.steps.push({
                        row: i,
                        col: j,
                        type: 'update',
                        value: 0,
                        description: `Base case: 0 length.`,
                    });
                    continue;
                }

                const char1 = this.str1[i - 1];
                const char2 = this.str2[j - 1];

                if (char1 === char2) {
                    this.steps.push({
                        row: i,
                        col: j,
                        type: 'inspect',
                        value: '?',
                        description: `Match '${char1}' == '${char2}'.`,
                        highlight: [{ r: i - 1, c: j - 1 }]
                    });

                    this.dp[i][j] = 1 + this.dp[i - 1][j - 1];

                    this.steps.push({
                        row: i,
                        col: j,
                        type: 'update',
                        value: this.dp[i][j],
                        description: `Match found! Value = ${this.dp[i][j]}`,
                        highlight: [{ r: i - 1, c: j - 1 }]
                    });

                } else {
                    this.steps.push({
                        row: i,
                        col: j,
                        type: 'inspect',
                        value: '?',
                        description: `No match '${char1}' != '${char2}'. Max of top/left.`,
                        highlight: [{ r: i - 1, c: j }, { r: i, c: j - 1 }]
                    });

                    this.dp[i][j] = Math.max(this.dp[i - 1][j], this.dp[i][j - 1]);

                    this.steps.push({
                        row: i,
                        col: j,
                        type: 'update',
                        value: this.dp[i][j],
                        description: `Max value is ${this.dp[i][j]}`,
                        highlight: this.dp[i - 1][j] > this.dp[i][j - 1] ? [{ r: i - 1, c: j }] : [{ r: i, c: j - 1 }]
                    });
                }
            }
        }
        return { dp: this.dp, steps: this.steps };
    }
}

// Helpers
function generateRandomKnapsack(capacityConfig, itemCountConfig) {
    const capacity = capacityConfig || 10;
    const count = itemCountConfig || 8;

    const weights = [];
    const values = [];

    // Weights should be small since capacity is small (e.g. 10)
    // We want items that fit. Max weight should probably be <= 60% of capacity to be interesting
    // or simply 1 to 8. User requested "10 weight max".

    for (let i = 0; i < count; i++) {
        // Random weight between 1 and 10
        weights.push(Math.floor(Math.random() * 9) + 1);
        // Random value between 5 and 30
        values.push(Math.floor(Math.random() * 25) + 5);
    }
    return { capacity, weights, values };
}

function generateRandomLCS() {
    const chars = "ABCDEF";
    const len1 = Math.floor(Math.random() * 4) + 6; // 6-9 chars
    const len2 = Math.floor(Math.random() * 4) + 6;
    let s1 = "";
    let s2 = "";
    for (let i = 0; i < len1; i++) s1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < len2; i++) s2 += chars.charAt(Math.floor(Math.random() * chars.length));
    return { s1, s2 };
}
