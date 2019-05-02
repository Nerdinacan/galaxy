// Single top-level item in the history contents

export default {
    title: "historycontent",
    version: 0,
    type: "object",
    properties: {
        hid: { type: "integer" },
        history_content_type: { type: "string" },
        history_id: { type: "string" },
        id: { type: "string", primary: true },
        update_time: { type: "string" },
        url: { type: "string" }
    }
}
