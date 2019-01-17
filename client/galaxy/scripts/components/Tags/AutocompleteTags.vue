<template>
    <vue-tags-input class="galaxy-tags"
        v-model="tagText" 
        :tags="tags"
        :autocomplete-items="autocompleteOptions"
        @before-adding-tag="onTagAdd"
        @before-deleting-tag="onTagDelete"
        @tags-changed="onTagsChanged"
    />
</template>


<script>

import Vue from "vue";
import VueRx from "vue-rx";
import VueTagsInput from "@johmun/vue-tags-input";
import { createTag, diffTags} from "./model";
import { buildTagService } from "./tagService";
import { map } from "rxjs/operators";

Vue.use(VueRx);


export default {

    components: {
        VueTagsInput
    },

    props: {
        id: { type: String,  required: true },
        itemClass: { type: String, required: false, default: "" },
        context: { type: String, required: false, default: "" },
        value: { type: Array, required: false, default: () => [] }, // tags
        editable: { type: Boolean, required: false, default: true }
        // use_toggle_link: ${iff( use_toggle_link, 'true', 'false' )},
        // get_toggle_link_text_fn: ${get_toggle_link_text_fn},
    },

    data() {
        return { 
            tagText: ""
        }
    },

    computed: {
        tagService() {
            return buildTagService(this.$props);
        },
        tags() {
            return this.value.map(createTag);
        }
    },

    
    // Watch changes to typed input text and pass into the
    // data service, results will come out in the subscription (below)
   
    watch: {
        tagText(newValue) {
            this.tagService.autocompleteSearchText = newValue;
        }
    },


    // Subscribe to autocompleteOptions observable on the tagService
    // It will update eventually after the searchText has changed
    // and filter out the tags we've already selected
   
    subscriptions() {
        return {
            // return search result tags without the ones we've already selected
            autocompleteOptions: 
                this.tagService.autocompleteOptions.pipe(
                    map(resultTags => diffTags(resultTags, this.tags))
                )
        }
    },

    methods: {
        
        // user removed a tag from the component, attempt to delete it with
        // the ajax service, if successful, finish the procedure
        // via the addTag method passed by the vue-tags-input event hook
        // TODO: error handling

        onTagAdd({ tag, addTag }) {
            this.tagService.save(tag)
                .then(() => addTag(tag))
                .catch(err => console.warn("unable to save tag", err));
        },


        // user removed tag, same dance as above
        // TODO: error handling

        onTagDelete({ tag, deleteTag }) {
            this.tagService.delete(tag)
                .then(result => deleteTag(tag))
                .catch(err => console.warn("Unable to delete tag", err));
        },

        
        // when tags finally change, emit "input" event. "input" is a special
        // event name that is used by the v-model interface with vue components
        // Emitting this event and using v-model allows us to treat this whole 
        // component like a glorified form input

        onTagsChanged(newTags) {
            this.$emit('input', newTags);
        }
    }
}

</script>


<style lang="scss">

/* should include a global color definitions file here,
and make use of any pre-defined variables */

.galaxy-tags.vue-tags-input .ti-tag {
    border-radius: 4px;
    background-color: #999999;
}

</style>


<!--

// editable: ${iff( editable, 'true', 'false' )},
// use_toggle_link: ${iff( use_toggle_link, 'true', 'false' )},
// get_toggle_link_text_fn: ${get_toggle_link_text_fn},
// tag_click_fn: ${tag_click_fn},

// "/tag/tag_autocomplete_data?item_id=e85a3be143d5905b&item_class=StoredWorkflow",
ajax_autocomplete_tag_url: "${h.url_for(
    controller='/tag', 
    action='tag_autocomplete_data', 
    item_id=tagged_item_id, 
    item_class=tagged_item.__class__.__name__ 
)}",

// "/tag/add_tag_async?item_id=e85a3be143d5905b&item_class=StoredWorkflow&context=edit_attributes.mako",
ajax_add_tag_url: "${h.url_for(
    controller='/tag',
    action='add_tag_async',
    item_id=tagged_item_id,
    item_class=tagged_item.__class__.__name__,
    context=elt_context
)}",

// "/tag/remove_tag_async?item_id=e85a3be143d5905b&item_class=StoredWorkflow&context=edit_attributes.mako",
ajax_delete_tag_url: "${h.url_for(
    controller='/tag',
    action='remove_tag_async',
    item_id=tagged_item_id,
    item_class=tagged_item.__class__.__name__,
    context=elt_context
)}",

// delete_tag_img: "${h.url_for('/static/images/delete_tag_icon_gray.png')}",
// delete_tag_img_rollover: "${h.url_for('/static/images/delete_tag_icon_white.png')}",

-->