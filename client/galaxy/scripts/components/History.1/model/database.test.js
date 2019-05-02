/* global describe, it, assert, expect */

import { isObservable } from "rxjs/index";
import { datasets } from "./database";

describe("datasets collection", () => {

    it("should be an observable", () => {
        assert(isObservable);
        assert(datasets);
        assert(isObservable(datasets));
    })
})
