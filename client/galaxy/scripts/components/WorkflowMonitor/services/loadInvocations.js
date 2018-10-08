/**
 * loadInvocations, generates a function that loads and returns a promise that
 * yields an invocation either from the cache, or the interwebs
 *
 * @param {object} cache cache implementation
 * @param {function} loader ajax function
 * @returns {function} function that caches and makes an ajax call baed on
 * passed params
 */
export const loadInvocations = (cache, loader) => async (params) => {

    // check cache
    let cachedResult = cache.getItem(params);
    if (cachedResult) {
        return Promise.resolve(cachedResult);
    }

    // ajax call, actually returning whole list of invocations for this workflow
    // since the single lookup has way more information than we really need
    let { workflow_id, invocation_id } = params;
    let list = await loader(workflow_id);

    // cache each invocation result, return the one we care about
    return list.reduce((result, invocation) => {
        cache.setItem({ invocation_id: invocation.id }, invocation);
        return invocation_id == invocation.id ? invocation : result;
    }, null);
}
