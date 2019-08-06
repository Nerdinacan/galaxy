<template>
    <section class="history current-dataset-collection d-flex flex-column">

        <header class="flex-grow-0 p-3">

            <nav class="history-list-menu d-flex align-items-center pb-3">

                <!-- <b-form-select size="sm" class="mr-3">
                    <option v-for="b in breadcrumbs" :value="b">
                        {{ b.element_identifier }}
                    </option>
                </b-form-select> -->

                <div>&nbsp;</div>

                <icon-menu class="no-border">
                    <icon-menu-item title="Download Collection"
                        icon="floppy-o"
                        tooltip-placement="topleft"
                        @click="downloadCollection" />
                    <icon-menu-item title="Back One"
                        icon="arrow-up"
                        tooltip-placement="topleft"
                        @click="backUp" />
                </icon-menu>
            </nav>

            <section class="history-details">
                <click-to-edit v-model="collectionName"
                    tag-name="h2" class="history-title mt-4"
                    ref="nameInput">
                    <template #tooltip>
                        <b-tooltip placement="bottom"
                            :target="() => $refs.nameInput"
                            :title="'Click to rename collection' | localize" />
                    </template>
                </click-to-edit>
                <collection-description v-if="dsc" :content="dsc" />
            </section>

        </header>

        <div class="history-contents flex-grow-1">
            <transition name="fade">
                <scroller v-if="content.length"
                    :items="content" keyProp="id"
                    #default="{ item, index }">
                    <component :is="item.element_type"
                        :content="item"
                        class="content-item"
                        @selectDscItem="selectDscItem" />
                </scroller>
            </transition>
        </div>

    </section>
</template>


<script>

import { mapActions, mapGetters } from "vuex";
import { tap, map } from "rxjs/operators";
import { DatasetCollection$, updateDataset } from "../model/Dataset$";

import DscElement from "./DscElement";
import DscCollection from "./DscCollection";
import DscDataset from "./DscDataset";

import ClickToEdit from "components/Form/ClickToEdit";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import Scroller from "components/Form/Scroller";
import CollectionDescription from "components/History/Content/CollectionDescription";


export default {

    components: {
        ClickToEdit,
        Scroller,
        IconMenu,
        IconMenuItem,
        "dataset_collection": DscCollection,
        "hda": DscDataset,
        CollectionDescription
    },
    props: {
        historyId: { type: String, required: true },
        selectedTypeId: { type: String, required: true }
    },
    data() {
        return {
            breadcrumbs: []
        }
    },
    subscriptions() {
        return {
            dsc: DatasetCollection$(this.selectedTypeId)
        }
    },
    computed: {

        content() {
            if (!this.dsc) return [];
            return this.breadcrumbs.reduce((contentList, selectedContent) => {
                const match = contentList.find(c => c.id == selectedContent.id);
                if (match && match.object && match.object.elements) {
                    return match.object.elements;
                }
                return [];
            }, this.dsc.elements);
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
        }
    },

    methods: {

        ...mapActions("history", [
            "unselectCollection"
        ]),

        async updateModel(fields) {
            debugger;
            this.loading = true;
            await updateDataset(this.dsc, fields)
            this.loading = false;
        },

        close() {
            this.unselectCollection({
                history_id: this.historyId
            });
        },

        downloadCollection() {
            console.log("downloadCollection");
        },

        selectDscItem(item) {
            console.log("selectDscItem", arguments);
            const newCrumbs = [ ...this.breadcrumbs, item ];
            this.breadcrumbs = newCrumbs;
        },

        backUp() {
            if (this.breadcrumbs.length) {
                const newCrumbs = this.breadcrumbs.slice(0,-1);
                this.breadcrumbs = newCrumbs;
            } else {
                this.close();
            }
        }
    }
}

</script>
