/**
 * Provides file upload services
 */

import { mapState, mapActions, mapGetters } from "vuex";

export default {
    props: {
        // application configuration (not sure if I need this any more)
        config: { type: Object, required: true },
        // extra fields specific to this upload, tool_id, history, etc
        fields: { type: Object, default: () => ({}) },
    },

    computed: {
        ...mapGetters("upload", ["queue"]),
        ...mapState("upload", ["active"]),
        ...mapState("betaHistory", ["currentHistory"]),
    },

    methods: {
        ...mapActions("upload", [
            "enqueue",
            "remove",
            "reset",
            "setIsActive",
            "toggleActive",
            "startFile",
            "pauseFile",
            "toggleFile",
        ]),

        // merge box-wide upload params with overall configs and current history
        add({ options = {}, ...props }) {
            const newOptions = { ...options, ...this.fields, targetHistory: this.currentHistory };
            this.enqueue({ options: newOptions, ...props });
        },

        startUploader() {
            this.setIsActive(true);
        },
        pauseUploader() {
            this.setIsActive(false);
        },
    },

    render() {
        return this.$scopedSlots.default({
            uploadProps: {
                active: this.active,
                queue: this.queue,
                progress: this.progress,
            },
            uploadHandlers: {
                add: this.add,
                remove: this.remove,
                reset: this.reset,
                startFile: this.startFile,
                pauseFile: this.pauseFile,
                toggleFile: this.toggleFile,
                startUploader: this.startUploader,
                pauseUploader: this.pauseUploader,
                toggleUploader: this.toggleActive,
            },
        });
    },
};
