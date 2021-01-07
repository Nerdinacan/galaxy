<template>
    <b-tabs v-if="ready">
        <b-tab v-if="showRegular" title="Regular" id="regular" button-id="tab-title-link-regular">
            <Regular />
            <!-- :app="this" :lazy-load-max="50" :multiple="multiple" -->
        </b-tab>
        <b-tab v-if="showComposite" title="Composite" id="composite" button-id="tab-title-link-composite">
            <Composite />
            <!-- <composite :app="this" /> -->
        </b-tab>
        <b-tab v-if="showCollection" title="Collection" id="collection" button-id="tab-title-link-collection">
            <Collection />
            <!-- <collection :app="this" /> -->
        </b-tab>
        <b-tab v-if="showRules" title="Rule-based" id="rule-based" button-id="tab-title-link-rule-based">
            <RulesInput />
            <!-- <rules-input :app="this" /> -->
        </b-tab>
    </b-tabs>
    <loading-span v-else message="Loading required information from Galaxy server." />
</template>

<script>
import { BTabs, BTab } from "bootstrap-vue";
import LoadingSpan from "components/LoadingSpan";
import Regular from "./Regular";
import Composite from "./Composite";
import Collection from "./Collection";
import RulesInput from "./RulesInput";

export default {
    components: {
        BTabs,
        BTab,
        LoadingSpan,
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
    computed: {
        showRegular() {
            return true;
        },
        showComposite() {
            return true;
        },
        showCollection() {
            return true;
        },
        showRules() {
            return true;
        },
        ready() {
            return this.showRegular || this.showComposite || this.showComposite || this.showRules;
        },
    },
};
</script>