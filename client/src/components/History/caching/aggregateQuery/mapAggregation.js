import { ACTIONS } from "../db/monitorQuery";

export const newAggregationContainer = () => {
    return new Map();
}

// simple aggregator in a simple Map object
export const createAggregator = (cfg = {}) => (resultMap, update) => {
    const { getKey = (doc) => doc._id } = cfg;
    const { initialMatches = [], action, doc } = update;

    // initial load
    if (action == ACTIONS.INITIAL && initialMatches.length) {
        initialMatches.forEach((match) => {
            resultMap.set(getKey(match), match);
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
                resultMap.set(key, doc);
                break;

            case ACTIONS.REMOVE:
                resultMap.delete(key);
                break;
        }
    }

    return resultMap;
};
