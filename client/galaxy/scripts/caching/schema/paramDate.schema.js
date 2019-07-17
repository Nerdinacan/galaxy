export default {
    title: "paramDate",
    version: 0,
    type: "object",
    properties: {
        user_id: { type: ["null", "string"], index: true },
        hash: { type: "string", primary: true },
        lastCalled: { type: "number" }
    }
}
