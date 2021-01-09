<template>
    <b-button
        v-bind="$attrs"
        v-on="$listeners"
        :title="title | localize"
        :aria-label="title | localize"
        v-b-tooltip.hover
        @click="toggleDialog"
    >
        <div>
            <b-progress height="2rem" :value="progressPercent" :variant="variant"></b-progress>
            <span class="position-relative">
                <font-awesome-icon icon="upload" class="mr-1" />
                <b v-localize>Upload Data {{ progressPercent }}</b>
            </span>
        </div>
    </b-button>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { VBTooltip, BProgress } from "bootstrap-vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

library.add(faUpload);

export default {
    components: {
        BProgress,
        FontAwesomeIcon,
    },
    directives: {
        VBTooltip,
    },
    props: {
        title: {
            type: String,
            default: "Download from URL or upload files from disk",
        },
    },
    computed: {
        ...mapState("upload", {
            status: (state) => state.status,
            active: (state) => state.active,
            progressPercent: (state) => 100.0 * state.progress,
        }),
        variant() {
            return this.status?.variant || "info";
        },
    },
    methods: {
        ...mapActions("upload", ["toggleDialog"]),
    },
};
</script>
