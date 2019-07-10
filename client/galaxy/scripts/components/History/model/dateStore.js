export default {
    get(key) {
        const dateStr = localStorage.getItem(key);
        const stamp = dateStr ? parseInt(dateStr) : 0;
        return new Date(stamp);
    },
    set(key, rawDate) {
        const stamp = (new Date(rawDate)).getTime();
        localStorage.setItem(key, stamp);
    }
};
