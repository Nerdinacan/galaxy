<template>
    <b-form-checkbox v-if="showSelection" v-model="isSelected" />
</template>

<script>

// It's a little dumb that this has to be wrapped, but like
// all things associated with Bootstrap, this component
// doesn't quite work as advertised. This avoids a bunch of
// redundant store updates

import { mapGetters, mapActions } from "vuex";
import { eventHub } from "components/eventHub";

export default {
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
            "contentIsSelected",
        ]),

        isSelected: {
            get() {
                return this.contentIsSelected(this.content)
            },
            set(newValue) {
                const { content } = this;
                if (newValue) {
                    this.selectContentItem({ content });
                } else {
                    this.unselectContentItem({ content });
                }
            }
        }
    },
    methods: {

        ...mapActions("history", [
            "selectContentItem",
            "unselectContentItem"
        ]),

        displaySelection(val) {
            this.showSelection = val;
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
