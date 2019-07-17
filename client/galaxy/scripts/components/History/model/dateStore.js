/**
 * Simple date storage.
 */
import moment from "moment";

const storage = sessionStorage;

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
