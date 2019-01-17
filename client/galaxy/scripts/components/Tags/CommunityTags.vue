<template>
    <clickable-tags 
        class="community-tags" 
        :tags="tags"
        @tag-click="clickHandler" />
</template>


<script>

import ClickableTags from "./ClickableTags";
import { redirectToUrl } from "utils/redirect";

export default {
    components: {
        ClickableTags
    },
    props: {
        tags: { type: Array, required: false, default: () => [] },

        // currently we're passing in the click handler name as a property,
        // and that property is still defined by python, so this will have
        // to stay for a little bit.
        tagClickFn: { type: String, required: false, default: "" },

        // used with community_tag_click option
        clickUrl: { type: String, required: false, default: "" }
    },
    methods: {
        clickHandler(tag) {
            if (undefined !== this[this.tagClickFn]) {
                this[this.tagClickFn](tag);
            }
        },
        add_tag_to_grid_filter: function(tag) {
            this.$store.dispatch("toggleSearchTag", tag);
        },
        community_tag_click: function(tag) {
            let suffix = tag.value ? `:${tag.value}` : "";
            let href = `${this.clickUrl}?f-tags=${tag.text}${suffix}`;
            redirectToUrl(href);
        }
    }
}

</script>

<style lang="scss">

@import "./tagStyles.scss";

.vue-tags-input.community-tags {
    
    .ti-icon-close,
    .ti-new-tag-input-wrapper {
        display: none;
    }

    .ti-tag-center {
        user-select: none;
    }
}

</style>
