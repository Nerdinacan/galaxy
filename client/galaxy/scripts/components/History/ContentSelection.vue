<template>
    <section>

        <header>
            <h6>
                <span>Contents</span>
                <span>{{ countShown }} shown</span>
                <span v-if="countHidden">
                    <a v-if="!params.showHidden" href="#" @click="params.showHidden = true">
                        {{ countHidden }} hidden
                    </a>
                    <a v-if="params.showHidden" href="#" @click="params.showHidden = false">
                        hide hidden
                    </a>
                </span>
            </h6>

            <icon-menu class="no-border">
                <icon-menu-item title="Filter History Content" icon="filter" @click="toggle('showFilter')"
                    tooltip-placement="topleft" />
                <icon-menu-item title="Operations on multiple datasets" icon="check-square-o"
                    @click="toggle('showSelection')" tooltip-placement="topleft" />
                <icon-menu-item id="datasetMenuGear" title="Dataset Operations" icon="cog" :useTooltip="false" />
            </icon-menu>
        </header>

        <!-- search parameters -->
        <transition name="shutterfade">
            <content-filters v-if="showFilter" class="content-filters mt-1" v-model="params" :history="history" />
        </transition>

        <!-- dataset selection -->
        <transition name="shutterfade">
            <b-button-toolbar v-if="showSelection" class="content-selection justify-content-between mt-1">

                <b-button-group>

                    <b-button size="sm" @click="selectAllVisibleContent">
                        {{ 'Select All' | localize }}
                    </b-button>

                    <b-button size="sm" @click="clearSelection">
                        {{ 'Unselect All' | localize }}
                    </b-button>

                    <b-dropdown size="sm" text="With Selected" :disabled="!hasSelection" boundary="viewport">

                        <b-dropdown-item @click="hideDatasets">
                            {{ 'Hide Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="unhideDatasets">
                            {{ 'Unhide Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="deleteDatasets">
                            {{ 'Delete Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="undeleteDatasets">
                            {{ 'Undelete Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="purgeDatasets">
                            {{ 'Permanently Delete Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="buildDatasetList">
                            {{ 'Build Dataset List' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="buildDatasetPair">
                            {{ 'Build Dataset Pair' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="buildListOfPairs">
                            {{ 'Build List of Dataset Pairs' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="buildCollectionFromRules">
                            {{ 'Build Collection from Rules' | localize }}
                        </b-dropdown-item>

                    </b-dropdown>

                </b-button-group>

            </b-button-toolbar>
        </transition>

        <b-popover ref="datasetMenu" target="datasetMenuGear" placement="bottomleft" triggers="click blur">

            <gear-menu #default="{ go, backboneGo, iframeGo, eventHub }" @clicked="closeMenu('datasetMenu')">
                <div>
                    <a class="dropdown-item" @click="iframeGo('/dataset/copy_datasets')">
                        {{ 'Copy Datasets' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="backboneGo('/histories/permissions?id=' + history.id)">
                        {{ 'Dataset Security' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="iframeGo('/history/resume_paused_jobs?current=True')">
                        {{ 'Resume Paused Jobs' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="eventHub.$emit('collapseAllContent')">
                        {{ 'Collapse Expanded Datasets' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.show-hidden-content>
                        {{ 'Unhide Hidden Datasets' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.delete-hidden-content>
                        {{ 'Delete Hidden Datasets' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.purge-deleted-content>
                        {{ 'Purge Deleted Datasets' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>


        <!-- confirm modals  -->

        <b-modal id="show-hidden-content" title="Show Hidden Datasets" title-tag="h2" @ok="showHidden">
            <p>{{ messages.unhideContent | localize }}</p>
        </b-modal>

        <b-modal id="delete-hidden-content" title="Delete Hidden Datasets" title-tag="h2" @ok="deleteHidden">
            <p>{{ messages.deleteHiddenContent | localize }}</p>
        </b-modal>

        <b-modal id="purge-deleted-content" title="Purge Deleted Datasets" title-tag="h2" @ok="purgeDeleted">
            <p>{{ messages.purgeDeletedContent | localize }}</p>
        </b-modal>

    </section>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from "vuex";
import ContentFilters from "./ContentFilters";
import GearMenu from "components/GearMenu";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import { eventHub } from "components/eventHub";
import { SearchParams } from "./model/SearchParams";

// temporary adapters use old backbone modals until I rewrite them
import { 
    datasetListModal, 
    datasetPairModal, 
    listOfPairsModal, 
    collectionFromRulesModal 
} from "./adapters/backboneListModals";


const messages = {
    unhideContent: "Really unhide all hidden datasets?",
    deleteHiddenContent: "Really delete all hidden datasets?",
    purgeDeletedContent: "Really delete all deleted datasets permanently? This cannot be undone."
};

export default {
    components: {
        ContentFilters,
        IconMenu,
        IconMenuItem,
        GearMenu
    },
    props: {
        history: { type: Object, required: true }
    },
    data() {
        return {
            showSelection: false,
            showFilter: false,
            messages
        }
    },
    computed: {

        ...mapGetters("history", [
            "historyContent",
            "searchParams",
            "contentSelection"
        ]),

        currentSelection() {
            return this.contentSelection(this.history.id);
        },

        hasSelection() {
            return this.currentSelection.size;
        },

        historyId() {
            return this.history.id;
        },

        content() {
            return this.historyContent(this.historyId);
        },

        // create a local copy
        params: {
            get() {
                return this.searchParams(this.historyId);
            },
            set(newParams) {
                if (!SearchParams.equals(newParams, this.params)) {
                    this.setSearchParams(newParams);
                }
            }
        },

        countShown() {
            return this.history.contents_active.active;
        },

        countHidden() {
            return this.history.contents_active.hidden;
        }
    },
    methods: {

        ...mapActions("history", [
            "setSearchParams",
            "setContentSelection",
            "clearContentSelection",
            "showAllHiddenContent",
            "deleteAllHiddenContent",
            "purgeDeletedContent",
            "updateSelectedContent",
            "setContentSelection"
        ]),

        ...mapActions("datasetCollection", [
            "createCollection"
        ]),

        toggle(paramName, forceVal) {
            if (!(paramName in this)) {
                console.warn("Missing toggle parameter", paramName);
                return;
            }
            if (forceVal === undefined) {
                this[paramName] = !this[paramName];
            } else {
                this[paramName] = forceVal;
            }
        },

        //#region content selection

        selectAllVisibleContent() {
            this.updateSelection(this.content);
        },

        clearSelection() {
            this.updateSelection([]);
        },

        updateSelection(content = []) {
            this.setContentSelection({
                history: this.history,
                selection: content
            })
        },

        //#endregion

        //#region Bulk Operations

        showHidden(evt) {
            this.showAllHiddenContent()
                .then(() => evt.vueTarget.hide())
                .catch(err => console.warn("Bad showHiddenContent", err));
        },

        deleteHidden(evt) {
            this.deleteAllHiddenContent()
                .then(() => evt.vueTarget.hide())
                .catch(err => console.warn("Bad deleteHiddenContent", err));
        },

        purgeDeleted(evt) {
            this.purgeDeletedContent()
                .then(() => evt.vueTarget.hide())
                .catch(err => console.warn("Bad purgeDeletedContent", err));
        },

        hideDatasets() {
            this.updateSelectedContent({
                history: this.history,
                field: "visible",
                value: false
            }).then(() => {
                this.clearContentSelection({
                    history: this.history
                });
            })
        },

        unhideDatasets() {
            this.updateSelectedContent({
                history: this.history,
                field: "visible",
                value: true
            });
        },

        deleteDatasets() {
            this.updateSelectedContent({
                history: this.history,
                field: "deleted",
                value: true
            }).then(() => {
                this.clearContentSelection({
                    history: this.history
                });
            })
        },

        undeleteDatasets() {
            this.updateSelectedContent({
                history: this.history,
                field: "deleted",
                value: false
            });
        },

        purgeDatasets() {
            console.log("purgeDatasets");
        },
        //#endregion

        //#region Legacy backbone modals for collection assembly 
        async buildDatasetList() {
            const modalSelection = await datasetListModal(this.currentSelection);
            const result = await this.createCollection({ 
                history: this.history, 
                selection: modalSelection
            })
            console.log("buildDatasetList", result);
        },

        async buildDatasetPair() {
            const modalSelection = await datasetPairModal(this.currentSelection)
            const result = await this.createCollection({ 
                history: this.history, 
                selection: modalSelection
            })
            console.log("buildDatasetPair", result);
        },

        async buildListOfPairs() {
            const modalSelection = await listOfPairsModal(this.currentSelection)
            const result = await this.createCollection({ 
                history: this.history, 
                selection: modalSelection
            })
            console.log("buildListOfPairs", result);
        },

        async buildCollectionFromRules() {
            const modalSelection = await collectionFromRulesModal(this.currentSelection)
            const result = await this.createCollection({ 
                history: this.history, 
                selection: modalSelection
            })
            console.log("buildCollectionFromRules", result);
        },
        //#endregion

        //#region Fixes for Bootstrap's many inadequacies
        
        // need to do this because bootstrap's components never close
        // as advertised
        closeMenu(refName) {
            if (refName in this.$refs) {
                this.$refs[refName].$emit('close');
            }
        }

        //#endregion

    },
    watch: {
        showSelection(newVal, oldVal) {
            if (!newVal) {
                this.clearSelection();
            }
            eventHub.$emit('toggleShowSelection', newVal);
        }
    }
}

</script>


<style lang="scss" scoped>

@import "~scss/mixins.scss";
@import "~scss/transitions.scss";

section>header {
    @include flexRowHeader();
}

</style>
