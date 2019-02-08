// History Model

export class History {
    constructor(props = {}) {
        this.id = null;
        this.datasets = new Map();
        Object.assign(this, props);
    }
}

export const createHistory = props => {
    return new History(props);
}


// Dataset Item

export class Dataset {
    constructor(props = {}) {
        this.id = null;
        this.history = null;
        this.name = "";
        this.annotation = "";
        Object.assign(this, props);
    }
}

export const createDataset = props => new Dataset(props);


// Search Filters for Grid

export class DatasetSearchFilter {
    constructor(props = {}) {
        this.filterText = "";
        Object.assign(this, props);
    }
    match(dataset) {
        console.log("run filter", this.filterText);
        return dataset.name.includes(this.filterText);
    }
}

export function createSearchFilters(props = {}) {
    return new DatasetSearchFilter(props);
}
