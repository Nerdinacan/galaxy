// Filter returned results
export class SearchFilter {
    
    constructor(props = {}) {
        this.filterText = "";
    }
    
    match(ds) {
        return ds.name.includes(this.filterText);
    }

    clear() {
        this.filterText = "";
    }

}
