<template>
    <component v-if="content"
        class="content-item"
        :is="contentItemComponent"
        :content="content"
        :class="displayClasses" />
</template>


<script>

import { mapGetters } from "vuex";
import { tap, pluck } from "rxjs/operators";
import { getCachedContent } from "caching";
import { DatasetItem } from "./Dataset";
import { DatasetCollectionItem } from "./DatasetCollection";
import dasherize from "underscore.string/dasherize";


export default {
    props: {
        content: { type: Object, required: true }
    },
    components: {
        "dataset": DatasetItem,
        "dataset_collection": DatasetCollectionItem,
        "hda": DatasetItem // for collection non-standard
    },
    computed: {

        ...mapGetters("history", [
            "contentIsSelected"
        ]),

        selected() {
            return this.content ? this.contentIsSelected(this.content) : false;
        },

        displayClasses() {
            if (!this.content) {
                return {};
            }
            const typeName = dasherize(this.content.history_content_type);
            return {
                [typeName]: true,
                selected: this.selected
            }
        },

        contentItemComponent() {
            return this.content ? this.content.history_content_type : null;
        },

    },
    methods: {
        focusMe() {
            this.$el.focus();
        }
    }
}

</script>


<style lang="scss" scoped>

@import "theme/blue.scss";
@import "scss/mixins.scss";

.content-item {
    outline: none;
    border-style: none;
    border-width: none;

    &:focus,
    &:focus-within {
        box-shadow: inset 0 0 1em 0.25em rgba(255,255,255,0.25);
    }

    &.collapsed /deep/ header h4 {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
}

.content-item /deep/ {

    & > header {
        h4,
        h4 a {
            display: block;
            color: $text-color;
            outline: none;
        }
    }

    .content-top-menu {
        cursor: pointer;

        .hid {
            color: adjust-color($text-color, $alpha: -0.6);
            font-weight: 800;
            font-size: 90%;
            user-select: none;
            position: relative;
            span {
                display: block;
                position: absolute;
                top: 52%;
                left: 0%;
                transform: translateY(-50%);
                margin-left: 4px;
            }
        }
    }
}

</style>
