<template>
    <section class="history-details" :class="statusClasses">

        <input v-model="name" />
        <div>{{ sizeDisplay }}</div>

        <nav>
            <button @click.prevent="showTags = !showTags">
                Tags
            </button>
            <button @click.prevent="showAnnotation = !showAnnotation">
                Annotation
            </button>
        </nav>

        <!-- tags -->
        <textarea class="annotation" v-model="annotation"></textarea>

    </section>
</template>

<script>

import ToggleRegion from "./ToggleRegion";
import { History, createHistory } from "./model";

// Helper to create computed fields for live updates
// NOTE: Vue binds the scope of all assigned functions to the vm
// so "this" will point at the component
function installLiveHistoryField(fieldName) {
    return {
        get() {
            return this.value[fieldName];
        },
        set(newValue) {
            let newHistory = createHistory(this.history);
            newHistory[fieldName] = newValue;
            this.history = newHistory;
        }
    }
}

export default {
    components: {
        GalaxyTags,
        ToggleRegion
    },
    props: {
        value: { type: History, required: true }
    },
    data() {
        return {
            showAnnotation: false,
            showTags: false,
            autocompleteItems: []
        }
    },
    computed: {

        history: {
            get() {
                return this.value;
            },
            set(newValue) {
                this.$emit("input", newValue);
            }
        },

        // field updates go to a live debounced save
        name: installLiveHistoryField('name'),
        annotation: installLiveHistoryField('annotation'),
        tags: installLiveHistoryField('tags'),

        sizeDisplay() {
            return this.history.size + "MB";
        },

        statusClasses() {
            return {
                tags: this.showTags,
                annotation: this.showAnnotation
            }
        }
    },
    methods: {
        loadAutoCompleteItems() {
            console.log("loadAutoCompleteItems");
            this.autocompleteItems = ["foo","bar","hoohah"];
        }
    }
}

</script>

<style scoped lang="scss" src="./historyDetails.scss"></style>
