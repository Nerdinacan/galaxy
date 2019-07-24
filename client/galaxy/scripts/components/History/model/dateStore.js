/**
 * Simple date storage.
 */
import moment from "moment";

const storage = new MemoryStorage(); // sessionStorage;

function getDate(key) {
    const stamp = storage.getItem(key) || 0;
    const stampInt = parseInt(stamp);
    const result = moment.utc(stampInt);
    return result;
}

function setDate(key) {
    const stamp = moment.utc().valueOf();
    storage.setItem(key, stamp);
}

export default {
    get: getDate,
    set: setDate
};



// Just a map with the standard Storage interface
function MemoryStorage() {
    const store = new Map();
    return {
        getItem(key) {
            return store.get(key);
        },
        setItem(key, val) {
            return store.set(key, val);
        }
    }
}