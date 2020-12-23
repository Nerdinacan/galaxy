/**
 * Takes aggregation result and assembles a list for the component based on current scroll cursor
 */

import { pipe, take, filter } from "iter-tools/es2018";

// utils for buildContentResult
const firstEntryKey = (entries) => (entries.length ? entries[0][0] : undefined);
const distance = (a, b) => Math.abs(+a - +b);

/**
 * Finds closest of keys by measuring numeric distance from targetKey
 *
 * @param   {String|Number}  targetKey  Key to match
 * @param   {String|Number}  keys       Keys to check
 *
 * @return  {String|Number} Member of keys closest to targetKey numerially
 */
export const findClosestKey = (targetKey, ...keys) => {
    return keys
        .filter((val) => val !== undefined)
        .reduce((result, key) => {
            if (result !== undefined) {
                const keyCloser = distance(targetKey, key) < distance(targetKey, result);
                return keyCloser ? key : result;
            }
            return key;
        }, undefined);
};

export const buildContentResult = (cfg = {}) => {
    const { keyDirection = "asc", pageSize = 50, getKey } = cfg;

    if (keyDirection != "asc" && keyDirection != "desc") {
        throw new Error(`buildContentResult: invalid sort direction: ${keyDirection}`);
    }

    return ([updateMap, targetKey]) => {
        if (isNaN(targetKey)) {
            console.warn("Target key should be numeric", updateMap, targetKey);
            throw new Error("buildContentResult: targetKey must be a numeric value", targetKey);
        }

        const { matchingValue, desc, asc } = updateMap.findEntries(targetKey);

        // iterator transformations to find some up/down from target
        const up = pipe(
            filter(([k]) => k > targetKey),
            take(pageSize)
        );
        const down = pipe(
            filter(([k]) => k < targetKey),
            take(pageSize)
        );

        // make iterators into concrete arrays
        const top = Array.from(up(asc));
        const bottom = Array.from(down(desc));

        // startKey is the closest key in the result set to the requested targetKey
        let startKey;
        if (matchingValue !== undefined) {
            startKey = getKey(matchingValue);
        } else {
            const topKey = firstEntryKey(top);
            const bottomKey = firstEntryKey(bottom);
            startKey = findClosestKey(targetKey, topKey, bottomKey);
        }

        // assemble contents array by combining the results
        const match = matchingValue ? [[targetKey, matchingValue]] : [];
        const contentEntries = [...top.reverse(), ...match, ...bottom];
        const contentList = contentEntries.map(([k, v]) => v);

        // reverse order for ascending content
        const contents = keyDirection == "desc" ? contentList : contentList.reverse();

        return { contents, startKey, targetKey };
    };
};

// Configurable function returns a key for the updateMap from a doc during upate operations
// aggregate results in a map for each set of id + params
export const getKeyForUpdateMap = (keyField) => (doc) => {
    let rawKey;
    if (keyField in doc) {
        rawKey = doc[keyField];
    } else {
        // won't have a full doc on a delete, but it's embeedded in the id
        const parts = doc._id.split("-");
        rawKey = parseInt(parts[1]);
    }

    const result = parseInt(rawKey);
    if (isNaN(result)) {
        console.warn("Non integer key for document", doc);
        throw new Error("Key for update map should be an integer");
    }

    return result;
};
