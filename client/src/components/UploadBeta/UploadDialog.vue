<template>
    <b-tabs>
        <b-tab :title="'Regular' | localize" id="regular">
            <Regular
                :genomes="sortedGenomes"
                :extensions="sortedExtensions"
                :default-genome.sync="defaultGenome"
                :default-extension.sync="defaultExtension"
                v-bind="$attrs"
                v-on="$listeners"
            />
        </b-tab>
        <b-tab :title="'Composite' | localize" id="composite">
            <Composite :genomes="sortedGenomes" :extensions="sortedExtensions" v-bind="$attrs" v-on="$listeners" />
        </b-tab>
        <b-tab :title="'Collection' | localize" id="collection">
            <Collection :genomes="sortedGenomes" :extensions="sortedExtensions" v-bind="$attrs" v-on="$listeners" />
        </b-tab>
        <b-tab :title="'Rule-Based' | localize" id="rule-based">
            <RulesInput :genomes="sortedGenomes" :extensions="sortedExtensions" v-bind="$attrs" v-on="$listeners" />
        </b-tab>
    </b-tabs>
</template>

<script>
import { sortByObjectProp } from "utils/sorting";
import { BTabs, BTab } from "bootstrap-vue";
import Regular from "./Regular";
import Composite from "./Composite";
import Collection from "./Collection";
import RulesInput from "./RulesInput";

const textSort = sortByObjectProp("text");

const genomeSort = (defaultGenome) => (a, b) => {
    if (a.id == defaultGenome) return -1;
    if (b.id == defaultGenome) return 1;
    return textSort(a, b);
};

export default {
    components: {
        BTabs,
        BTab,
        Regular,
        Composite,
        Collection,
        RulesInput,
    },
    props: {
        config: { type: Object, required: true },
        genomes: { type: Array, required: true, default: () => [] },
        extensions: { type: Array, required: true, default: () => [] },
    },
    data() {
        const { default_extension = "?", default_genome } = this.config;
        return {
            defaultExtension: default_extension,
            defaultGenome: default_genome,
        };
    },
    computed: {
        genomeSortFn() {
            return genomeSort(this.defaultGenome);
        },
        sortedGenomes() {
            const list = Array.from(this.genomes);
            list.sort(this.genomeSortFn);
            return list;
        },
        sortedExtensions() {
            const list = Array.from(this.extensions);
            list.sort(textSort);
            return list;
        },
    },
};
</script>
