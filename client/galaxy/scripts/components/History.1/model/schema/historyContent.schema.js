// Single top-level item in the history contents

export default {
    title: "historycontent",
    version: 0,
    type: "object",
    properties: {
        id: { type: "string", primary: true },
        hid: { type: "number" },
        history_id: { type: "string" },
        history_content_type: { type: "string" },
        url: { type: "string" },
        update_time: { type: "number" }
    }
}

