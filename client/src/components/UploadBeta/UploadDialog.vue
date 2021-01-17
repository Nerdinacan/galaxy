<template>
    <b-tabs>
        <b-tab id="regular" :title="'Regular' | localize">
            <Regular v-on="$listeners" v-bind="$props" />
        </b-tab>
        <b-tab :title="'Composite' | localize" id="composite">
            <Composite v-on="$listeners" v-bind="$props" />
        </b-tab>
        <b-tab :title="'Collection' | localize" id="collection">
            <Collection v-on="$listeners" v-bind="$props" />
        </b-tab>
        <b-tab :title="'Rule-Based' | localize" id="rule-based">
            <RulesInput v-on="$listeners" v-bind="$props" />
        </b-tab>
    </b-tabs>
</template>

<script>
import { BTabs, BTab } from "bootstrap-vue";
import { uploadProps } from "./helpers";
import Regular from "./views/Regular";
import Composite from "./views/Composite";
import Collection from "./views/Collection";
import RulesInput from "./views/RulesInput";

export default {
    components: {
        BTabs,
        BTab,
        Regular,
        Composite,
        Collection,
        RulesInput,
    },
    props: uploadProps,
};
</script>
