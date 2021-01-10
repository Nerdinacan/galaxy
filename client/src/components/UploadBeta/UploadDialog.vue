<template>
    <b-tabs>
        <b-tab :title="'Regular' | localize" id="regular">
            <Regular v-bind="$attrs" v-on="$listeners" />
        </b-tab>
        <b-tab :title="'Composite' | localize" id="composite">
            <Composite v-bind="$attrs" v-on="$listeners" />
        </b-tab>
        <b-tab :title="'Collection' | localize" id="collection">
            <Collection v-bind="$attrs" v-on="$listeners" />
        </b-tab>
        <b-tab :title="'Rule-Based' | localize" id="rule-based">
            <RulesInput v-bind="$attrs" v-on="$listeners" />
        </b-tab>
    </b-tabs>
</template>

<script>
import { BTabs, BTab } from "bootstrap-vue";
import Regular from "./Regular";
import Composite from "./Composite";
import Collection from "./Collection";
import RulesInput from "./RulesInput";

export default {
    components: {
        BTabs,
        BTab,
        Regular,
        Composite,
        Collection,
        RulesInput,
    },
};
</script>
