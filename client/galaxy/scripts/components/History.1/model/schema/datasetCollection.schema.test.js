/* global describe, it, assert, expect */

import { Validator } from "jsonschema";
import schema from "./datasetCollection.schema";
import testData from "../testdata/datasetCollection.json";

describe("datasetCollection schema", () => {
    
    let v = new Validator();

    it("should validate some test data", () => {
        // assert(result.valid);
        assert(v);
        assert(schema);
        assert(testData);
        let result = v.validate(testData, schema);
        assert(result);
    })

})
