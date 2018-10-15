/**
 * HistoryCollection
 */

import { History } from "./History";

export class HistoryCollection {
    constructor(rawListData) {
        this.histories = rawListData.map(History.hydrate);
    }
    addHistory(raw) {
        let newHistory = new History(raw);
        this.histories = [...this.histories, newHistory];
        return newHistory;
    }
    static hydrate(data) {
        debugger;
        return new HistoryCollection(data);
    }
}
