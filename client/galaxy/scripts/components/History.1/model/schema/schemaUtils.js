// create duplicate object with only keys in schema
export const conformToSchema = schema => {
    let validKeys = Object.keys(schema.properties);
    return instance => validKeys.reduce((acc, prop) => {
        acc[prop] = instance[prop];
        return acc;
    }, {})
}

// mutates passed object to fit indicated schema, necessary
// due to the way rxdb's preInsert hooks work
export const mutateToMatchSchema = schema => {
    let validKeys = Object.keys(schema.properties);
    return raw => {
        Object.keys(raw)
            .filter(key => !validKeys.includes(key))
            .forEach(key => delete raw[key]);
    }
}