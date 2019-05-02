export default {
    title: "datasetCollections",
    version: 0,
    type: "object",
    properties: {
        history_content_type: { type: "string" },
        name: { type: "string" },
        history_id: { type: "string" },
        tags: { 
            type: "array", 
            items: { type: "string"},
            default: []
        },
        // job_source_id: { type: "string" },
        // job_source_type: { type: "string" },
        // elements: { type: "array" },
        collection_type: { type: "string" },
        url: { type: "string" },
        hid: { type: "number" },
        element_count: { type: "number" },
        id: { type: "string", primary: true }
    }
}
