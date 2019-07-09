<template>
    <div>

        <header>
            <h5>
                <a href="#" tabindex="0"
                    @keyup.space="toggleDetails" 
                    @click="toggleDetails">
                    {{ title }}
                </a>
            </h5>
            <primary-actions v-if="dataset" :dataset="dataset" />
        </header>

        <transition name="shutterfade">
            <div v-if="dataset && unViewable">
                unviewable message
            </div>
        </transition>

        <transition name="shutterfade">
            <div v-if="showDetails">

                <div>
                    State: {{ dataset.state }},
                    accessible: {{ dataset.accessible }}
                </div>

                <div>
                    <p>0 lines</p>
                    <p>format: tabular, database: ?</p>
                </div>

                <div v-if="dataset.misc_blurb">
                    <span>{{ dataset.misc_blurb }}</span>
                </div>
                <div v-if="dataset.file_ext">
                    <label>{{ 'format' | localize }}</label>
                    <span>{{ dataset.file_ext }}</span>
                </div>
                <div v-if="dataset.metadata_dbkey">
                    <label>{{ 'database' | localize }}</label>
                    <span>{{ dataset.metadata_dbkey }}</span>
                </div>
                <div v-if="dataset.misc_info">
                    <span>{{ dataset.misc_info }}</span>
                </div>

                <div class="d-flex justify-content-between align-items-center">

                    <secondary-actions :dataset="dataset" 
                        @toggleToolHelp="toggleToolHelp" />

                    <icon-menu>
                        <icon-menu-item
                            title="Edit Dataset Tags"
                            icon="tags"
                            @click="toggleTags"
                            tooltip-placement="topleft" />
                        <icon-menu-item
                            title="Edit Dataset Annotation"
                            icon="comment"
                            @click="toggleAnnotation"
                            tooltip-placement="topleft" />
                    </icon-menu>
                </div>

                <transition name="shutterfade">
                    <dataset-tags v-if="showTags" />
                </transition>

                <transition name="shutterfade">
                    <div v-if="showAnnotation">
                        Annotation!
                    </div>
                </transition>

                <div>
                    Display in IGB, View<br/>
                    Display with IGV, local<br/>
                </div>

                <transition name="shutterfade">
                    <dataset-peek v-if="showPeek" />
                </transition>
         
                <transition name="shutterfade">
                    <div v-if="showToolHelp && toolHelp" v-html="toolHelp"></div>
                </transition>

            </div>
        </transition>

    </div>
</template>


<script>

import Vue from "vue";
import VueRx from "vue-rx";

import STATES from "mvc/dataset/states";

import { of } from "rxjs";
import { tap, filter, pluck, startWith, distinctUntilChanged } from "rxjs/operators";
import { getCachedDataset } from "../model/observables/CachedData";
import { prependPath, redirectToSiteUrl, backboneRedirect, iframeRedirect } from "utils/redirect";
import { loadToolFromDataset } from "../model/queries";
import { eventHub } from "components/eventHub";

import PrimaryActions from "./PrimaryActions";
import SecondaryActions from "./SecondaryActions";
import DatasetTags from "./Tags";
import DatasetPeek from "./Peek";
import { IconMenu, IconMenuItem } from "components/IconMenu";

Vue.use(VueRx);

export default {
    components: {
        PrimaryActions,
        SecondaryActions,
        DatasetTags,
        DatasetPeek,
        IconMenu,
        IconMenuItem
    },
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            showDetailsToggle: false,
            showTags: false,
            showAnnotation: false,
            showPeek: false,
            showToolHelp: false,
            toolHelp: null
        }
    },
    computed: {
    
        title() {
            if (!this.dataset) {
                return "Loading";   
            }
            const { hid, name, isDeleted, visible, purged } = this.content;
            let result = name;
            const itemStates = [];
            if (isDeleted) {
                itemStates.push("Deleted");
            }
            if (visible == false) {
                itemStates.push("Hidden");
            }
            if (purged) {
                itemStates.push("Purged");
            }
            if (itemStates.length) {
                result += ` (${itemStates.join(", ")})`;
            }
            return result;
        },

        unViewable() {
            return !this.dataset || this.dataset.state === STATES.NOT_VIEWABLE;
        },

        showDetails() {
            return this.dataset && this.showDetailsToggle && !this.unViewable;
        }
    },
    methods: {
        
        go: redirectToSiteUrl,
        iframeGo: iframeRedirect, 
        backboneGo: backboneRedirect,
        
        toggleDetails() {
            this.showDetailsToggle = !this.showDetailsToggle;
        },
        collapse() {
            this.showDetailsToggle = false;
        },
        toggleTags() {
            this.showTags = !this.showTags;
        },
        toggleAnnotation() {
            this.showAnnotation = !this.showAnnotation;
        },
        toggleToolHelp() {
            this.loadTool()
                .catch(err => console.warn("err loading help", err))
                .finally(() => this.showToolHelp = !this.showToolHelp);
        },
        async loadTool() {
            if (!this.toolHelp) {
                const tool = await loadToolFromDataset(this.dataset);
                this.toolHelp = tool.help;
            }
            return this.toolHelp;
        }
    },
    subscriptions() {

        const dataset$ = this.$watchAsObservable("content", { immediate: true }).pipe(
            pluck("newValue", "id"),
            distinctUntilChanged(),
            getCachedDataset(),
            startWith(null)
        );

        return { 
            dataset: dataset$
        };
    },
    created() {
        eventHub.$on('collapse-content', this.collapse);
    },
    beforeDestroy() {
        eventHub.$off('collapse-content', this.collapse);
    }
}

</script>
