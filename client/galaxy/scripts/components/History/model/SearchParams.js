const lastUpdated = new Map();

export class SearchParams {

    constructor(props = {}) {
        this.filterText = "";
        this.showDeleted = false;
        this.showHidden = false;
        this.pageSize = 30;
        this._offset = 0;
        this._limit = 30;
        Object.assign(this, props);
    }

    get offset() {
        return this._offset;
    }

    set offset(val) {
        const newVal = parseInt(val);
        if (!isNaN(newVal)) {
            this._offset = Math.max(0, newVal);
        }
    }

    get limit() {
        return this._limit;
    }

    set limit(val) {
        const newVal = parseInt(val);
        if (!isNaN(newVal)) {
            this._limit = Math.max(this.pageSize, newVal);
        }
    }

    get visible() {
        return (this.hidden !== null) ? !this.hidden : null;
    }

    get contentLastUpdated() {
        return lastUpdated.get(this.contentUpdateKey) || null;
    }

    set contentLastUpdated(newDate) {
        this.markLastUpdated(newDate);
    }
    
    get contentUpdateKey() {
        return JSON.stringify(this);
    }

    markLastUpdated(nextDate = new Date()) {
        lastUpdated.set(this.contentUpdateKey, nextDate);
    }

    // this index came into view, make sure it's being updated
    expand(index) {
        this.offset = Math.min(this.offset, index);
    }

    // this index ran off the top
    clipTop(index) {
        this.offset = Math.max(this.offset, index + 1);
    }

    // debugging
    report(label = "params") {
        const { offset, limit } = this;
        console.group(label, offset, limit);
        console.dir(this);
        console.warn(offset, limit);
        console.groupEnd();
    }

    clone() {
        return new SearchParams(this);
    }

    static equals(a, b) {
        if (!(a instanceof SearchParams)) return false;
        if (!(b instanceof SearchParams)) return false;
        const same = Object.getOwnPropertyNames(a).reduce((same, prop) => {
            return same && a[prop] === b[prop];
        }, true);
        return same;
    }

    static different(instance, otherInstance) {
        return !SearchParams.equals(instance, otherInstance);
    }
}
