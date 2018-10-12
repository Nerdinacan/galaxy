/**
 * Container for history steps, must be paginated bcause apparently
 * some people have like 10,000 steps in one history
 */

export class History {
    constructor(initialData = []) {
        this.startIndex = 0;
        this.endIndex = null;
        this.pageSize = 10;
    }
    static hydrate(data) {
        return new History(data);
    }
}
