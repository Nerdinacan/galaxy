<template>
    <div class="datasetCollection">
        <header>
            <h4><a @click="toggleDetails">{{ title }}</a></h4>
        </header>
        <transition name="shutterfade">
            <div v-if="!collapsed">
                <pre>{{ dsc }}</pre>
            </div>
        </transition>
    </div>
</template>


<script>

import Vue from "vue";
import VueRx from "vue-rx";
import { DatasetCollection$ } from "./model/observables/CachedData";

Vue.use(VueRx);

export default {
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            collapsed: true
        }
    },
    computed: {
        title() {
            let { hid, name } = this.content;
            return `${hid}: ${name}`;
        }
    },
    methods: {
        toggleDetails() {
            this.collapsed = !this.collapsed;
        }
    },
    subscriptions() {
        return {
            dsc: DatasetCollection$(this.content)
        }
    }
}

</script>
