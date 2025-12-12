export class HeapBuilder {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.array = [];
        this.isActive = false;
        this._attachGlobalListeners();
    }

    init(initialArray = []) {
        this.array = initialArray.length ? [...initialArray] : [10];
        this.isActive = true;
        this.render();
        this._updateStatus('Builder Mode: Click ghost node (+) to add a child. Click numbers to edit.');
    }

    render() {
        if (!this.isActive) return;
        this.visualizer.renderHeap(this.array, { editable: true, ghostIndex: this.array.length });
        this._updateCount();
        this._renderArrayPreview();
    }

    addNode(value = null) {
        const val = value !== null ? value : Math.floor(Math.random() * 90) + 10;
        this.array.push(val);
        this.render();
    }

    updateNode(index, value) {
        if (index >= 0 && index < this.array.length) {
            this.array[index] = parseInt(value, 10) || 0;
        }
    }

    clear() {
        this.array = [];
        this.render();
    }

    stop() {
        this.isActive = false;
    }

    getArray() {
        return [...this.array];
    }

    _updateStatus(msg) {
        const el = document.getElementById('status-text');
        if (el) el.textContent = msg;
    }

    _renderArrayPreview() {
        const previewEl = document.getElementById('heap-array-preview');
        if (!previewEl) return;
        previewEl.innerHTML = '';
        this.array.forEach((val, i) => {
            const tag = document.createElement('div');
            tag.className = 'heap-array-tag';
            tag.textContent = `[${i}]: ${val}`;
            previewEl.appendChild(tag);
        });
    }

    _updateCount() {
        const countEl = document.getElementById('cell-count');
        if (countEl) countEl.textContent = this.array.length;
    }

    _attachGlobalListeners() {
        document.addEventListener('click', (e) => {
            if (!this.isActive) return;
            if (e.target.closest('.heap-node.ghost')) this.addNode();
        });

        document.addEventListener('input', (e) => {
            if (!this.isActive) return;
            if (e.target.classList.contains('node-input')) {
                const index = parseInt(e.target.dataset.index, 10);
                this.updateNode(index, e.target.value);
            }
        });
    }
}
