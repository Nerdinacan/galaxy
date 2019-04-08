export class Dataset {

    constructor(props = {}) {
        this.id = null;
        this.historyId = null;
        this.name = "";
        this.annotation = "";
        Object.assign(this, props);
    }

    static create(props = {}) {
        return new Dataset(props)
    }
}
