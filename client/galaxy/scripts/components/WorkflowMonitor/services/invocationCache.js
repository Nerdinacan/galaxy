import { cacheFactory } from "utils/cacheFactory";

/**
 * Build a cache key out of the ajax params.
 * @param {object} params Request parameters, must contain invocation_id 
 */
const keyFactory = ({ invocation_id = 0 }) => {
    return `invocation_${invocation_id}`;
}

/**
 * A cache for the invocation ajax calls, keyed by
 * the parameters of the corresponding ajax call
 */
export const invocationCache = cacheFactory({ keyFactory });
