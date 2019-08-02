<template>
    <section class="history current-dataset-collection d-flex flex-column">

        <header class="flex-grow-0">
            <section class="history-details p-3">

                <header class="d-flex justify-content-between">
                    <h6>{{ breadcrumbs }}</h6>
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
            <transition name="fade">
                <scroller v-if="content.length" :items="content" keyProp="id">
                    <template #default="{ item, index }">
                        <content-item :content="item" :tabindex="index" />
                    </template>
                </scroller>
            </transition>
        </div>

    </section>
</template>


<script>

import { mapActions, mapGetters } from "vuex";
import { tap } from "rxjs/operators";
import { DatasetCollection$, updateDataset } from "components/History/model/Dataset$";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import ClickToEdit from "components/Form/ClickToEdit";
import Scroller from "components/Form/Scroller";
import ContentItem from "components/History/Content/ContentItem";
import DscElement from "./DscElement";

export default {

    components: {
        ClickToEdit,
        IconMenu,
        IconMenuItem,
        Scroller,
        ContentItem
    },

    props: {
        historyId: { type: String, required: true },
        typeId: { type: String, required: true }
    },

    subscriptions() {
        return {
            dsc: DatasetCollection$(this.typeId).pipe(
                tap(val => console.log("dsc", val))
            )
        }
    },

    computed: {

        ...mapGetters("history", [
            "currentCollectionList"
        ]),

        breadcrumbs() {
            return this.currentCollectionList(this.historyId);
        },

        // convert the incompetent dataset collection contents format back
        // to something that looks vaguely like existing content objects
        // with a wrapper object
        rootElements() {
            const elements = this.dsc ? this.dsc.elements : [];
            return elements.map(el => new DscElement(this.historyId, el));
        },

        content() {

            // drilldowns
            const path = this.breadcrumbs.length ? this.breadcrumbs.slice(1) : [];

            return path.reduce((acc, selectedId) => {
                const selected = acc.filter(el => el.type_id == selectedId);
                if (selected.length) {
                    if (selected[0].children.length) {
                        return selected[0].children;
                    }
                }
                return [];
            }, this.rootElements);
        },

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
            "selectCollection",
            "unselectCollection"
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
            this.unselectCollection({
                history_id: this.historyId
            });
        }

    }
}

</script>
