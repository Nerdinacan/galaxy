<template>
    <b-tabs>
        <b-tab v-if="showRegular" title="Regular" id="regular" button-id="tab-title-link-regular">
            <layout>
                <template v-slot:header>
                    <p>Header Custom content</p>
                </template>
                <template v-slot>
                    <p>Custom Body content</p>
                </template>
                <template v-slot:footer>
                    <p>Footer Custom content</p>
                </template>
                <template v-slot:buttons>
                    <p>Buttons custom content</p>
                </template>
            </layout>
        </b-tab>

        <!-- <b-tab v-if="showComposite" title="Composite" id="composite" button-id="tab-title-link-composite">
            <upload-wrapper></upload-wrapper>
        </b-tab>

        <b-tab v-if="showCollection" title="Collection" id="collection" button-id="tab-title-link-collection">
            <upload-wrapper></upload-wrapper>
        </b-tab>

        <b-tab v-if="showRules" title="Rule-based" id="rule-based" button-id="tab-title-link-rule-based">
            <upload-wrapper></upload-wrapper>
        </b-tab> -->
    </b-tabs>
</template>

<script>
import { BTabs, BTab } from "bootstrap-vue";
import Layout from "./Layout";

// import Composite from "./Composite";
// import Collection from "./Collection";
// import RulesInput from "./RulesInput";

export default {
    components: {
        BTabs,
        BTab,
        Layout,
        // Composite,
        // Collection,
        // RulesInput,
    },
    props: {
        config: { type: Object, required: true },
        genomes: { type: Array, required: true },
        extensions: { type: Array, required: true },
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
    },
};
</script>

<style>
</style>