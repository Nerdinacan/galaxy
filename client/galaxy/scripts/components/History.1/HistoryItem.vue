<template>
    <div class="dataset-detail">
        {{ dataset.name }}<br/>
        {{ dataset.update_time | moment('MMM D, YYYY') }}

        <nav>
            <button @click.prevent="showDataSample = !showDataSample">
                View Data
            </button>
            <button @click.prevent="showTags = !showTags">
                Tags
            </button>
            <button @click.prevent="showAnnotation = !showAnnotation">
                Annotation
            </button>
        </nav>

        <div v-if="showDataSample">
            Data, fool
        </div>

        <galaxy-tags v-if="showTags"
            v-model="tags" 
            :use-toggle-link="false"
            :autocomplete-items="autocompleteItems"
            @tag-input-changed="loadAutoCompleteItems" />

        <textarea v-if="showAnnotation" 
            class="annotation" 
            v-model="annotation"></textarea>

    </div>
</template>
  
<script>

import Vue from "vue";
import VueRx from "vue-rx";
import VueMoment from "vue-moment";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { Dataset, createDataset } from "./model";
import { GalaxyTags } from "components/Tags";

Vue.use(VueRx);
Vue.use(VueMoment);


// Helper to create computed fields for live updates
// NOTE: Vue binds the scope of all assigned functions to the vm
// so "this" will point at the component
function installLiveField(fieldName) {
    return {
        get() {
            return this.dataset[fieldName];
        },
        set(newValue) {
            let newModel = createDataset(this.dataset);
            newModel[fieldName] = newValue;
            this.dataset = newModel;
        }
    }
}


export default {
    components: {
        GalaxyTags
    },
    props: {
        value: { 
            type: Dataset,
            required: true
        },
        selected: {
            type: Boolean,
            required: false,
            default: false
        },
        debounceDelay: { 
            type: Number, 
            required: false, 
            default: 500 
        }
    },
    data() {
        return {
            showDataSample: false,
            showTags: false,
            showAnnotation: false,
            autocompleteItems: [],
            updateBuffer: new Subject()
        }
    },
    computed: {

        dataset: {
            get() {
                return this.value;
            },
            set(newValue) {
                this.updateBuffer.next(newValue);
            }
        },
        
        annotation: installLiveField("annotation"),
        tags: installLiveField("tags"),

        statusClasses() {
            return {
                "deleted": this.dataset.true,
                "shown": this.dataset.visible,
                "purged": this.dataset.purged,
                "ok": (this.dataset.state == "ok"),
                "selected": this.selected
            }
        }
    },
    methods: {
        loadAutoCompleteItems() {
            this.autocompleteItems = ["foo", "bar"];
        }
    },
    created() {
        // debouncing
        const updates = this.updateBuffer.pipe(
            debounceTime(this.debounceDelay)
        );
        this.$subscribeTo(updates, (newDataset) => {
            this.$store.dispatch("saveDataset", newDataset);
        });
    }
}

</script>
