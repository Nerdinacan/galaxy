/* Simple date store for local storage */

function getDate(key) {
    const stamp = getStamp(key);
    return new Date(stamp);
}

function setDate(key, rawDate) {
    const stamp = makeStamp(rawDate);
    localStorage.setItem(key, stamp);
}

function setIfHigher(key, rawDate) {
    const testTamp = makeStamp(rawDate);
    const existingStamp = getStamp(key);
    const newStamp = Math.max(testTamp, existingStamp);
    localStorage.setItem(key, newStamp);
}

function makeStamp(raw) {
    return (new Date(raw)).getTime()
}

function getStamp(key) {
    const dateStr = localStorage.getItem(key);
    return dateStr ? parseInt(dateStr) : 0;
}

export default {
    get: getDate,
    set: setDate,
    setIfHigher
};
