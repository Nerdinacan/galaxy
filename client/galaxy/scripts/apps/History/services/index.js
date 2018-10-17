// ajax function exposed as observables
export { getHistories, getHistoryById, getHistoryContents } from "./historyServices";

// current history as an observable stream
export { setCurrentHistoryId, currentHistory } from "./currentHistory";
