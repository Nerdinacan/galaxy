<template>
    <b-tabs>
        <b-tab :title="'Regular' | localize" id="regular">
            <Regular :genomes="genomes" :extensions="extensions" v-bind="$attrs" v-on="$listeners" />
        </b-tab>
        <b-tab :title="'Composite' | localize" id="composite">
            <Regular :genomes="genomes" :extensions="extensions" v-bind="$attrs" v-on="$listeners" />
        </b-tab>
        <b-tab :title="'Collection' | localize" id="collection">
            <Regular :genomes="genomes" :extensions="extensions" v-bind="$attrs" v-on="$listeners" />
        </b-tab>
        <b-tab :title="'Rule-Based' | localize" id="rule-based">
            <Regular :genomes="genomes" :extensions="extensions" v-bind="$attrs" v-on="$listeners" />
        </b-tab>
    </b-tabs>
</template>

<script>
import { BTabs, BTab } from "bootstrap-vue";
import Regular from "./Regular";
// import Composite from "./Composite";
// import Collection from "./Collection";
// import RulesInput from "./RulesInput";

export default {
    components: {
        BTabs,
        BTab,
        Regular,
        // Composite,
        // Collection,
        // RulesInput,
    },
    props: {
        config: { type: Object, required: true },
        genomes: { type: Array, required: true, default: () => [] },
        extensions: { type: Array, required: true, default: () => [] },
    },
};
</script>
