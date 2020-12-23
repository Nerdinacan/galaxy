/**
 * Functions for aggregating incoming cache updates for presentation to the
 * scroller. As cache changes roll in, the updates are summarized and sorted in
 * a SkipList for fast retrieval.
 */

import SkipList from "proper-skip-list";
import { ACTIONS } from "../db/monitorQuery";

/**
 * Fresh update map, gets built when inputs change
 */
export const newContainer = () => {
    return new SkipList();
};

/**
 * Generates a can function for consuming updates from the pouchdb-live-find.
 * Update variable will either be a big initial chunk of results matching the
 * query or a follow-up incremental change.
 * @param {*} cfg
 */
export const createAggregator = (cfg = {}) => {
    const {
        // function to extract a key from the doc.
        // this should return a hid or an element_index
        getKey = (doc) => doc._id,
    } = cfg;

    return (resultMap, update) => {
        const { initialMatches = [], action, doc } = update;

        // initial load
        if (action == ACTIONS.INITIAL && initialMatches.length) {
            initialMatches.forEach((match) => {
                resultMap.upsert(getKey(match), match);
            });
        }

        // incremental updates
        if (action && doc) {
            const key = getKey(doc);
            switch (action) {
                case ACTIONS.IGNORE:
                    console.log("ignored update", doc);
                    break;

                case ACTIONS.UPDATE:
                case ACTIONS.ADD:
                    resultMap.upsert(key, doc);
                    break;

                case ACTIONS.REMOVE:
                    resultMap.delete(key);
                    break;
            }
        }

        return resultMap;
    };
};
