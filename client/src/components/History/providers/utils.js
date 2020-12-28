import { SearchParams } from "../model/SearchParams";

export const isDefined = (val) => val !== null && val !== undefined;

// defined, number and finite
export const isFiniteNumber = (val) => {
    return isDefined(val) && !isNaN(val) && isFinite(val);
};

// comparator for distinct() style operators inputs are an array of [id, SearchParams]
export const inputsSame = ([a0, a1], [b0, b1]) => {
    return a0 == b0 && SearchParams.equals(a1, b1);
};

export const scrollPosEquals = (a, b) => {
    return a.cursor === b.cursor && a.key === b.key;
};
