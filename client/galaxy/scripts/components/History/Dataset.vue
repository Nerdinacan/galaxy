<template>
    <div class="dataset">
        <header>
        	<h4><a @click="toggleDetails">{{ title }}</a></h4>
        </header>
        <transition name="shutterfade">
            <textarea v-if="!collapsed">{{ dataset }}</textarea>
        </transition>
    </div>
</template>


<script>

import Vue from "vue";
import VueRx from "vue-rx";
import { tap, mergeMap } from "rxjs/operators";
import { Dataset$ } from "./model/observables/CachedData";

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
            dataset: Dataset$(this.content)
        }
    }
}

</script>
