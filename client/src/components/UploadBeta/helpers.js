import { sortByObjectProp } from "utils/sorting";

// Shared component prop configuration
export const uploadProps = {
    config: { type: Object, required: true },
    queue: { type: Array, default: () => [] },
    active: { type: Boolean, required: true },
    status: { type: Object, default: () => {} },
    genomes: { type: Array, default: () => [] },
    extensions: { type: Array, default: () => [] },
};

// simple text sort for options
export const textSort = sortByObjectProp("text");

// genome sort puts one at the top
export const genomeSort = (defaultGenome) => (a, b) => {
    if (a.id == defaultGenome) return -1;
    if (b.id == defaultGenome) return 1;
    return textSort(a, b);
};

// remove Vue/Vuex extra props
export const scrub = (val) => JSON.parse(JSON.stringify(val));

// file and status are special types, scrub all the rest
export const scrubQueueItem = (item) => {
    const { file, status, ...otherProps } = item;
    const result = scrub(otherProps);
    result.file = file;
    result.status = status;
    return result;
};

// scrub whole queue
export const scrubQueue = (list) => [...list].map(scrubQueueItem);
