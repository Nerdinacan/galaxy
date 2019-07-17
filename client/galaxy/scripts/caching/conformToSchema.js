// create duplicate object with only keys in schema

const conformToSchema = schema => {
    const validKeys = Object.keys(schema.properties);
    validKeys.push('_rev');
    return instance => validKeys.reduce((result, prop) => {
        result[prop] = instance[prop];
        return result;
    }, {})
}


export default conformToSchema;