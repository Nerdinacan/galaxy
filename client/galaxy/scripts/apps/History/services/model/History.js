/**
 * Container for history steps, must be paginated bcause apparently
 * some people have like 10,000 steps in one history
 */

import { HistoryStep } from "./HistoryStep";

export class History {
    constructor(props = {}) {
        this.startIndex = 0;
        this.endIndex = null;
        this.pageSize = 10;
        Object.assign(this, props);
    }
    loadContents(steps = []) {
        this.steps = steps.map(HistoryStep.hydrate);
    }
    static hydrate(steps) {
        return new History(steps);
    }
}
