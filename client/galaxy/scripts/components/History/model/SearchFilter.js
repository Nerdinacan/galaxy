export class SearchFilter {
    
    constructor(props = {}) {
        this.filterText = "";
        Object.assign(this, props);
    }
    
    match(ds) {
        return ds.name.includes(this.filterText);
    }

    clear() {
        this.filterText = "";
    }

    static create(props = {}) {
        return new SearchFilter(props);
    }
}
