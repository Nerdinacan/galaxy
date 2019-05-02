/* global describe, it, assert, expect */
import { Validator } from "jsonschema";
import schema from "./history.schema";
import testData from "../testdata/history.json";

describe("history schema", () => {

    let v = new Validator();

    it("should validate some test data", () => {
        testData.update_time = Date.parse(testData.update_time);
        let result = v.validate(testData, schema);
        assert(result.valid);
    })

})
