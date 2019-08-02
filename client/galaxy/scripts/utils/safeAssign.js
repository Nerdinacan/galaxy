// Object.assign, but props transferred must exist in target

export function safeAssign(target, ...sources) {
    const source = Object.assign({}, ...sources);
    const result = Object.assign({}, target);
    Object.keys(result)
        .filter(prop => source.hasOwnProperty(prop))
        .forEach(prop => result[prop] = source[prop]);
    return result;
}
