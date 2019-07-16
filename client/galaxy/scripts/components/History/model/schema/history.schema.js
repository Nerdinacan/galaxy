// Top level history object

import { nullableString, stringArray } from "./types.schema";

export default {
    title: "history",
    version: 0,
    type: "object",
    properties: {
        
        // client-side only prop tracks content polling updates
        // content_update_time: { type: "string", default: "" },

        annotation: nullableString,
        contents_active: { 
            type: "object",
            properties: {
                active: { type: "integer", default: 0 },
                deleted: { type: "integer", default: 0 },
                hidden: { type: "integer", default: 0 },
            }
        },
        contents_url: { type: "string" },
        create_time: { type: "string" },
        isDeleted: { type: "boolean" },
        genome_build: nullableString,
        hid_counter: { type: "number" },
        id: { type: "string", primary: true },
        importable: { type: "boolean" },
        model_class: { type: "string" },
        name: { type: "string" },
        published: { type: "boolean" },
        purged: { type: "boolean" },
        size: { type: "number" },
        slug: nullableString,
        tags: {
            type: "array",
            item: { type: "string" }
        },
        update_time: { type: "string" },
        
        url: { type: "string" },
        user_id: { type: ["null", "string"] },
        username_and_slug: nullableString,

        state_details: {
            type: "object",
            properties: {
                discarded: { type: "integer", default: 0 },
                empty: { type: "integer", default: 0 },
                error: { type: "integer", default: 0 },
                failed_metadata: { type: "integer", default: 0 },
                new: { type: "integer", default: 0 },
                ok: { type: "integer", default: 0 },
                paused: { type: "integer", default: 0 },
                queued: { type: "integer", default: 0 },
                running: { type: "integer", default: 0 },
                setting_metadata: { type: "integer", default: 0 },
                upload: { type: "integer", default: 0 }
            }
        },
        state_ids: { 
            type: "object", 
            properties: {
                discarded: stringArray,
                empty: stringArray,
                error: stringArray,
                failed_metadata: stringArray,
                new: stringArray,
                ok: stringArray,
                paused: stringArray,
                queued: stringArray,
                running: stringArray,
                setting_metadata: stringArray,
                upload: stringArray
            }
        },
        state: { type: "string" },
        empty: { type: "boolean" },
        non_ready_jobs: stringArray
    }
}
