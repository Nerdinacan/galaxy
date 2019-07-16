<template>
    <div class="dataset">

        <header class="title-bar" :class="{ expanded: showDetails }">
            <span class="state-icon"></span>
            <h5 class="title">
                <a href="#" tabindex="0" @click="toggleDetails"
                    @keyup.space="toggleDetails">
                    {{ content.hid }}: {{ title }}
                </a>
            </h5>
            <dataset-menu v-if="dataset"
                class="flex-wrap justify-content-end"
                :dataset="dataset"
                :expanded="showDetails" />
        </header>

        <annotation v-if="showDetails" class="dataset-annotation"
            tooltip-placement="left" v-model="annotation" />

        <div v-if="tagStoreName && dataset">
            <nametags v-if="!showDetails"
                :tags="dataset.tags"
                :storeKey="tagStoreName" />
            <dataset-tags v-if="showDetails"
                :dataset="dataset"
                :historyId="content.history_id" />
        </div>

        <transition name="shutterfade">
            <div v-if="showDetails && dataset" class="details p-0 mt-1"
            style="{ min-width: 0 }">

                <div class="summary">
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

                <pre v-if="dataset.peek" class="dataset-peek"
                    v-html="dataset.peek"></pre>

                <!-- tool help -->
                <div v-if="showToolHelp && toolHelp" v-html="toolHelp" class="toolhelp"></div>
                <div v-if="showToolHelp && !toolHelp" class="toolhelp">
                    <strong>Tool help is unavailable for this dataset.</strong>
                </div>
                
                <textarea v-if="showRaw">{{ dataset }}</textarea>
                
            </div>
        </transition>


    </div>
</template>


<script>

import Vue from "vue";
import VueRx from "vue-rx";

import STATES from "mvc/dataset/states";

import { mapActions } from "vuex";

import { of } from "rxjs";
import { tap, map, filter, pluck, startWith, distinctUntilChanged } from "rxjs/operators";
import { getCachedDataset } from "../model/observables/CachedData";
import { prependPath, redirectToSiteUrl, backboneRedirect, iframeRedirect } from "utils/redirect";
import { loadToolFromDataset } from "./queries";
import { eventHub } from "components/eventHub";

import { IconMenu, IconMenuItem } from "components/IconMenu";
import Annotation from "components/Form/Annotation";
import { Nametags } from "components/Nametags";
import DatasetTags from "./DatasetTags";
import DatasetMenu from "./DatasetMenu";

Vue.use(VueRx);


export default {
    components: {
        DatasetMenu,
        DatasetTags,
        IconMenu,
        IconMenuItem,
        Annotation,
        Nametags
    },
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            showDetailsToggle: false,
            showTags: false,
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
                const { history_id, id: dataset_id } = this.content;

                this.updateDatasetFields({
                    history_id,
                    dataset_id,
                    fields: {
                        annotation
                    }
                });
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
                result = [
                    ...this.dataset.display_apps,
                    ...this.dataset.display_types
                ];
            }
            return result;
        },

        tagStoreName() {
            return this.dataset ? `Dataset-${this.dataset.id}` : null;
        },

        loading() {
            return !Boolean(this.dataset);
        }

    },
    methods: {

        ...mapActions("dataset", ["updateDatasetFields"]),

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
            if (!this.loading) {
                this.toggle('showDetailsToggle');
            }
        },

        collapse() {
            if (!this.loading) {
                this.toggle('showDetailsToggle', false);
            }
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

        async toggleToolHelp(ds) {
            if (ds.id != this.dataset.id) {
                return;
            }
            try {
                if (this.toolHelp == null) {
                    const { help } = await loadToolFromDataset(this.dataset);
                    this.toolHelp = help || "";
                }
                this.showToolHelp = !this.showToolHelp;
            } catch(err) {
                console.warn("Error loading tool help", err);
            }
        }
    },
    created() {
        eventHub.$on('collapse-content', this.collapse);
        eventHub.$on('toggleToolHelp', this.toggleToolHelp);
    },
    beforeDestroy() {
        eventHub.$off('collapse-content', this.collapse);
        eventHub.$off('toggleToolHelp', this.toggleToolHelp);
    }
}

</script>


<style lang="scss" scoped>

@import "~scss/mixins.scss";

.list-item .details {
    display: block;
    /* need to do this to override boostrap's free-wheeling use of !important */
    padding: 0 !important; 
}

.state-icon {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 16px;
    height: 16px;
    z-index: 10;
}

/* there's a bug in flexbox containers, we need the strange
min-width setting to make the peek overflow propertly */
.dataset {
    min-width: 0;
    .details .dataset-peek {
        width: auto;
        max-width: 100%;
        margin-bottom: 0;
        display: inline-block;
    }
}


/* Common CSS for all items
Most of this is attempting to override the horrible
bootstrap css which inserts !important making it irritating
to customize. */

.history-content-item.list-item {
    border: 0;
    header {
        @include flexRowHeader();
        align-items: baseline;
        min-height: 20px;
        padding: 0 0 0 0 !important;
        a {
            display: block;
            outline: none;
        }
    }
}

</style>
