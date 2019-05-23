// create duplicate object with only keys in schema
export const conformToSchema = schema => {
    const validKeys = Object.keys(schema.properties);
    validKeys.push('_rev');
    return instance => validKeys.reduce((result, prop) => {
        result[prop] = instance[prop];
        return result;
    }, {})
}

// mutates passed object to fit indicated schema, necessary
// due to the way rxdb's preInsert hooks work
export const mutateToMatchSchema = schema => {
    const validKeys = Object.keys(schema.properties);
    validKeys.push('_rev');
    return raw => {
        Object.keys(raw)
            .filter(key => !validKeys.includes(key))
            .forEach(key => delete raw[key]);
    }
}

