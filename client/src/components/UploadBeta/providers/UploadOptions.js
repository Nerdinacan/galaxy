/**
 * Loaded genome options
 */

import { getUploadDatatypes, getUploadGenomes } from "./queries";
import { sortByObjectProp } from "utils/sorting";

// TODO: store in disk cache? Localstorage even?

let cached_genomes;
let cached_extensions;

// sorting

const textSort = sortByObjectProp("text");

const genomeSort = (defaultGenome) => (a, b) => {
    if (a.id == defaultGenome) return -1;
    if (b.id == defaultGenome) return 1;
    return textSort(a, b);
};

// Defaults

const DEFAULT_GENOME = "?";

export default {
    data() {
        return {
            defaultGenome: DEFAULT_GENOME,
            genomeList: undefined,
            extensionList: undefined,
        };
    },
    computed: {
        loading() {
            return this.genomeList === undefined || this.extensionList === undefined;
        },
        genomes() {
            if (this.genomeList) {
                const list = Array.from(this.genomeList);
                list.sort(genomeSort(this.defaultGenome));
                return list;
            }
            return [];
        },
        extensions() {
            if (this.extensionList) {
                const list = Array.from(this.extensionList);
                list.sort(textSort);
                return list;
            }
            return [];
        },
    },
    async created() {
        if (!cached_genomes) {
            cached_genomes = await getUploadDatatypes();
        }
        if (!cached_extensions) {
            cached_extensions = await getUploadGenomes();
        }
        this.genomeList = cached_genomes;
        this.extensionList = cached_extensions;
    },
    render() {
        return this.$scopedSlots.default({
            loading: this.loading,
            genomes: this.genomes || [],
            extensions: this.extensions || [],
        });
    },
};
