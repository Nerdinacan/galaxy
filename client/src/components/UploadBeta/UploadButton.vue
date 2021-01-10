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
            <b-progress height="2rem" :value="progress.percentage" :variant="variant"></b-progress>
            <span class="position-relative">
                <font-awesome-icon icon="upload" class="mr-1" />
                <b v-localize>Upload Data {{ progress.percentage }}% ({{ progress.totalSize }})</b>
            </span>
        </div>
    </b-button>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
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
        ...mapGetters("upload", ["progress"]),

        variant() {
            return "success";
            // return this.status?.variant || "info";
        },
    },
    methods: {
        ...mapActions("upload", ["toggleDialog"]),
    },
};
</script>
