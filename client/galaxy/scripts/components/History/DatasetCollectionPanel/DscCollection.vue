<template>
    <div class="dataset-collection" :data-state="state">
        <header class="px-3 py-2">
            <h4><a href="#" @click="drillDown">{{ content.element_identifier }}</a></h4>
            <collection-description class="m-0" :content="content.object" />
        </header>
    </div>
</template>


<script>

import { IconMenu, IconMenuItem } from "components/IconMenu";
import CollectionDescription from "../Content/CollectionDescription";

export default {
    components: {
        IconMenu, IconMenuItem, CollectionDescription
    },
    props: {
        content: { type: Object, required: true }
    },
    computed: {
        state() {
            return this.content.object.state || "ok";
        }
    },
    methods: {
        drillDown() {
            this.$emit("selectDscItem", this.content);
        }
    }
}

</script>
