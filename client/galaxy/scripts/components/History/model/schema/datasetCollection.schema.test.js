/* global describe, it, assert */

import { Validator } from "jsonschema";
import schema from "./datasetCollection.schema";
import testData from "../testdata/datasetCollection.json";

describe("datasetCollection schema", () => {
    
    let v = new Validator();

    it("should validate some test data", () => {
        assert(v);
        assert(schema);
        assert(testData);
        let result = v.validate(testData, schema);
        assert(result);
        if (!result.valid) {
            result.errors.forEach(err => {
                console.log(err.property, err.message);
            })
        }
        assert(result.valid);
    })

})
