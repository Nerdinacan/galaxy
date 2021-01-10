<template>
    <b-tabs>
        <b-tab id="regular" :title="'Regular' | localize">
            <Regular
                v-on="$listeners"
                :queue="queue"
                :active="active"
                :default-genome="defaultGenome"
                :default-extension="defaultExtension"
            />
        </b-tab>
        <b-tab :title="'Composite' | localize" id="composite">
            <Composite />
        </b-tab>
        <b-tab :title="'Collection' | localize" id="collection">
            <Collection />
        </b-tab>
        <b-tab :title="'Rule-Based' | localize" id="rule-based">
            <RulesInput />
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
    props: ["queue", "active", "genomes", "extensions", "status", "defaultGenome", "defaultExtension"],
};
</script>
