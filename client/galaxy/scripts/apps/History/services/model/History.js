/**
 * Container for history steps, must be paginated bcause apparently
 * some people have like 10,000 steps in one history
 */

export class History {
    constructor(steps = []) {
        this.startIndex = 0;
        this.endIndex = null;
        this.pageSize = 10;
        this.steps = steps;
    }
    static hydrate(steps) {
        return new History(steps);
    }
}

export class HistorySummary {
    constructor(props = {}) {
        Object.assign(this, props);
    }
    static hydrate(stuff) {
        return new HistorySummary(stuff);
    }
}
