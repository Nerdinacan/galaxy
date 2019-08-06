<template>
    <component v-if="content"
        class="content-item"
        :is="contentItemComponent"
        :content="content"
        :class="displayClasses"
        :showSelection="showSelection"
        v-bind:selected.sync="selected"
        @mouseover.native="focusItem" />
</template>


<script>

import { mapGetters, mapActions } from "vuex";
import { tap, pluck } from "rxjs/operators";
import { getCachedContent } from "caching";
import Dataset from "./Dataset";
import DatasetCollection from "./DatasetCollection";
import dasherize from "underscore.string/dasherize";
import { eventHub } from "components/eventHub";

export default {
    components: {
        "dataset": Dataset,
        "dataset_collection": DatasetCollection,
    },
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            showSelection: false
        }
    },
    computed: {

        ...mapGetters("history", [
            "contentIsSelected"
        ]),

        selected: {
            get() {
                return this.content ? this.contentIsSelected(this.content) : false;
            },
            set(newValue) {
                const { content } = this;
                if (newValue) {
                    this.selectContentItem({ content });
                } else {
                    this.unselectContentItem({ content });
                }
            }
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

        ...mapActions("history", [
            "selectContentItem",
            "unselectContentItem"
        ]),

        displaySelection(val) {
            this.showSelection = val;
        },

        focusItem({ currentTarget }) {
            currentTarget.focus();
        }

    },
    created() {
        eventHub.$on('toggleShowSelection', this.displaySelection);
    },
    beforeDestroy() {
        eventHub.$off('toggleShowSelection', this.displaySelection);
    }
}

</script>


<style lang="scss">

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

    &.collapsed header h4 {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
}

.content-item {

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
