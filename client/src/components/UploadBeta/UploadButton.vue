<template>
    <div class="upload-button">
        <b-progress height="1.75rem" :value="percentage" :variant="variant"></b-progress>
        <b-button
            v-bind="$attrs"
            v-on="$listeners"
            :title="title | localize"
            :aria-label="title | localize"
            v-b-tooltip.hover
            @click="toggleDialog"
        >
            <b>
                <font-awesome-icon icon="upload" class="mr-1" />
                <span v-localize>Upload Data</span>
                <span v-if="progress.totalSize">({{ progress.totalSize | bytes }})</span>
                <span v-if="progress.portion">{{ percentage }}% complete </span>
            </b>
        </b-button>
    </div>
</template>

<script>
import prettyBytes from "pretty-bytes";
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
    filters: {
        bytes: prettyBytes,
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
        ...mapGetters("upload", ["progress", "status"]),

        percentage() {
            return this.progress.portion * 100;
        },
        variant() {
            return this.status.variant;
        },
    },
    methods: {
        ...mapActions("upload", ["toggleDialog"]),
    },
};
</script>

<style lang="scss" scoped>
@import "scss/mixins.scss";

.upload-button {
    position: relative;
    > .btn {
        @include absfill();
        background-color: transparent;
        z-index: 1;
    }
}
</style>
