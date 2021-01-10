/**
 * Provides file upload services
 */

import { sortByObjectProp } from "utils/sorting";
import { mapState, mapActions } from "vuex";
import { prependPath } from "utils/redirect";
import { UPLOADSTATUS } from "../store";

const textSort = sortByObjectProp("text");

const genomeSort = (defaultGenome) => (a, b) => {
    if (a.id == defaultGenome) return -1;
    if (b.id == defaultGenome) return 1;
    return textSort(a, b);
};

export default {
    props: {
        // additional fields to be sent up with each upload
        // fields: { type: Object, required: true, default: () => {} },
        // application config containing ftp/upload vars
        config: { type: Object, required: true },
        options: { type: Object, required: true },
    },

    data() {
        const { default_extension = "?", default_genome } = this.config;
        return {
            status: UPLOADSTATUS.OK,
            loading: false,
            defaultExtension: default_extension,
            defaultGenome: default_genome,
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
            // I dont know what this is
            return this.config.file_sources_configured;
        },
        ftpUploadSite() {
            return this.config.ftp_upload_site;
        },

        genomes() {
            const list = Array.from(this.options.genomes || []);
            const sortFn = genomeSort(this.defaultGenome);
            list.sort(sortFn);
            return list;
        },

        extensions() {
            const list = Array.from(this.options.extensions || []);
            list.sort(textSort);
            return list;
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
        setDefaultExtension(val) {
            this.defaultExtension = val;
        },
        setDefaultGenome(val) {
            this.defaultGenome = val;
        },
    },

    render() {
        return this.$scopedSlots.default({
            queue: this.queue,
            defaultExtension: this.defaultExtension,
            defaultGenome: this.defaultGenome,
            genomes: this.genomes,
            extensions: this.extensions,
            progress: this.progress,
            status: this.status,
            loading: this.loading,

            // methods
            handlers: {
                add: this.enqueue,
                cancel: this.cancel,
                reset: this.reset,
                start: this.start,
                pause: this.pause,
                setDefaultExtension: this.setDefaultExtension,
                setDefaultGenome: this.setDefaultGenome,
            },
        });
    },
};
