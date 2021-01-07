/**
 * Loaded genome options
 */

import { getUploadDatatypes, getUploadGenomes } from "mvc/upload/upload-utils";

export default {
    data() {
        return {
            genomes: null,
            extensions: null,
        };
    },
    computed: {
        loading() {
            return this.genomes === null || this.extensions === null;
        },
    },
    created() {
        getUploadDatatypes((result) => {
            this.extensions = result;
        });
        getUploadGenomes((result) => {
            this.genomes = result;
        });
    },
    render() {
        return this.$scopedSlots.default({
            loading: this.loading,
            genomes: this.genomes || [],
            extensions: this.extensions || [],
        });
    },
};
