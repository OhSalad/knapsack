export class HeapSolver {
    constructor(array, operation = 'build') {
        this.originalArray = [...array];
        this.array = [...array];
        this.steps = [];
        this.heapifyCalls = 0;
        this.swapCount = 0;
        this.recursiveCalls = 0;
        this.operation = operation;
    }

    buildMaxHeap() {
        this._resetState();
        this._recordInit();

        const startIndex = Math.floor(this.array.length / 2) - 1;
        this._recordInfo(startIndex);

        for (let i = startIndex; i >= 0; i--) {
            this._recordLoopStart(i);
            this._heapifyNode(i, this.array.length, 0);
            this._recordLoopEnd(i);
        }

        this._recordComplete();
        return { heap: [...this.array], steps: this.steps, stats: this._stats() };
    }

    extractMax() {
        this._resetState();
        
        // First build the max heap
        this.steps.push({
            type: 'pre-extract-build',
            array: [...this.array],
            description: `Building max-heap before extraction. Starting array: [${this.array.join(', ')}]`,
            stats: this._stats()
        });
        
        const startIndex = Math.floor(this.array.length / 2) - 1;
        for (let i = startIndex; i >= 0; i--) {
            this._heapifyNode(i, this.array.length, 0);
        }
        
        this.steps.push({
            type: 'pre-extract-complete',
            array: [...this.array],
            description: `✓ Max-heap built: [${this.array.join(', ')}]. Now extracting maximum.`,
            stats: this._stats()
        });
        
        if (this.array.length === 0) {
            this.steps.push({
                type: 'error',
                array: [...this.array],
                description: 'Cannot extract from empty heap!',
                stats: this._stats()
            });
            return { heap: [...this.array], steps: this.steps, stats: this._stats(), extractedValue: null };
        }

        const max = this.array[0];
        this.steps.push({
            type: 'extract-init',
            array: [...this.array],
            description: `Extracting maximum value: ${max}`,
            highlightIndex: 0,
            stats: this._stats()
        });

        // Move last element to root
        this.array[0] = this.array[this.array.length - 1];
        this.array.pop();

        this.steps.push({
            type: 'extract-swap-root',
            array: [...this.array],
            description: `Moved last element (${this.array[0]}) to root. Heap size: ${this.array.length}`,
            highlightIndex: 0,
            stats: this._stats()
        });

        // Heapify down from root
        if (this.array.length > 0) {
            this.steps.push({
                type: 'extract-heapify-start',
                array: [...this.array],
                description: 'Starting heapify-down from root to restore heap property',
                highlightIndex: 0,
                stats: this._stats()
            });
            this._heapifyNode(0, this.array.length, 0);
        }

        this.steps.push({
            type: 'extract-complete',
            array: [...this.array],
            description: `🎉 Extract complete! Removed: ${max}. Final heap: [${this.array.join(', ')}]`,
            extractedValue: max,
            stats: this._stats()
        });

        return { heap: [...this.array], steps: this.steps, stats: this._stats(), extractedValue: max };
    }

    insertElement(value) {
        this._resetState();
        
        // First build the max heap
        this.steps.push({
            type: 'pre-insert-build',
            array: [...this.array],
            description: `Building max-heap before insertion. Starting array: [${this.array.join(', ')}]`,
            stats: this._stats()
        });
        
        const startIndex = Math.floor(this.array.length / 2) - 1;
        for (let i = startIndex; i >= 0; i--) {
            this._heapifyNode(i, this.array.length, 0);
        }
        
        this.steps.push({
            type: 'pre-insert-complete',
            array: [...this.array],
            description: `✓ Max-heap built: [${this.array.join(', ')}]. Now inserting ${value}.`,
            stats: this._stats()
        });
        
        this.steps.push({
            type: 'insert-init',
            array: [...this.array],
            description: `Inserting new value: ${value}`,
            stats: this._stats()
        });

        // Add element at the end
        this.array.push(value);
        const insertIndex = this.array.length - 1;

        this.steps.push({
            type: 'insert-add',
            array: [...this.array],
            description: `Added ${value} at index ${insertIndex} (end of array)`,
            highlightIndex: insertIndex,
            stats: this._stats()
        });

        // Bubble up
        this._bubbleUp(insertIndex);

        this.steps.push({
            type: 'insert-complete',
            array: [...this.array],
            description: `🎉 Insert complete! Final heap: [${this.array.join(', ')}]`,
            stats: this._stats()
        });

        return { heap: [...this.array], steps: this.steps, stats: this._stats() };
    }

    _bubbleUp(index) {
        if (index === 0) {
            this.steps.push({
                type: 'bubble-complete',
                array: [...this.array],
                description: 'Element is at root. Bubble-up complete.',
                highlightIndex: index,
                stats: this._stats()
            });
            return;
        }

        const parentIndex = Math.floor((index - 1) / 2);
        
        this.steps.push({
            type: 'bubble-compare',
            index: index,
            parentIndex: parentIndex,
            array: [...this.array],
            description: `Comparing child ${this.array[index]} at [${index}] with parent ${this.array[parentIndex]} at [${parentIndex}]`,
            highlightIndex: index,
            compareIndices: [parentIndex],
            stats: this._stats()
        });

        if (this.array[index] > this.array[parentIndex]) {
            this.steps.push({
                type: 'bubble-swap',
                from: index,
                to: parentIndex,
                fromValue: this.array[index],
                toValue: this.array[parentIndex],
                array: [...this.array],
                description: `🔄 Child (${this.array[index]}) > Parent (${this.array[parentIndex]}). Swapping indices ${index} ↔ ${parentIndex}`,
                swapIndices: [index, parentIndex],
                stats: this._stats()
            });

            [this.array[index], this.array[parentIndex]] = [this.array[parentIndex], this.array[index]];
            this.swapCount++;

            this.steps.push({
                type: 'bubble-after-swap',
                array: [...this.array],
                description: `After swap: [${this.array.join(', ')}]`,
                highlightIndex: parentIndex,
                stats: this._stats()
            });

            this._bubbleUp(parentIndex);
        } else {
            this.steps.push({
                type: 'bubble-complete',
                array: [...this.array],
                description: `✓ Child (${this.array[index]}) ≤ Parent (${this.array[parentIndex]}). Heap property satisfied.`,
                highlightIndex: index,
                stats: this._stats()
            });
        }
    }

    getSwapSequence() {
        return this.steps
            .filter(step => step.type === 'swap')
            .map(step => ({ from: step.from, to: step.to, fromValue: step.fromValue, toValue: step.toValue }));
    }

    validateSwap(currentArray, fromIndex, toIndex, expectedSwaps, swapIndex) {
        if (swapIndex >= expectedSwaps.length) {
            return { valid: false, message: 'No more swaps expected!' };
        }

        const expected = expectedSwaps[swapIndex];
        const isMatch =
            (fromIndex === expected.from && toIndex === expected.to) ||
            (fromIndex === expected.to && toIndex === expected.from);

        return isMatch
            ? { valid: true, message: `✓ Correct swap! ${currentArray[fromIndex]} ↔ ${currentArray[toIndex]}` }
            : { valid: false, message: `✗ Incorrect! Expected swap at indices ${expected.from} ↔ ${expected.to}` };
    }

    _resetState() {
        this.steps = [];
        this.heapifyCalls = 0;
        this.swapCount = 0;
        this.recursiveCalls = 0;
        this.array = [...this.originalArray];
    }

    _recordInit() {
        this.steps.push({
            type: 'init',
            array: [...this.array],
            description: `Starting Build-Max-Heap on array: [${this.array.join(', ')}]`,
            stats: this._stats()
        });
    }

    _recordInfo(startIndex) {
        this.steps.push({
            type: 'info',
            array: [...this.array],
            description: `Last non-leaf node is at index ${startIndex}. Starting heapify from bottom-up.`,
            highlightIndex: startIndex,
            stats: this._stats()
        });
    }

    _recordLoopStart(loopIndex) {
        this.steps.push({
            type: 'loop-start',
            loopIndex,
            array: [...this.array],
            description: `── Loop iteration: Calling Max-Heapify on index ${loopIndex} (value: ${this.array[loopIndex]})`,
            highlightIndex: loopIndex,
            stats: this._stats()
        });
    }

    _recordLoopEnd(loopIndex) {
        this.steps.push({
            type: 'loop-end',
            loopIndex,
            array: [...this.array],
            description: `✓ Completed heapify for subtree rooted at index ${loopIndex}. Array state: [${this.array.join(', ')}]`,
            stats: this._stats()
        });
    }

    _recordComplete() {
        this.steps.push({
            type: 'complete',
            array: [...this.array],
            description: `🎉 Build-Max-Heap complete! Final heap: [${this.array.join(', ')}]`,
            stats: this._stats()
        });
    }

    _heapifyNode(i, heapSize, depth) {
        this.heapifyCalls++;
        if (depth > 0) this.recursiveCalls++;

        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let largest = i;

        this._recordHeapifyStart(i, left, right, depth);

        largest = this._pickLargestChild(i, left, right, heapSize, largest, depth);
        if (largest !== i) {
            this._swapAndRecurse(i, largest, heapSize, depth);
        } else {
            this._recordNoSwap(i, depth);
        }
    }

    _recordHeapifyStart(i, left, right, depth) {
        this.steps.push({
            type: 'heapify-start',
            index: i,
            left: left < this.array.length ? left : null,
            right: right < this.array.length ? right : null,
            array: [...this.array],
            description: `${' '.repeat(depth * 2)}Heapify(${i}): Comparing node ${i} (${this.array[i]}) with children`,
            highlightIndex: i,
            compareIndices: [left < this.array.length ? left : null, right < this.array.length ? right : null].filter(Boolean),
            depth,
            stats: this._stats()
        });
    }

    _pickLargestChild(i, left, right, heapSize, largest, depth) {
        let candidate = largest;
        if (left < heapSize && this.array[left] > this.array[candidate]) {
            this._recordCompare('Left', i, left, depth);
            candidate = left;
        }
        if (right < heapSize && this.array[right] > this.array[candidate]) {
            this._recordCompare('Right', i, right, depth);
            candidate = right;
        }
        return candidate;
    }

    _recordCompare(label, index, childIndex, depth) {
        this.steps.push({
            type: 'compare',
            index,
            compareWith: childIndex,
            array: [...this.array],
            description: `${' '.repeat(depth * 2)}${label} child (${this.array[childIndex]}) > current largest (${this.array[index]})`,
            highlightIndex: childIndex,
            stats: this._stats()
        });
    }

    _swapAndRecurse(i, largest, heapSize, depth) {
        this._recordSwap(i, largest, depth);
        [this.array[i], this.array[largest]] = [this.array[largest], this.array[i]];
        this.swapCount++;
        this._recordAfterSwap(largest, depth);
        this._recordRecurse(i, largest, depth);
        this._heapifyNode(largest, heapSize, depth + 1);
    }

    _recordSwap(i, largest, depth) {
        this.steps.push({
            type: 'swap',
            from: i,
            to: largest,
            fromValue: this.array[i],
            toValue: this.array[largest],
            array: [...this.array],
            description: `${' '.repeat(depth * 2)}🔄 Swapping: ${this.array[i]} (index ${i}) ↔ ${this.array[largest]} (index ${largest})`,
            swapIndices: [i, largest],
            stats: this._stats()
        });
    }

    _recordAfterSwap(largest, depth) {
        this.steps.push({
            type: 'after-swap',
            array: [...this.array],
            description: `${' '.repeat(depth * 2)}After swap: [${this.array.join(', ')}]`,
            highlightIndex: largest,
            stats: this._stats()
        });
    }

    _recordRecurse(fromIndex, toIndex, depth) {
        this.steps.push({
            type: 'recurse',
            fromIndex,
            toIndex,
            array: [...this.array],
            description: `${' '.repeat(depth * 2)}↪ Recursively calling Heapify on index ${toIndex}`,
            highlightIndex: toIndex,
            stats: this._stats()
        });
    }

    _recordNoSwap(index, depth) {
        this.steps.push({
            type: 'no-swap',
            index,
            array: [...this.array],
            description: `${' '.repeat(depth * 2)}✓ Node ${index} (${this.array[index]}) satisfies heap property. No swap needed.`,
            highlightIndex: index,
            stats: this._stats()
        });
    }

    _stats() {
        return {
            heapifyCalls: this.heapifyCalls,
            swapCount: this.swapCount,
            recursiveCalls: this.recursiveCalls
        };
    }
}

export function generateRandomHeapArray(size = 10, maxValue = 50) {
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * maxValue) + 1);
    }
    return array;
}
