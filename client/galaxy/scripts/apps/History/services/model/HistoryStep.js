/**
 * Step in a history
 */

export class HistoryStep {
    constructor(stepProps = {}) {
        Object.assign(this, stepProps);
    }
    static hydrate(stepProps) {
        return new HistoryStep(stepProps);
    }
}
