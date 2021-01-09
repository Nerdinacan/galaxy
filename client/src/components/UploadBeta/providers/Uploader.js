/**
 * Provides file upload services
 */

import { UPLOADSTATUS } from "../store";

export default {
    data() {
        return {
            loading: false,
            queue: [],
            progress: 0.5,
            status: UPLOADSTATUS.OK,
        };
    },
    methods: {
        enqueue(file) {
            console.log("queue", file);
            this.queue.push(file);
        },
        cancel(idx) {
            this.queue.splice(idx, 1);
        },
        reset() {
            this.queue = [];
        },
        start() {
            console.log("start uploading");
        },
        pause() {
            console.log("pause uploading");
        },
    },
    render() {
        return this.$scopedSlots.default({
            // list of files
            queue: this.queue,

            // status
            loading: this.loading,
            progress: this.progress,
            status: this.status,

            // methods
            enqueue: this.enqueue,
            cancel: this.cancel,
            reset: this.reset,
            start: this.start,
            pause: this.pause,
        });
    },
};
