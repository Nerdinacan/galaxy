<template>
    <b-button
        v-on="$listeners"
        id="tool-panel-upload-button"
        v-b-tooltip.hover
        aria-label="Download from URL or upload files from disk"
        title="Download from URL or upload files from disk"
        class="upload-button"
        size="sm"
    >
        <div>
            <b-progress height="2rem" :value="percentage" :max="100" :variant="variant"></b-progress>
            <span class="pos-relative">
                <font-awesome-icon icon="upload" class="mr-1" />
                <b>Upload Data</b>
            </span>
        </div>
    </b-button>
</template>

<script>
import { VBTooltip, BProgress, BProgressBar } from 'bootstrap-vue';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
library.add(faUpload);

const variants = {
    "ok": "info"
}

export default {
    name: "UploadButton",
    components: {
        BProgress,
        BProgressBar,
        FontAwesomeIcon
    },
    directives: {
        VBTooltip
    },
    props: {
        status: { type: String, required: false, default: "ok" },
        percentage: { type: Number, required: false, default: 0 },
    },
    computed: {
        variant() {
            return variants[this.status];
        }
    }
};
</script>
