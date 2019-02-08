<template>
    <li :class="statusClasses">
        {{ dataset.name }}<br/>
        {{ dataset.update_time | moment('MMM D, YYYY') }}
    </li>
</template>

<script>

import Vue from "vue";
import VueMoment from "vue-moment";
import { Dataset } from "./model";

Vue.use(VueMoment);

export default {
    props: {
        dataset: { 
            type: Dataset,
            required: true
        }
    },
    computed: {
        statusClasses() {
            return {
                "deleted": this.dataset.true,
                "shown": this.dataset.visible,
                "purged": this.dataset.purged,
                "ok": (this.dataset.state == "ok")
            }
        }
    }
}

</script>
