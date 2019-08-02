<template>
    <div class="scrollContainer" ref="scrollContainer">
        <ol ref="scrollContent">
            <li v-for="(item, index) in items" :key="item[keyProp]" class="mb-1">
                <div class="sensor" v-observe-visibility="updatePageRange(item)"></div>
                <slot :item="item" :index="index">
                    {{ item }}
                </slot>
            </li>
        </ol>
    </div>
</template>

<script>

import { ObserveVisibility } from "vue-observe-visibility";

export default {
    directives: {
        ObserveVisibility
    },
    props: {
        keyProp: { type: String, required: true },
        items: { type: Array, required: false, default: () => [] }
    },
    methods: {

        updatePageRange(item) {

            function handler(isVisible, entry) {

                // this one came into view
                if (isVisible) {
                    this.$emit('itemIsVisible', item);
                    return;
                }

                // item left view
                this.$emit('itemIsNotVisible', item);

                // up or down?
                const containerRect = this.getContainerRect();
                if (containerRect) {
                    if (this.isAboveWindow(containerRect, entry)) {
                        this.$emit('itemIsAboveWindow', item);
                    } else if(this.isBelowWindow(containerRect, entry)) {
                        this.$emit('itemIsBelowWindow', item);
                    }
                }
            }

            return handler.bind(this);
        },

        getContainerRect() {
            try {
                return this.$refs.scrollContainer.getBoundingClientRect();
            } catch(err) {
                return null;
            }
        },

        isAboveWindow(containerRect, { boundingClientRect }) {
            return boundingClientRect.bottom < containerRect.top;
        },

        isBelowWindow(containerRect, { boundingClientRect }) {
            return boundingClientRect.top > containerRect.bottom;
        }

    }
}

</script>


<style lang="scss">

@import "scss/mixins.scss";
@import "scss/transitions.scss";

.scrollContainer {

    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;

    ol {
        @include list_reset();
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        padding-bottom: 100px;
    }

    ol li {
        position: relative;
    }

    .sensor {
        position: absolute;
        height: 1px;
        width: 1px;
        bottom: 0;
        left: 0;
    }
}

</style>
