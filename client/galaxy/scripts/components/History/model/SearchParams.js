export class SearchParams {

    constructor(props = {}) {
        this.minPageSize = 20;
        this._offset = this.minOffset;
        this._pageSize = this.minPageSize;
        this.filterText = "";
        Object.assign(this, props);
    }

    get offset() {
        return this._offset;
    }

    set offset(val) {
        const newInt = parseInt(val);
        if (!isNaN(newInt)) {
            this._offset = Math.max(0, newInt);
        }
    }

    get pageSize() {
        return this._pageSize;
    }

    set pageSize(val) {
        const newInt = parseInt(val);
        if (!isNaN(newInt)) {
            this._pageSize = Math.max(newInt, this.minPageSize);
        }
    }

    clone() {
        return new SearchParams(this);
    }

    static equals(instance, otherInstance) {
        return JSON.stringify(instance) == JSON.stringify(otherInstance);
    }

    static create() {
        return new SearchParams();
    }
}
