export default {
    title: "historycontent",
    version: 0,
    type: "object",
    properties: {
        hid: { type: "integer", index: true },
        history_content_type: { type: "string" },
        history_id: { type: "string", index: true },
        id: { type: "string" },
        name: { type: "string" },
        
        // apparently id can collide between dataset/datasetCollection
        // would prefer uuid but collection does not have one
        type_id: { type: "string", primary: true },

        update_time: { type: "string" },
        url: { type: "string" }
    }
}
