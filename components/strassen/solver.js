/**
 * =============================================================================
 * STRASSEN'S MATRIX MULTIPLICATION - DIVIDE AND CONQUER
 * =============================================================================
 * 
 * ALGORITHM DESCRIPTION:
 * Strassen's algorithm multiplies two n×n matrices faster than the conventional
 * O(n³) algorithm by reducing the number of recursive multiplications from 8 to 7.
 * 
 * CONVENTIONAL vs STRASSEN:
 *   Conventional: 8 multiplications + 4 additions per recursion
 *   Strassen:     7 multiplications + 18 additions/subtractions per recursion
 * 
 * THE 7 STRASSEN PRODUCTS (M1 to M7):
 *   Given matrices A and B split into quadrants:
 *   A = | A11  A12 |    B = | B11  B12 |
 *       | A21  A22 |        | B21  B22 |
 * 
 *   M1 = (A11 + A22) × (B11 + B22)
 *   M2 = (A21 + A22) × B11
 *   M3 = A11 × (B12 - B22)
 *   M4 = A22 × (B21 - B11)
 *   M5 = (A11 + A12) × B22
 *   M6 = (A21 - A11) × (B11 + B12)
 *   M7 = (A12 - A22) × (B21 + B22)
 * 
 * RESULT QUADRANTS:
 *   C11 = M1 + M4 - M5 + M7
 *   C12 = M3 + M5
 *   C21 = M2 + M4
 *   C22 = M1 - M2 + M3 + M6
 * 
 * TIME COMPLEXITY: O(n^log₂7) ≈ O(n^2.807)
 *   - Recurrence: T(n) = 7T(n/2) + O(n²)
 *   - By Master Theorem: O(n^log₂7)
 *   - log₂7 ≈ 2.807, which is less than 3
 * 
 * COMPARISON:
 *   n=2:    Naive=8 mults,    Strassen=7 mults    (12.5% savings)
 *   n=4:    Naive=64 mults,   Strassen=49 mults   (23% savings)
 *   n=8:    Naive=512 mults,  Strassen=343 mults  (33% savings)
 *   n=1024: Naive=1B mults,   Strassen=200M mults (80% savings!)
 * 
 * SPACE COMPLEXITY: O(n² log n)
 *   - Each recursion level creates temporary matrices of size n²/4
 *   - With log₂n recursion levels, total space is O(n² log n)
 * 
 * BASE CASE:
 *   When n = 1, perform simple scalar multiplication.
 *   (In practice, switch to naive method for small n due to overhead)
 * 
 * LIMITATIONS:
 *   - Only works for n×n matrices where n is a power of 2
 *   - Can pad matrices with zeros to achieve power-of-2 size
 *   - Numerical stability can be worse than naive method
 *   - Overhead makes it slower for small matrices (n < 64 typically)
 * 
 * APPLICATIONS:
 *   - Large-scale scientific computing
 *   - Graphics transformations
 *   - Machine learning (neural network training)
 *   - Signal processing
 * 
 * =============================================================================
 */

export class StrassenSolver {
    constructor(matrixA, matrixB) {
        this.matrixA = matrixA;
        this.matrixB = matrixB;
        this.n = matrixA.length;
        this.steps = [];
        this.result = null;
        this.stats = {
            multiplications: 0,
            additions: 0,
            recursionDepth: 0,
            maxDepth: 0
        };
    }

    solve() {
        this._resetState();

        this.steps.push({
            type: 'init',
            phase: 'setup',
            title: 'Initialize Strassen Algorithm',
            description: `Multiplying two ${this.n}×${this.n} matrices using Strassen's divide-and-conquer approach.<br>
                         <strong>Key Insight:</strong> Uses 7 multiplications instead of 8 per recursion level.`,
            matrixA: this._copyMatrix(this.matrixA),
            matrixB: this._copyMatrix(this.matrixB),
            result: null,
            stats: { ...this.stats }
        });

        this.result = this._strassen(this.matrixA, this.matrixB, 0);

        this.steps.push({
            type: 'complete',
            phase: 'complete',
            title: '🎉 Strassen Multiplication Complete!',
            description: `Final result computed!<br><br>
                         <strong>Statistics:</strong><br>
                         • Multiplications: ${this.stats.multiplications}<br>
                         • Additions/Subtractions: ${this.stats.additions}<br>
                         • Max Recursion Depth: ${this.stats.maxDepth}<br><br>
                         <em>Naive approach would need ${Math.pow(this.n, 3)} multiplications!</em>`,
            matrixA: this._copyMatrix(this.matrixA),
            matrixB: this._copyMatrix(this.matrixB),
            result: this._copyMatrix(this.result),
            stats: { ...this.stats }
        });

        return {
            result: this.result,
            steps: this.steps,
            stats: this.stats
        };
    }

    _resetState() {
        this.steps = [];
        this.result = null;
        this.stats = {
            multiplications: 0,
            additions: 0,
            recursionDepth: 0,
            maxDepth: 0
        };
    }

    _strassen(A, B, depth) {
        const n = A.length;
        this.stats.recursionDepth = depth;
        this.stats.maxDepth = Math.max(this.stats.maxDepth, depth);

        // Base case: 1x1 matrix
        if (n === 1) {
            this.stats.multiplications++;
            const result = [[A[0][0] * B[0][0]]];

            this.steps.push({
                type: 'base-case',
                phase: 'multiply',
                depth: depth,
                description: `Base case: ${A[0][0]} × ${B[0][0]} = ${result[0][0]}`,
                matrixA: this._copyMatrix(A),
                matrixB: this._copyMatrix(B),
                result: this._copyMatrix(result),
                stats: { ...this.stats }
            });

            return result;
        }

        // For 2x2 matrices, show the Strassen products visualization
        if (n === 2) {
            return this._strassen2x2(A, B, depth);
        }

        // Split matrices into quadrants
        const mid = n / 2;
        const [A11, A12, A21, A22] = this._splitMatrix(A);
        const [B11, B12, B21, B22] = this._splitMatrix(B);

        this.steps.push({
            type: 'divide',
            phase: 'divide',
            depth: depth,
            title: `Divide (Depth ${depth})`,
            description: `Splitting ${n}×${n} matrices into four ${mid}×${mid} quadrants each.`,
            matrixA: this._copyMatrix(A),
            matrixB: this._copyMatrix(B),
            quadrantsA: { A11, A12, A21, A22 },
            quadrantsB: { B11, B12, B21, B22 },
            stats: { ...this.stats }
        });

        // Compute the 7 Strassen products
        const M1 = this._strassen(this._addMatrices(A11, A22), this._addMatrices(B11, B22), depth + 1);
        const M2 = this._strassen(this._addMatrices(A21, A22), B11, depth + 1);
        const M3 = this._strassen(A11, this._subtractMatrices(B12, B22), depth + 1);
        const M4 = this._strassen(A22, this._subtractMatrices(B21, B11), depth + 1);
        const M5 = this._strassen(this._addMatrices(A11, A12), B22, depth + 1);
        const M6 = this._strassen(this._subtractMatrices(A21, A11), this._addMatrices(B11, B12), depth + 1);
        const M7 = this._strassen(this._subtractMatrices(A12, A22), this._addMatrices(B21, B22), depth + 1);

        // Combine to get result quadrants
        const C11 = this._addMatrices(this._subtractMatrices(this._addMatrices(M1, M4), M5), M7);
        const C12 = this._addMatrices(M3, M5);
        const C21 = this._addMatrices(M2, M4);
        const C22 = this._addMatrices(this._subtractMatrices(this._addMatrices(M1, M3), M2), M6);

        const result = this._combineQuadrants(C11, C12, C21, C22);

        this.steps.push({
            type: 'combine',
            phase: 'combine',
            depth: depth,
            title: `Combine (Depth ${depth})`,
            description: `Combining quadrants to form ${n}×${n} result matrix.`,
            result: this._copyMatrix(result),
            quadrantsC: { C11, C12, C21, C22 },
            stats: { ...this.stats }
        });

        return result;
    }

    _strassen2x2(A, B, depth) {
        // Extract elements
        const a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];
        const e = B[0][0], f = B[0][1], g = B[1][0], h = B[1][1];

        this.steps.push({
            type: 'strassen-2x2-start',
            phase: 'products',
            depth: depth,
            title: `Strassen 2×2 (Depth ${depth})`,
            description: `Computing 7 Strassen products for 2×2 matrices.<br>
                         A = [[${a}, ${b}], [${c}, ${d}]]<br>
                         B = [[${e}, ${f}], [${g}, ${h}]]`,
            matrixA: this._copyMatrix(A),
            matrixB: this._copyMatrix(B),
            stats: { ...this.stats }
        });

        // M1 = (a + d) × (e + h)
        const M1 = (a + d) * (e + h);
        this.stats.multiplications++;
        this.stats.additions += 2;

        this.steps.push({
            type: 'strassen-product',
            phase: 'products',
            product: 'M1',
            formula: 'M1 = (A11 + A22) × (B11 + B22)',
            calculation: `M1 = (${a} + ${d}) × (${e} + ${h}) = ${a + d} × ${e + h} = ${M1}`,
            value: M1,
            depth: depth,
            stats: { ...this.stats }
        });

        // M2 = (c + d) × e
        const M2 = (c + d) * e;
        this.stats.multiplications++;
        this.stats.additions += 1;

        this.steps.push({
            type: 'strassen-product',
            phase: 'products',
            product: 'M2',
            formula: 'M2 = (A21 + A22) × B11',
            calculation: `M2 = (${c} + ${d}) × ${e} = ${c + d} × ${e} = ${M2}`,
            value: M2,
            depth: depth,
            stats: { ...this.stats }
        });

        // M3 = a × (f - h)
        const M3 = a * (f - h);
        this.stats.multiplications++;
        this.stats.additions += 1;

        this.steps.push({
            type: 'strassen-product',
            phase: 'products',
            product: 'M3',
            formula: 'M3 = A11 × (B12 - B22)',
            calculation: `M3 = ${a} × (${f} - ${h}) = ${a} × ${f - h} = ${M3}`,
            value: M3,
            depth: depth,
            stats: { ...this.stats }
        });

        // M4 = d × (g - e)
        const M4 = d * (g - e);
        this.stats.multiplications++;
        this.stats.additions += 1;

        this.steps.push({
            type: 'strassen-product',
            phase: 'products',
            product: 'M4',
            formula: 'M4 = A22 × (B21 - B11)',
            calculation: `M4 = ${d} × (${g} - ${e}) = ${d} × ${g - e} = ${M4}`,
            value: M4,
            depth: depth,
            stats: { ...this.stats }
        });

        // M5 = (a + b) × h
        const M5 = (a + b) * h;
        this.stats.multiplications++;
        this.stats.additions += 1;

        this.steps.push({
            type: 'strassen-product',
            phase: 'products',
            product: 'M5',
            formula: 'M5 = (A11 + A12) × B22',
            calculation: `M5 = (${a} + ${b}) × ${h} = ${a + b} × ${h} = ${M5}`,
            value: M5,
            depth: depth,
            stats: { ...this.stats }
        });

        // M6 = (c - a) × (e + f)
        const M6 = (c - a) * (e + f);
        this.stats.multiplications++;
        this.stats.additions += 2;

        this.steps.push({
            type: 'strassen-product',
            phase: 'products',
            product: 'M6',
            formula: 'M6 = (A21 - A11) × (B11 + B12)',
            calculation: `M6 = (${c} - ${a}) × (${e} + ${f}) = ${c - a} × ${e + f} = ${M6}`,
            value: M6,
            depth: depth,
            stats: { ...this.stats }
        });

        // M7 = (b - d) × (g + h)
        const M7 = (b - d) * (g + h);
        this.stats.multiplications++;
        this.stats.additions += 2;

        this.steps.push({
            type: 'strassen-product',
            phase: 'products',
            product: 'M7',
            formula: 'M7 = (A12 - A22) × (B21 + B22)',
            calculation: `M7 = (${b} - ${d}) × (${g} + ${h}) = ${b - d} × ${g + h} = ${M7}`,
            value: M7,
            depth: depth,
            stats: { ...this.stats }
        });

        // Compute result quadrants
        const C11 = M1 + M4 - M5 + M7;
        const C12 = M3 + M5;
        const C21 = M2 + M4;
        const C22 = M1 - M2 + M3 + M6;
        this.stats.additions += 8;

        const result = [[C11, C12], [C21, C22]];

        this.steps.push({
            type: 'strassen-2x2-combine',
            phase: 'combine',
            depth: depth,
            title: 'Combining Products',
            description: `Computing result from 7 products:<br>
                         C11 = M1 + M4 - M5 + M7 = ${M1} + ${M4} - ${M5} + ${M7} = ${C11}<br>
                         C12 = M3 + M5 = ${M3} + ${M5} = ${C12}<br>
                         C21 = M2 + M4 = ${M2} + ${M4} = ${C21}<br>
                         C22 = M1 - M2 + M3 + M6 = ${M1} - ${M2} + ${M3} + ${M6} = ${C22}`,
            products: { M1, M2, M3, M4, M5, M6, M7 },
            result: this._copyMatrix(result),
            stats: { ...this.stats }
        });

        return result;
    }

    _splitMatrix(M) {
        const n = M.length;
        const mid = n / 2;
        const M11 = [], M12 = [], M21 = [], M22 = [];

        for (let i = 0; i < mid; i++) {
            M11.push(M[i].slice(0, mid));
            M12.push(M[i].slice(mid));
            M21.push(M[i + mid].slice(0, mid));
            M22.push(M[i + mid].slice(mid));
        }

        return [M11, M12, M21, M22];
    }

    _combineQuadrants(C11, C12, C21, C22) {
        const n = C11.length * 2;
        const result = Array(n).fill(null).map(() => Array(n).fill(0));
        const mid = n / 2;

        for (let i = 0; i < mid; i++) {
            for (let j = 0; j < mid; j++) {
                result[i][j] = C11[i][j];
                result[i][j + mid] = C12[i][j];
                result[i + mid][j] = C21[i][j];
                result[i + mid][j + mid] = C22[i][j];
            }
        }

        return result;
    }

    _addMatrices(A, B) {
        const n = A.length;
        const result = Array(n).fill(null).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                result[i][j] = A[i][j] + B[i][j];
                this.stats.additions++;
            }
        }
        return result;
    }

    _subtractMatrices(A, B) {
        const n = A.length;
        const result = Array(n).fill(null).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                result[i][j] = A[i][j] - B[i][j];
                this.stats.additions++;
            }
        }
        return result;
    }

    _copyMatrix(M) {
        if (!M) return null;
        return M.map(row => [...row]);
    }
}

/**
 * Generate random square matrices for testing
 * @param {number} size - Matrix dimension (should be power of 2)
 * @param {number} maxValue - Maximum value for matrix elements
 */
export function generateRandomMatrices(size = 2, maxValue = 9) {
    // Ensure size is power of 2
    const n = Math.pow(2, Math.ceil(Math.log2(size)));

    const matrixA = [];
    const matrixB = [];

    for (let i = 0; i < n; i++) {
        const rowA = [];
        const rowB = [];
        for (let j = 0; j < n; j++) {
            rowA.push(Math.floor(Math.random() * maxValue) + 1);
            rowB.push(Math.floor(Math.random() * maxValue) + 1);
        }
        matrixA.push(rowA);
        matrixB.push(rowB);
    }

    return { matrixA, matrixB, size: n };
}

/**
 * Naive matrix multiplication for comparison
 */
export function naiveMultiply(A, B) {
    const n = A.length;
    const result = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }

    return result;
}
