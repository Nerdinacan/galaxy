<template>
    <section v-if="dscDoc" class="current-dataset-collection">
        <header>
            <h1>Dataset Collection</h1>
            <a @click="close">Close</a>
        </header>
        <div>
            <textarea>{{ dscDoc.toJSON() }}</textarea>
        </div>
    </section>
</template>

<script>

import { mapMutations } from "vuex";
import { filter, pluck, startWith } from "rxjs/operators";
import { getCachedDatasetCollection } from "../model/observables/CachedData";

export default {
    props: {
        collectionId: { type: String, required: false, default: null }
    },
    subscriptions() {
        const dscDoc = this.$watchAsObservable("collectionId", { immediate: true }).pipe(
            pluck("newValue"),
            getCachedDatasetCollection(),
            startWith(null)
        );
        return { dscDoc };
    },
    methods: {
        ...mapMutations("dsc", ["setCurrentCollectionId"]),
        close() {
            this.setCurrentCollectionId(null);
        }
    }
}

</script>
