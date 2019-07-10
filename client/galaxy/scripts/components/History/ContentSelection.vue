<template>
    <section>

        <header>
            <h6>
                <span>Contents</span>
                <span>{{ countShown }} shown</span>
                <span v-if="countHidden">
                    <a v-if="!params.showHidden" href="#"
                        @click="params.showHidden = true">
                        {{ countHidden }} hidden
                    </a>
                    <a v-if="params.showHidden" href="#"
                        @click="params.showHidden = false">
                        hide hidden
                    </a>
                </span>
            </h6>
            
            <icon-menu>
                <icon-menu-item
                    title="Filter History Content"
                    icon="filter"
                    @click="toggle('showFilter')"
                    tooltip-placement="topleft" />
                <icon-menu-item
                    title="Operations on multiple datasets"
                    icon="check-square-o"
                    @click="toggle('showSelection')"
                    tooltip-placement="topleft" />
                <icon-menu-item id="datasetMenuGear"
                    title="Dataset Operations"
                    icon="cog"
                    :useTooltip="false" />
            </icon-menu>
        </header>

        <!-- search parameters -->
        <transition name="shutterfade">
            <content-filters v-if="showFilter"
                class="content-filters mt-2"
                v-model="params" 
                :history="history" />
        </transition>

        <!-- dataset selection -->
        <transition name="shutterfade">
            <b-button-toolbar v-if="showSelection"
                class="content-selection justify-content-between mt-2">
                
                <b-button-group>

                    <b-button size="sm" @click="selectAllVisibleContent">
                        {{ 'Select All' | localize }}
                    </b-button>

                    <b-button size="sm" @click="clearSelection">
                        {{ 'Unselect All' | localize }}
                    </b-button>
        
                    <b-dropdown size="sm" text="With Selected" boundary="viewport">
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

        <b-popover ref="datasetMenu" target="datasetMenuGear"
            placement="bottomleft" triggers="focus">

            <gear-menu #default="{ go, backboneGo, iframeGo, eventHub }"
                @clicked="$refs.datasetMenu.$emit('close')">
                <div>
                    <a class="dropdown-item" @click="iframeGo('/dataset/copy_datasets')">
                        {{ 'Copy Datasets' | localize }}
                    </a>
                    <a class="dropdown-item" href="#"
                        @click="backboneGo('/histories/permissions?id=' + history.id)">
                        {{ 'Dataset Security' | localize }}
                    </a>
                    <a class="dropdown-item" href="#"
                        @click="iframeGo('/history/resume_paused_jobs?current=True')">
                        {{ 'Resume Paused Jobs' | localize }}
                    </a>
                    <a class="dropdown-item" href="#"
                        @click="eventHub.$emit('collapse-content')">
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

        <b-modal id="show-hidden-content"
            title="Show Hidden Datasets" title-tag="h2"
            @ok="showHidden">
            <p>{{ messages.unhideContent | localize }}</p>
        </b-modal>

        <b-modal id="delete-hidden-content"
            title="Delete Hidden Datasets" title-tag="h2"
            @ok="deleteHidden">
            <p>{{ messages.deleteHiddenContent | localize }}</p>
        </b-modal>

        <b-modal id="purge-deleted-content"
            title="Purge Deleted Datasets" title-tag="h2"
            @ok="purgeDeleted">
            <p>{{ messages.purgeDeletedContent | localize }}</p>
        </b-modal>

    </section>
</template>

<script>

import { mapGetters, mapActions } from "vuex";
import ContentFilters from "./ContentFilters";
import GearMenu from "./GearMenu";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import { eventHub } from "components/eventHub";

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

        ...mapGetters("history", ["historyContent", "searchParams"]),

        historyId() {
            return this.history.id;
        },
        content() {
            return this.historyContent(this.historyId);
        },
        params: {
            get() {
                return this.searchParams(this.historyId);
            },
            set(newParams) {
                this.setSearchParams({
                    history: this.history,
                    params: newParams
                });
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
            "updateSelectedContent"
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


        // content selection

        selectAllVisibleContent() {
            this.updateSelection(this.content);
        },

        clearSelection() {
            this.updateSelection([]);
        },

        updateSelection(content = []) {
            this.setContentSelection({
                history: this.history,
                selection: new Set(content)
            })
        },

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


        // selection menu

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
            this.clearContentSelection({
                history: this.history
            });
        },

        purgeDatasets() {
            console.log("purgeDatasets");
        },

        buildDatasetList() {
            console.log("buildDatasetList");
        },

        buildDatasetPair() {
            console.log("buildDatasetPair");
        },

        buildListOfPairs() {
            console.log("buildListOfPairs");
        },

        buildCollectionFromRules() {
            console.log("buildCollectionFromRules");
        }

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
