/**
 * Loaded genome options
 */

import { getUploadDatatypes, getUploadGenomes } from "./queries";

// TODO: store in disk cache? Localstorage even?
let cached_genomes;
let cached_extensions;

export default {
    data() {
        return {
            genomes: undefined,
            extensions: undefined,
        };
    },
    computed: {
        loading() {
            return this.genomes === undefined || this.extensions === undefined;
        },
    },
    async created() {
        if (!cached_extensions) {
            cached_extensions = await getUploadDatatypes();
        }
        if (!cached_genomes) {
            cached_genomes = await getUploadGenomes();
        }
        this.genomes = cached_genomes;
        this.extensions = cached_extensions;
    },
    render() {
        return this.$scopedSlots.default({
            loading: this.loading,
            genomes: this.genomes || [],
            extensions: this.extensions || [],
        });
    },
};
