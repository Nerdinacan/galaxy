import DscElement from "./DscElement";
import testElementJson from "./testdata/testElement.json.js";

describe("DscElement", () => {

    let instance;
    beforeEach(() => {
        instance = new DscElement(testElementJson);
    })

    it("should have some test data", () => {
        assert(testElementJson);
        assert(testElementJson instanceof Object);
        const children = testElementJson.object.elements;
        assert(Array.isArray(children), "children not an array in test data");
    })

    it("should instantiate", () => {
        assert(instance);
        assert(instance instanceof DscElement);
    })

    it("should have children", () => {
        assert(Array.isArray(instance.children), "children value not an array");
        assert(instance.children.length);
        instance.children.forEach(c => {
            assert(c instanceof DscElement, "child object not DscElement");
        })
    })

    it("should only expose the children through the weakmap", ()=> {
        // but those children should not exist in the object,
        // just in the associated weakmap
        assert(!instance.hasOwnProperty("elements"), "DscElement should not have a direct elements array");
    })

    it("should store element props in the weakmap", () => {
        const expectedProps = [
            "element_index", "element_identifier",
            "element_type", "model_class", "id"
        ];
        expectedProps.forEach(p => {
            assert(undefined !== instance.elProps[p], `Missing prop ${p}`);
        })
    })

})