<template>
    <div v-if="dsc">
        <header>
            <h5 class="m-0">
                <a href="#" @click="toggleDetails">{{ title }}</a>
            </h5>
            <icon-menu>
                <icon-menu-item 
                    title="Delete" 
                    icon="times"
                    @click="deleteCollection"
                    tooltip-placement="topleft" />
            </icon-menu>
        </header>
        <transition name="shutterfade">
            <div v-if="showDetails">
                <pre>{{ Object.keys(dsc) }}</pre>
            </div>
        </transition>
    </div>
</template>


<script>

import { IconMenu, IconMenuItem } from "components/IconMenu";
import { DatasetCollection$ } from "../model/observables/CachedData";
import { eventHub } from "../eventHub";

export default {
    components: {
        IconMenu, IconMenuItem
    },
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            showDetails: false
        }
    },
    computed: {
        title() {
            const { hid, name } = this.content;
            return `${hid}: ${name}`;
        }
    },
    methods: {
        toggleDetails() {
            this.showDetails = !this.showDetails;
        },
        collapse() {
            this.showDetails = false;
        },
        deleteCollection() {
            console.log("deleteCollection");
            console.dir(this.dsc);
        }
    },
    subscriptions() {
        return { 
            dsc: DatasetCollection$(this.content.id)
        };
    },
    created() {
        eventHub.$on('collapse-content', this.collapse);
    },
    beforeDestroy() {
        eventHub.$off('collapse-content', this.collapse);
    }
}

</script>
