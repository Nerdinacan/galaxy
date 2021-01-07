<template>
    <b-button v-bind="$attrs" v-on="$listeners" :title="title | l" :aria-label="title | l" v-b-tooltip.hover>
        <div>
            <b-progress height="2rem" :value="progressPercent" :max="100" :variant="variant"></b-progress>
            <span class="position-relative">
                <font-awesome-icon icon="upload" class="mr-1" />
                <b v-localize>Upload Data</b>
            </span>
        </div>
    </b-button>
</template>

<script>
import { mapState } from "vuex";
import { VBTooltip, BProgress } from "bootstrap-vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

library.add(faUpload);

// convert galaxy upload status to bootstrap variant for display
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
        title: { type: String, default: "Download from URL or upload files from disk" },
    },
    computed: {
        ...mapState("upload", {
            status: (state) => state.status,
            progress: (state) => state.progress,
        }),
        variant() {
            return variants[this.status];
        },
        progressPercent() {
            return 100.0 * this.progress;
        },
    },
};
</script>
