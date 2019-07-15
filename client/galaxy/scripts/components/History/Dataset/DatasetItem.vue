<template>
    <div class="dataset">

        <header class="title-bar">
            <h5 class="title">
                <span v-if="!dataset">
                    {{ content.hid }}: {{ title || '' }}...
                </span>
                <a v-if="dataset" href="#" tabindex="0"
                    @keyup.space="toggleDetails" 
                    @click="toggleDetails">
                    {{ content.hid }}: {{ title }}
                </a>
            </h5>
            <b-spinner v-if="!dataset" small label="Loading..." 
                class="ml-auto"></b-spinner>
            <primary-actions v-if="dataset" :dataset="dataset" />
        </header>

        <!--
        <transition name="shutterfade">
            <div v-if="dataset && unViewable">
                unviewable message
            </div>
        </transition>
        -->

        <transition name="shutterfade">
            <div v-if="showDetails && dataset" class="details p-0 mt-3">

                <annotation class="dataset-annotation mt-1" 
                    tooltip-placement="left"
                    v-model="annotation" />

                <div class="summary">
                    <!-- detail messages -->
                    <div v-if="dataset.misc_blurb" class="blurb">
                        <span class="value">{{ dataset.misc_blurb }}</span>
                    </div>
                    <div v-if="dataset.file_ext" class="datatype">
                        <label class="prompt">{{ 'format' | localize }}</label>
                        <span class="value">{{ dataset.file_ext }}</span>
                    </div>
                    <div v-if="dataset.metadata_dbkey" class="dbkey">
                        <label class="prompt">{{ 'database' | localize }}</label>
                        <span class="value">{{ dataset.metadata_dbkey }}</span>
                    </div>
                    <div v-if="dataset.misc_info">
                        <span>{{ dataset.misc_info }}</span>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center">

                    <secondary-actions :dataset="dataset" 
                        @toggleToolHelp="toggleToolHelp" />

                    <icon-menu>
                        <icon-menu-item
                            title="Show Raw Data (Debug)"
                            icon="eye"
                            @click="toggleRaw"
                            tooltip-placement="topleft" />
                        <icon-menu-item
                            title="Edit Dataset Tags"
                            icon="tags"
                            @click="toggleTags"
                            tooltip-placement="topleft" />
                    </icon-menu>
                </div>

                <transition name="shutterfade">
                    <dataset-tags v-if="showTags" />
                </transition>

                <div class="display-applications">
                    <div class="display-application" v-for="app in displayLinks">
                        <span class="display-application-location">
                            {{ app.label }}
                        </span>
                        <span class="display-application-links">
                            <a v-for="l in app.links" :href="l.href" :target="l.target">
                                {{ l.text }}
                            </a>
                        </span>
                    </div>
                </div>

                <transition name="shutterfade">
                    <dataset-peek v-if="showPeek" class="dataset-peek" />
                </transition>
         
                <transition name="shutterfade">
                    <div v-if="showToolHelp && toolHelp" v-html="toolHelp"></div>
                </transition>

                <transition name="shutterfade">
                    <textarea v-if="showRaw">{{ dataset }}</textarea>
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
import { tap, map, filter, pluck, startWith, distinctUntilChanged } from "rxjs/operators";
import { getCachedDataset } from "../model/observables/CachedData";
import { prependPath, redirectToSiteUrl, backboneRedirect, iframeRedirect } from "utils/redirect";
import { loadToolFromDataset } from "../model/queries";
import { eventHub } from "components/eventHub";
import { debounce } from "debounce";

import PrimaryActions from "./PrimaryActions";
import SecondaryActions from "./SecondaryActions";
import DatasetTags from "./Tags";
import DatasetPeek from "./Peek";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import Annotation from "components/Form/Annotation";

Vue.use(VueRx);

export default {
    components: {
        PrimaryActions,
        SecondaryActions,
        DatasetTags,
        DatasetPeek,
        IconMenu,
        IconMenuItem,
        Annotation
    },
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            showDetailsToggle: false,
            showTags: false,
            showPeek: false,
            showToolHelp: false,
            showRaw: false,
            toolHelp: null
        }
    },
    subscriptions() {

        const dataset = this.$watchAsObservable("content", { immediate: true }).pipe(
            pluck("newValue", "id"),
            distinctUntilChanged(),
            getCachedDataset(),
            startWith(null)
        );

        return { dataset };
    },
    computed: {

        annotation: {
            get() {
                return this.dataset ? this.dataset.annotation : "";
            },
            set(annotation) {
                console.log("set annotation", annotation);
            }
        },

        title() {

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
        },

        displayLinks() {
            let result = [];
            if (this.dataset) {
                result = [ ...this.dataset.display_apps, ...this.dataset.display_types ];
            }
            return result;
        },
    },
    methods: {
        
        go: redirectToSiteUrl,
        iframeGo: iframeRedirect, 
        backboneGo: backboneRedirect,
        
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

        toggleDetails() {
            this.toggle('showDetailsToggle');
        },

        collapse() {
            this.toggle('showDetailsToggle', false);
        },

        toggleTags() {
            this.toggle('showTags');
        },

        toggleAnnotation(bForce) {
            this.toggle('editAnnotation', bForce);
        },

        toggleRaw() {
            this.toggle('showRaw');
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
    created() {
        eventHub.$on('collapse-content', this.collapse);
    },
    beforeDestroy() {
        eventHub.$off('collapse-content', this.collapse);
    }
}

</script>


<style lang="scss" scoped>

/* TODO: murder to all frameworks which use !important */

.list-item .details {
    display: block;
    padding: 0 !important; 
}

</style>