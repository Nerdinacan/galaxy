const lastUpdated = new Map();

export class SearchParams {

    constructor(props = {}) {
        this.filterText = "";
        this.showDeleted = false;
        this.showHidden = false;
        this.start = null;
        this.end = null;
        Object.assign(this, props);
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

    // this one came into view
    expand(hid) {
        if (this.start === null) {
            this.start = hid;
        }
        if (this.end === null) {
            this.end = hid;
        }
        this.start = Math.min(this.start, hid);
        this.end = Math.max(this.end, hid);
        // this.report(`expand: ${hid}`);
    }

    // this one ran off the top
    clipTop(hid) {
        if (this.end === null) {
            this.end = hid;
        }
        this.end = Math.min(this.end, hid - 1);
        // this.report(`clipTop: ${hid}`);
    }

    // ran off the bottom
    clipBottom(hid) {
        if (this.start === null) {
            this.start = hid;
        }
        this.start = Math.max(this.start, hid + 1);
        // this.report(`clipBottom: ${hid}`);
    }

    // debugging
    report(label = "params") {
        const { start, end, showDeleted, showHidden } = this;
        console.group(label, `${start}-${end}`);
        console.log("showDeleted", showDeleted);
        console.log("showHidden", showHidden);
        console.dir(this);
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
