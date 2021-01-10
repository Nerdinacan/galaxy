/**
 * Provides file upload services
 */

import { sortByObjectProp } from "utils/sorting";
import { mapActions, mapGetters } from "vuex";
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
        // application config containing ftp/upload vars
        config: { type: Object, required: true },
        // option lists for dropdowns
        options: { type: Object, required: true },
        // additional fields to be sent up with each upload
        fields: { type: Object, default: () => {} },
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
        ...mapGetters("upload", ["queue", "progress"]),

        // config vars
        uploadPath() {
            return this.config.nginx_upload_path || prependPath("api/tools");
        },
        chunkUploadSize() {
            return this.config.chunk_upload_size;
        },
        // I dont know what this is
        // fileSourcesConfigured() {
        //     return this.config.file_sources_configured;
        // },
        // ftpUploadSite() {
        //     return this.config.ftp_upload_site;
        // },

        // sorted lists
        genomes() {
            const list = Array.from(this.options?.genomes || []);
            const sortFn = genomeSort(this.defaultGenome);
            list.sort(sortFn);
            return list;
        },
        extensions() {
            const list = Array.from(this.options?.extensions || []);
            list.sort(textSort);
            return list;
        },
    },

    methods: {
        ...mapActions("upload", ["enqueue", "cancel", "reset"]),

        start() {
            console.log("start");
            this.loading = true;
        },
        pause() {
            console.log("pause");
            this.loading = false;
        },
        setDefaultExtension(val) {
            this.defaultExtension = val;
        },
        setDefaultGenome(val) {
            this.defaultGenome = val;
        },

        // provider props
        getProviderProps() {
            return {
                active: this.loading,
                queue: this.queue,
                status: this.status,
                progress: this.progress,
                defaultExtension: this.defaultExtension,
                defaultGenome: this.defaultGenome,
                genomes: this.genomes,
                extensions: this.extensions,
            };
        },
    },

    provide() {
        return this.getProviderProps();
    },

    render() {
        return this.$scopedSlots.default({
            uploadProps: this.getProviderProps(),
            uploadHandlers: {
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
