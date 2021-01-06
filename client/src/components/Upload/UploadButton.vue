<template>
    <b-button v-bind="$attrs" v-on="$listeners">
        <div>
            <b-progress height="2rem" :value="progressPercent" :variant="variant"></b-progress>
            <span class="position-relative">
                <font-awesome-icon icon="upload" class="mr-1" />
                <b>Upload Data</b>
            </span>
        </div>
    </b-button>
</template>

<script>
import { VBTooltip, BProgress } from "bootstrap-vue";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

library.add(faUpload);

// convert galaxy status to bootstrap variant
const variants = {
    ok: "success",
};

export default {
    components: {
        BProgress,
        FontAwesomeIcon,
    },
    directives: {
        VBTooltip,
    },
    props: {
        status: { type: String, required: false, default: "ok" },
        progress: { type: Number, required: false, default: 0 },
    },
    computed: {
        variant() {
            return variants[this.status];
        },
        progressPercent() {
            return 100.0 * this.progress;
        },
    },
};
</script>
