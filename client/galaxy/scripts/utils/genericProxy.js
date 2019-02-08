// General diagnostic proxy, wraps existing object and outputs
// console.logs during method or property access

export function genericProxy(target, label) {
    return new Proxy(target, {
        get(obj, prop) {
            const origProp = obj[prop];
            if (origProp instanceof Function) {
                return function(...args) {
                    let result = origProp.apply(this, args);
                    console.group(`${label} method call: ${prop}`);
                    console.warn(prop, ...args);
                    console.warn("result", result);
                    console.groupEnd();
                    return result;
                }
            }
            console.warn(`${label} get`, prop);
            return obj[prop];
        },
        set(obj, prop, value) {
            console.warn(`${label} set:`, prop, value);
            obj[prop] = value;
            return true;
        }
    });
}
