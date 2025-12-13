/**
 * =============================================================================
 * 0/1 KNAPSACK PROBLEM - DYNAMIC PROGRAMMING SOLUTION
 * =============================================================================
 * 
 * PROBLEM DESCRIPTION:
 * Given a set of items, each with a weight and a value, determine the maximum
 * value that can be obtained by selecting items such that their total weight
 * does not exceed a given capacity. Each item can only be taken once (0/1).
 * 
 * ALGORITHM APPROACH:
 * This implementation uses bottom-up Dynamic Programming (tabulation).
 * We build a 2D table dp[i][w] where:
 *   - i = number of items considered (0 to n)
 *   - w = current capacity being evaluated (0 to W)
 *   - dp[i][w] = maximum value achievable with first i items and capacity w
 * 
 * RECURRENCE RELATION:
 *   dp[i][w] = max(
 *       dp[i-1][w],                              // Exclude item i
 *       dp[i-1][w-weight[i]] + value[i]          // Include item i (if weight[i] <= w)
 *   )
 * 
 * BASE CASE:
 *   dp[0][w] = 0 for all w (no items = no value)
 *   dp[i][0] = 0 for all i (no capacity = no value)
 * 
 * TIME COMPLEXITY: O(n * W)
 *   - Where n = number of items
 *   - Where W = knapsack capacity
 *   - We fill each cell of the (n+1) × (W+1) table exactly once
 * 
 * SPACE COMPLEXITY: O(n * W)
 *   - For the 2D DP table of size (n+1) × (W+1)
 *   - Can be optimized to O(W) using rolling array technique
 * 
 * OPTIMAL SUBSTRUCTURE:
 *   The optimal solution for n items can be constructed from optimal
 *   solutions for fewer items (either including or excluding the nth item).
 * 
 * OVERLAPPING SUBPROBLEMS:
 *   The same subproblems dp[i][w] are computed multiple times in the
 *   naive recursive approach, justifying the use of dynamic programming.
 * 
 * =============================================================================
 */

export class KnapsackSolver {
    constructor(capacity, weights, values) {
        this.capacity = capacity;
        this.weights = weights;
        this.values = values;
        this.itemCount = weights.length;
        this.dp = [];
        this.steps = [];
    }

    solve() {
        this._resetState();
        this._buildTable();
        return { dp: this.dp, steps: this.steps };
    }

    _resetState() {
        this.dp = Array(this.itemCount + 1)
            .fill(null)
            .map(() => Array(this.capacity + 1).fill(0));
        this.steps = [];
    }

    _buildTable() {
        for (let i = 0; i <= this.itemCount; i++) {
            for (let w = 0; w <= this.capacity; w++) {
                if (i === 0 || w === 0) {
                    this._handleBaseCell(i, w);
                    continue;
                }
                this._handleDecisionCell(i, w);
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
            description: 'Base case: 0 items or 0 capacity = 0 value.'
        });
    }

    _handleDecisionCell(row, col) {
        const currentWeight = this.weights[row - 1];
        const currentValue = this.values[row - 1];

        if (currentWeight > col) {
            this._recordExclude(row, col, currentWeight);
            return;
        }

        const includeVal = currentValue + this.dp[row - 1][col - currentWeight];
        const excludeVal = this.dp[row - 1][col];

        this._recordInspect(row, col, includeVal, excludeVal, currentWeight);
        this.dp[row][col] = Math.max(includeVal, excludeVal);
        this._recordUpdate(row, col, includeVal, excludeVal, currentWeight);
    }

    _recordInspect(row, col, includeVal, excludeVal, weight) {
        this.steps.push({
            row,
            col,
            type: 'inspect',
            value: '?',
            description: `Comparing: Include item ${row} (${includeVal}) vs Exclude (${excludeVal}).`,
            highlight: [
                { r: row - 1, c: col - weight },
                { r: row - 1, c: col }
            ]
        });
    }

    _recordUpdate(row, col, includeVal, excludeVal, weight) {
        const preferInclude = includeVal > excludeVal;
        this.steps.push({
            row,
            col,
            type: 'update',
            value: this.dp[row][col],
            description: `Set value to ${this.dp[row][col]}.`,
            highlight: preferInclude
                ? [{ r: row - 1, c: col - weight }]
                : [{ r: row - 1, c: col }]
        });
    }

    _recordExclude(row, col, weight) {
        this.steps.push({
            row,
            col,
            type: 'inspect',
            value: '?',
            description: `Item ${row} (Weight: ${weight}) > Capacity ${col}. Excluding.`,
            highlight: [{ r: row - 1, c: col }]
        });

        this.dp[row][col] = this.dp[row - 1][col];

        this.steps.push({
            row,
            col,
            type: 'update',
            value: this.dp[row][col],
            description: `Value copied from above: ${this.dp[row][col]}`,
            highlight: [{ r: row - 1, c: col }]
        });
    }
}

export function generateRandomKnapsack(capacity = 10, itemCount = 8) {
    const weights = [];
    const values = [];

    for (let i = 0; i < itemCount; i++) {
        weights.push(Math.floor(Math.random() * 9) + 1);
        values.push(Math.floor(Math.random() * 25) + 5);
    }

    return { capacity, weights, values };
}
