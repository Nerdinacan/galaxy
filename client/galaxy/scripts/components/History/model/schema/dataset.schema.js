import { nullableString, stringArray } 
    from "./types.schema";
    
export default {
    title: "dataset",
    version: 0,
    type: "object",
    properties: {
        accessible: { type: "boolean" },
        annotation: nullableString,
        api_type: { type: "string" },
        create_time: { type: "string" },
        creating_job: nullableString,
        data_type: { type: "string" },
        dataset_id: { type: "string" },
        isDeleted: { type: "boolean" },
        display_apps: stringArray,
        display_types: stringArray,
        download_url: { type: "string" },
        extension: { type: "string" },
        file_ext: { type: "string" },
        file_name: { type: "string" },
        file_size: { type: "integer" },
        genome_build: { type: "string" },
        hda_ldda: { type: "string" },
        hid: { type: "integer" },
        history_content_type: { type: "string" },
        history_id: { type: "string" },
        id: { type: "string", primary: true },
        meta_files: stringArray,
        metadata_data_lines: nullableString,
        metadata_dbkey: { type: "string" },
        metadata_sequences: nullableString,
        misc_blurb: { type: "string" },
        misc_info: { type: "string" },
        model_class: { type: "string" },
        name: { type: "string" },
        peek: { type: "string" },
        permissions: {
            type: "object",
            properties: {
                access: stringArray,
                manage: stringArray
            }
        },
        purged: { type: "boolean" },
        rerunnable: { type: "boolean" },
        resubmitted: { type: "boolean" },
        state: { type: "string" },
        tags: stringArray,
        type: { type: "string" },
        type_id: { type: "string" },
        update_time: { type: "string" },
        url: { type: "string" },
        uuid: { type: "string" },
        visible: { type: "boolean" },
        visualizations: stringArray
    }
}
