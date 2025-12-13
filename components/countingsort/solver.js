/**
 * =============================================================================
 * COUNTING SORT ALGORITHM - LINEAR TIME SORTING
 * =============================================================================
 * 
 * ALGORITHM DESCRIPTION:
 * Counting Sort is a non-comparison-based sorting algorithm that works by
 * counting the occurrences of each unique element in the input array and
 * using arithmetic to determine the correct position of each element.
 * 
 * ALGORITHM STEPS:
 * 1. Find Maximum: Determine the maximum value k in the array
 * 2. Initialize Count Array: Create array of size (k + 1), filled with zeros
 * 3. Count Phase: Count occurrences of each element
 *    count[array[i]]++ for each element
 * 4. Cumulative Phase: Calculate prefix sums
 *    count[i] = count[i] + count[i-1]
 *    Now count[i] represents the position of element i in sorted output
 * 5. Output Phase: Build sorted array (traverse input RIGHT to LEFT for stability)
 *    output[count[array[i]] - 1] = array[i]
 *    count[array[i]]--
 * 
 * TIME COMPLEXITY: O(n + k)
 *   - Where n = number of elements in the input array
 *   - Where k = range of input values (max value + 1)
 *   - Phase 0 (Find Max): O(n)
 *   - Phase 1 (Count): O(n)
 *   - Phase 2 (Cumulative): O(k)
 *   - Phase 3 (Output): O(n)
 *   - Total: O(n + k)
 * 
 * COMPARISON WITH OTHER SORTS:
 *   - Counting Sort: O(n + k) - Best when k = O(n)
 *   - Quick Sort: O(n log n) average, O(n²) worst
 *   - Merge Sort: O(n log n) always
 *   - Heap Sort: O(n log n) always
 *   
 *   Counting Sort beats O(n log n) when k ≤ n, i.e., when range is small.
 * 
 * SPACE COMPLEXITY: O(n + k)
 *   - Count array: O(k) for storing counts of k distinct values
 *   - Output array: O(n) for storing the sorted result
 *   - Total auxiliary space: O(n + k)
 * 
 * STABILITY:
 *   This implementation is STABLE - elements with equal values maintain their
 *   relative order from the input array. Stability is achieved by traversing
 *   the input array from RIGHT to LEFT in the output phase.
 * 
 * WHY TRAVERSE RIGHT TO LEFT?
 *   - Cumulative counts give the ENDING position for each value
 *   - Processing right-to-left and decrementing ensures that earlier
 *     occurrences get placed before later ones in the output
 *   - This preserves the original relative order (stability)
 * 
 * CONSTRAINTS:
 *   - Works only with non-negative integers (or values that can be mapped to them)
 *   - Efficient only when k is not significantly larger than n
 *   - If k >> n, consider Radix Sort or comparison-based sorts
 * 
 * APPLICATIONS:
 *   - Radix Sort (as a stable subroutine)
 *   - Sorting characters in strings
 *   - Sorting integers with known, limited range
 *   - Data with discrete categories or small integer keys
 * 
 * =============================================================================
 */

export class CountingSortSolver {
    constructor(array) {
        this.originalArray = [...array];
        this.array = [...array];
        this.steps = [];
        this.countArray = [];
        this.outputArray = [];
        this.maxValue = 0;
        this.stats = {
            comparisons: 0,
            arrayAccesses: 0,
            countUpdates: 0,
            placements: 0
        };
    }

    solve() {
        this._resetState();

        // Step 1: Find maximum value
        this._findMaximum();

        // Step 2: Initialize count array
        this._initializeCountArray();

        // Step 3: Count occurrences (Phase 1)
        this._countOccurrences();

        // Step 4: Calculate cumulative counts (Phase 2)
        this._calculateCumulativeCounts();

        // Step 5: Build output array (Phase 3)
        this._buildOutputArray();

        // Step 6: Copy back to original
        this._copyToOriginal();

        return {
            sortedArray: [...this.outputArray],
            steps: this.steps,
            stats: this.stats
        };
    }

    _resetState() {
        this.steps = [];
        this.countArray = [];
        this.outputArray = [];
        this.stats = {
            comparisons: 0,
            arrayAccesses: 0,
            countUpdates: 0,
            placements: 0
        };
        this.array = [...this.originalArray];
    }

    _findMaximum() {
        this.steps.push({
            type: 'phase-start',
            phase: 'find-max',
            title: 'Phase 0: Find Maximum Value',
            description: `Starting Counting Sort on array: [${this.array.join(', ')}]<br>First, we need to find the maximum value to determine count array size.`,
            inputArray: [...this.array],
            countArray: [],
            outputArray: [],
            stats: { ...this.stats }
        });

        this.maxValue = this.array[0] || 0;
        let maxIndex = 0;

        for (let i = 0; i < this.array.length; i++) {
            this.stats.arrayAccesses++;
            this.stats.comparisons++;

            const isNewMax = this.array[i] > this.maxValue;

            this.steps.push({
                type: 'find-max',
                phase: 'find-max',
                currentIndex: i,
                currentValue: this.array[i],
                currentMax: this.maxValue,
                maxIndex: maxIndex,
                isNewMax: isNewMax,
                description: isNewMax
                    ? `🔍 Checking array[${i}] = ${this.array[i]} > current max ${this.maxValue} → New maximum found!`
                    : `🔍 Checking array[${i}] = ${this.array[i]} ≤ current max ${this.maxValue} → No change`,
                inputArray: [...this.array],
                countArray: [],
                outputArray: [],
                highlightInputIndex: i,
                highlightMaxIndex: maxIndex,
                stats: { ...this.stats }
            });

            if (isNewMax) {
                this.maxValue = this.array[i];
                maxIndex = i;
            }
        }

        this.steps.push({
            type: 'find-max-complete',
            phase: 'find-max',
            maxValue: this.maxValue,
            description: `✓ Maximum value found: ${this.maxValue}. Count array will have size ${this.maxValue + 1} (indices 0 to ${this.maxValue}).`,
            inputArray: [...this.array],
            countArray: [],
            outputArray: [],
            stats: { ...this.stats }
        });
    }

    _initializeCountArray() {
        this.countArray = new Array(this.maxValue + 1).fill(0);
        this.outputArray = new Array(this.array.length).fill(null);

        this.steps.push({
            type: 'phase-start',
            phase: 'count',
            title: 'Phase 1: Count Occurrences',
            description: `Created count array of size ${this.maxValue + 1} (initialized to zeros).<br>Now counting how many times each value appears in the input array.`,
            inputArray: [...this.array],
            countArray: [...this.countArray],
            outputArray: [...this.outputArray],
            stats: { ...this.stats }
        });
    }

    _countOccurrences() {
        for (let i = 0; i < this.array.length; i++) {
            const value = this.array[i];
            const oldCount = this.countArray[value];
            this.countArray[value]++;
            this.stats.arrayAccesses++;
            this.stats.countUpdates++;

            this.steps.push({
                type: 'count',
                phase: 'count',
                inputIndex: i,
                value: value,
                oldCount: oldCount,
                newCount: this.countArray[value],
                description: `📊 Loop ${i + 1}/${this.array.length}: array[${i}] = ${value}<br>count[${value}]++ → ${oldCount} becomes ${this.countArray[value]}`,
                inputArray: [...this.array],
                countArray: [...this.countArray],
                outputArray: [...this.outputArray],
                highlightInputIndex: i,
                highlightCountIndex: value,
                loopInfo: {
                    variable: 'i',
                    current: i,
                    max: this.array.length - 1,
                    code: `count[array[${i}]]++ → count[${value}]++`
                },
                stats: { ...this.stats }
            });
        }

        this.steps.push({
            type: 'count-complete',
            phase: 'count',
            description: `✓ Phase 1 complete! Count array shows frequency of each value:<br>[${this.countArray.join(', ')}]`,
            inputArray: [...this.array],
            countArray: [...this.countArray],
            outputArray: [...this.outputArray],
            stats: { ...this.stats }
        });
    }

    _calculateCumulativeCounts() {
        this.steps.push({
            type: 'phase-start',
            phase: 'cumulative',
            title: 'Phase 2: Calculate Cumulative Counts',
            description: `Now calculating cumulative (prefix) sums.<br>count[i] = count[i] + count[i-1]<br>This tells us the ending position for each value in sorted output.`,
            inputArray: [...this.array],
            countArray: [...this.countArray],
            outputArray: [...this.outputArray],
            stats: { ...this.stats }
        });

        for (let i = 1; i <= this.maxValue; i++) {
            const oldValue = this.countArray[i];
            const previousValue = this.countArray[i - 1];
            this.countArray[i] += this.countArray[i - 1];
            this.stats.countUpdates++;

            this.steps.push({
                type: 'cumulative',
                phase: 'cumulative',
                countIndex: i,
                oldValue: oldValue,
                previousValue: previousValue,
                newValue: this.countArray[i],
                description: `🔢 Loop ${i}/${this.maxValue}: count[${i}] = count[${i}] + count[${i - 1}]<br>${oldValue} + ${previousValue} = ${this.countArray[i]}`,
                inputArray: [...this.array],
                countArray: [...this.countArray],
                outputArray: [...this.outputArray],
                highlightCountIndex: i,
                highlightPrevCountIndex: i - 1,
                loopInfo: {
                    variable: 'i',
                    current: i,
                    max: this.maxValue,
                    code: `count[${i}] = count[${i}] + count[${i - 1}] = ${oldValue} + ${previousValue}`
                },
                stats: { ...this.stats }
            });
        }

        this.steps.push({
            type: 'cumulative-complete',
            phase: 'cumulative',
            description: `✓ Phase 2 complete! Cumulative counts:<br>[${this.countArray.join(', ')}]<br>Each count[i] now represents the ending position (1-indexed) for value i.`,
            inputArray: [...this.array],
            countArray: [...this.countArray],
            outputArray: [...this.outputArray],
            stats: { ...this.stats }
        });
    }

    _buildOutputArray() {
        this.steps.push({
            type: 'phase-start',
            phase: 'output',
            title: 'Phase 3: Build Sorted Output',
            description: `Building output array by traversing input from RIGHT to LEFT (for stability).<br>For each element, place it at position count[value] - 1, then decrement count[value].`,
            inputArray: [...this.array],
            countArray: [...this.countArray],
            outputArray: [...this.outputArray],
            stats: { ...this.stats }
        });

        // Traverse from right to left for stability
        for (let i = this.array.length - 1; i >= 0; i--) {
            const value = this.array[i];
            const countBefore = this.countArray[value]; // Store count BEFORE any changes
            const position = countBefore - 1;
            this.outputArray[position] = value;
            this.countArray[value]--;
            const countAfter = this.countArray[value];
            this.stats.arrayAccesses += 2;
            this.stats.placements++;

            this.steps.push({
                type: 'output',
                phase: 'output',
                inputIndex: i,
                value: value,
                outputPosition: position,
                countBefore: countBefore, // The count value BEFORE decrement
                countAfter: countAfter,   // The count value AFTER decrement
                countBeforeDecrement: countBefore,
                countAfterDecrement: countAfter,
                description: `📍 Loop ${this.array.length - i}/${this.array.length}: array[${i}] = ${value}<br>Position = count[${value}] - 1 = ${countBefore} - 1 = ${position}<br>output[${position}] = ${value}, then count[${value}]-- → ${countAfter}`,
                inputArray: [...this.array],
                countArray: [...this.countArray],
                outputArray: [...this.outputArray],
                highlightInputIndex: i,
                highlightCountIndex: value,
                highlightOutputIndex: position,
                loopInfo: {
                    variable: 'i',
                    current: i,
                    min: 0,
                    direction: 'decrement',
                    code: `output[count[${value}] - 1] = ${value}`
                },
                stats: { ...this.stats }
            });
        }

        this.steps.push({
            type: 'output-complete',
            phase: 'output',
            description: `✓ Phase 3 complete! Output array is now sorted:<br>[${this.outputArray.join(', ')}]`,
            inputArray: [...this.array],
            countArray: [...this.countArray],
            outputArray: [...this.outputArray],
            stats: { ...this.stats }
        });
    }

    _copyToOriginal() {
        this.steps.push({
            type: 'complete',
            phase: 'complete',
            title: '🎉 Counting Sort Complete!',
            description: `Sorting finished! Final sorted array: [${this.outputArray.join(', ')}]<br><br><strong>Summary:</strong><br>• Array Accesses: ${this.stats.arrayAccesses}<br>• Count Updates: ${this.stats.countUpdates}<br>• Placements: ${this.stats.placements}<br>• Time Complexity: O(n + k) where n=${this.array.length}, k=${this.maxValue + 1}`,
            inputArray: [...this.array],
            countArray: [...this.countArray],
            outputArray: [...this.outputArray],
            sortedArray: [...this.outputArray],
            stats: { ...this.stats }
        });
    }
}

export function generateRandomCountingSortArray(size = 10, maxValue = 9) {
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * (maxValue + 1)));
    }
    return array;
}
