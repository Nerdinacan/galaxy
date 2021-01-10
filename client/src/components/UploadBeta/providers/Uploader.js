/**
 * Provides file upload services
 */

import { mapState, mapActions } from "vuex";
import { prependPath } from "utils/redirect";
import { UPLOADSTATUS } from "../store";

export default {
    props: {
        // additional fields to be sent up with each upload
        // fields: { type: Object, required: true, default: () => {} },
        // application config containing ftp/upload vars
        config: { type: Object, required: true },
    },

    data() {
        return {
            status: UPLOADSTATUS.OK,
            loading: false,
        };
    },

    computed: {
        ...mapState("upload", {
            queue: (state) => state.queue || [],
            progress: (state) => state.progress || 0.0,
        }),

        // config vars
        uploadPath() {
            return this.config.nginx_upload_path || prependPath("api/tools");
        },
        chunkUploadSize() {
            return this.config.chunk_upload_size;
        },
        fileSourcesConfigured() {
            return this.config.file_sources_configured;
        },
        ftpUploadSite() {
            return this.config.ftp_upload_site;
        },
    },

    methods: {
        ...mapActions("upload", ["enqueue", "cancel", "reset"]),

        start() {
            this.loading = true;
        },
        pause() {
            this.loading = false;
        },
    },

    render() {
        return this.$scopedSlots.default({
            // list of files
            queue: this.queue,

            // status
            progress: this.progress,
            status: this.status,
            loading: this.loading,

            // methods
            add: this.enqueue,
            cancel: this.cancel,
            reset: this.reset,
            start: this.start,
            pause: this.pause,
        });
    },
};
