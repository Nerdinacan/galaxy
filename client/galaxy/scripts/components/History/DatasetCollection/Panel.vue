<template>
    <section class="current-dataset-collection d-flex flex-column">

        <header class="flex-grow-0">
            <section class="history-details p-3">

                <header class="d-flex justify-content-between">
                    <h6>{{ path }}</h6>
                    <icon-menu class="no-border">
                        <icon-menu-item title="Download Collection"
                            icon="floppy-o"
                            tooltip-placement="topleft" />
                        <icon-menu-item title="Back to History"
                            icon="arrow-up"
                            tooltip-placement="topleft"
                            @click="close"/>
                    </icon-menu>
                </header>

                <click-to-edit v-model="collectionName"
                    tag-name="h2" class="history-title mt-4"
                    :state-validator="validateName"
                    ref="nameInput">
                    <template v-slot:tooltip>
                        <b-tooltip placement="bottom" :target="() => $refs.nameInput"
                            :title="'Click to rename collection' | localize" />
                    </template>
                </click-to-edit>

                <!-- <dataset-tags :dataset="dataset"
                    :historyId="dataset.history_id" /> -->

            </section>
        </header>

        <div class="history-contents flex-grow-1">
            <div class="scrollContainer">
                <ol class="mb-1">
                    <li>
                        <div class="content-item collapsed dataset">Dataset?</div>
                    </li>
                </ol>
            </div>
        </div>

    </section>
</template>


<script>

import { mapActions } from "vuex";
import { DatasetCollection$, updateDataset } from "../model/Dataset$";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import ClickToEdit from "components/Form/ClickToEdit";

export default {

    components: {
        ClickToEdit,
        IconMenu,
        IconMenuItem
    },

    props: {
        historyId: { type: String, required: true },
        typeId: { type: String, required: true }
    },

    data() {
        return {
            path: []
        }
    },

    subscriptions() {
        return {
            dsc: DatasetCollection$(this.typeId)
        }
    },

    computed: {

        collectionName: {
            get() {
                return this.dsc ? this.dsc.name : "";
            },
            set(name) {
                if (name !== this.dsc.name) {
                    this.updateModel({ name });
                }
            }
        },

    },
    methods: {

        ...mapActions("history", [
            "setCurrentCollection"
        ]),

        updateModel(fields) {
            this.loading = true;
            return updateDataset(this.dsc, fields)
                .toPromise()
                .finally(() => {
                    this.loading = false;
                })
        },

        close() {
            this.setCurrentCollection({
                history_id: this.historyId,
                type_id: null
            });
        },

        validateName(val, origVal) {
            if (val === origVal) {
                return null;
            }
            return val.length > 0;
        }

    }
}

</script>
