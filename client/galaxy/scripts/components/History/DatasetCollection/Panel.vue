<template>
    <section class="current-dataset-collection">
        <header>
            <h4>{{ typeId }}</h4>
            <a @click="close">Close</a>
        </header>
        <pre>{{ dsc }}</pre>
    </section>
</template>


<script>

import { mapActions } from "vuex";
import { DatasetCollection$ } from "../model/Dataset$";

export default {
    props: {
        historyId: { type: String, required: true },
        typeId: { type: String, required: true }
    },
    subscriptions() {
        return {
            dsc: DatasetCollection$(this.typeId)
        }
    },
    methods: {
        ...mapActions("history", [
            "setCurrentCollection"
        ]),
        close() {
            this.setCurrentCollection({
                history_id: this.historyId, 
                type_id: null
            });
        }
    }
}

</script>
