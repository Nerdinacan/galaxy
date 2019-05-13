<template>
    <stateless-tags v-model="tags"
        :useToggleLink="false"
        :autocomplete-items="autocompleteItems"
        @tag-click="onTagClick"
        @tag-input-changed="updateTagSearch"
        @before-adding-tag="beforeAddingTag"
        @before-deleting-tag="beforeDeletingTag"
    />
</template>


<script>

import { mapActions } from "vuex";
import { Subject } from "rxjs";
import { map, filter, debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { StatelessTags } from "components/Tags";

export default {
    components: { 
        StatelessTags
    },
    props: {
        history: { type: Object, required: true },
        debounceInterval: { type: Number, required: false, default: 150 }
    },
    data() {
        return {
            tags: Array.from(this.history.tags)
        }
    },
    subscriptions() {
        this.searchTerm = new Subject();

        return {
            autocompleteItems: this.searchTerm.pipe(
                map(txt => txt.replace("name:", "")),
                filter(txt => txt.length),
                debounceTime(this.debounceInterval),
                distinctUntilChanged(),
                switchMap(txt => this.autocomplete(txt))
            )
        }
    },
    methods: {
        
        ...mapActions("history", [ "updateHistory" ]),

        beforeAddingTag({ tag, addTag }) {

            const tagSet = new Set(this.history.tags);
            tagSet.add(tag.text);

            const tags = Array.from(tagSet);

            const payload = {
                history: this.history,
                fields: { tags }
            };

            this.updateHistory(payload)
                .then(() => addTag(tag))
                .catch(err => console.warn("Unable to save tag", err));
        },
        beforeDeletingTag({ tag, deleteTag }) {

            const tagSet = new Set(this.history.tags);
            tagSet.delete(tag.text);

            const tags = Array.from(tagSet);

            const payload = {
                history: this.history,
                fields: { tags }
            };

            this.updateHistory(payload)
                .then(() => deleteTag(tag))
                .catch(err => console.warn("Unable to delete tag", err));
        },
        updateTagSearch(searchTxt) {
            this.searchTerm.next(searchTxt);
        },
        onTagClick(tag) {
            console.log("onTagClick", tag);
        }
    }
}

</script>
