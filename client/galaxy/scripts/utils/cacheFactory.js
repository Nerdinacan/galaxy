/**
 * Generic cache factory. Takes a key generation function a storage destination
 * and maximum cache contents age.
 *
 * @param {object} options { keyFactory, storage, maxAge }
 */
export const cacheFactory = (options) => {

    let {
        keyFactory,
        storage = localStorage,
        maxAge = 5000
    } = options;

    return {
        setItem(params, data) {
            let key = keyFactory(params);
            let cacheTime = Date.now();
            let cacheData = JSON.stringify({ cacheTime, data });
            storage.setItem(key, cacheData);
        },
        getItem(params) {
            let key = keyFactory(params);
            let json = storage.getItem(key);
            if (json) {
                let o = JSON.parse(json);
                if ((Date.now() - o.cacheTime) < maxAge) {
                    return o.data;
                }
            }
            return null;
        }
    }

}
