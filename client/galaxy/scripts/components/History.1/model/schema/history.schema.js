// Top level history object

export default {
    title: "history",
    version: 0,
    type: "object",
    properties: {
        id: { type: "string", primary: true },
        name: { type: "string" },
        update_time: { type: "number" },
        annotation: { type: "string" },
        contents_url: { type: "string" },
        tags: {
            type: "array",
            item: { type: "string" },
            default: []
        },
        // need to rename, rxdb doesn't like 'deleted' as a key
        isDeleted: { type: "boolean" },
        purged: { type: "boolean" },
        published: { type: "boolean" },
        state: { type: "string" }
    }
}
