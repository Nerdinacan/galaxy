/**
 * An aggregate query uses a monitor to look at a configured pouchDB instance,
 * then accepts a selector as the source and emits the complete matching result
 * set to the parameters over time.
 */

// aggregation with a skiplist
export { aggregateQuery } from "./aggregateQuery";
