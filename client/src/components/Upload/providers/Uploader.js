/**
 * Provides file upload services to the modal UI
 */

export const STATUSCODES = {
    OK: "ok",
};

export default {
    data() {
        return {
            progress: 0.5,
            status: STATUSCODES.OK,
        };
    },
    computed: {
        loading() {
            return this.progress < 1;
        },
    },
    render() {
        return this.$scopedSlots.default({
            loading: this.loading,
            progress: this.progress,
            status: this.status,
        });
    },
};
