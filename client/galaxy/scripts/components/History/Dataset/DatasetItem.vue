<!--
Dataset item. Monitors two types of data:
    content
        The summary data that comes from the polling manifest and
        ultimately the hda table
    dataset
        direct subscription to the local detailed dataset indexDb data.
        This data is loaded and cached when the dataset item is expanded, so
        avoid using data from the dataset property in uncollapsed views. If
        you find yourself needing fields from dataset, expand the historyContent
        schema and update queries.
-->

<template>
    <div :class="{ expanded, collapsed: !expanded }">

        <nav class="dataset-top-menu d-flex justify-content-between" @click="toggleDetails">
            <icon-menu>
                <content-selection-box :content="content" />
                <icon-menu-item :icon="expanded ? 'chevron-up' : 'chevron-down'"
                    :active="expanded"
                    @click.stop="toggleDetails" />
                <!-- <icon-menu-item icon="clock-o"  /> -->
            </icon-menu>
            <div class="hid flex-grow-1">
                <span>{{ content.hid }}</span>
            </div>
            <dataset-menu :content="content" :dataset="dataset" />
        </nav>

        <header :class="expanded ? 'p-3' : 'px-3 py-2'" @keyup.space.self="toggleDetails">

            <h4 v-if="!expanded">
                <a href="#" @click="toggleDetails">{{ title }}</a>
            </h4>
            <click-to-edit v-if="expanded && datasetName" tagName="h4" v-model="datasetName" />

            <annotation v-if="expanded"
                class="mt-1"
                tooltip-placement="left"
                v-model="annotation" />

            <!-- tags visible as nametags in collapsed, editor in expanded -->
            <nametags v-if="!expanded" :tags="content.tags"
                :storeKey="tagStoreName" />
            <dataset-tags v-if="expanded" :dataset="dataset"
                :historyId="dataset.history_id" />

        </header>

        <!-- #region expanded section -->

        <transition name="shutterfade">
            <div v-if="expanded" class="details px-3 pb-3">

                <component :is="summaryComponent" :dataset="dataset"
                    class="summary" />

                <div class="display-applications">
                    <div class="display-application"
                        v-for="app in displayLinks" :key="app.label">
                        <span class="display-application-location">
                            {{ app.label }}
                        </span>
                        <span class="display-application-links">
                            <a v-for="l in app.links" :key="l.href" :href="l.href" :target="l.target">
                                {{ l.text }}
                            </a>
                        </span>
                    </div>
                </div>

                <pre v-if="dataset.peek" class="dataset-peek" v-html="dataset.peek"></pre>

                <div v-if="showToolHelp && toolHelp" v-html="toolHelp" class="toolhelp"></div>
                <div v-if="showToolHelp && !toolHelp" class="toolhelp">
                    <strong>Tool help is unavailable for this dataset.</strong>
                </div>

                <textarea v-if="showRaw" :value="dataset"></textarea>

            </div>
        </transition>

        <!-- #endregion -->

    </div>
</template>


<script>

import { Dataset$, updateDatasetFields } from "./model/Dataset$";
import { loadToolFromDataset } from "./model/queries";
import { eventHub } from "components/eventHub";
import { capitalize, camelize } from "underscore.string";

import Annotation from "components/Form/Annotation";
import ClickToEdit from "components/Form/ClickToEdit";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import { Nametags } from "components/Nametags";
import DatasetTags from "./DatasetTags";
import DatasetMenu from "./DatasetMenu";
import ContentSelectionBox from "../ContentSelectionBox";

import STATES from "mvc/dataset/states";

import {
    Discarded, Empty, Error,
    New, NotViewable, Ok,
    Paused, Queued, Running,
    SettingMetadata, Upload
} from "./Summary";


export default {
    components: {
        Annotation,
        ClickToEdit,
        DatasetMenu,
        DatasetTags,
        IconMenu,
        IconMenuItem,
        Nametags,
        ContentSelectionBox,

        // summaries
        Discarded, Empty, Error,
        New, NotViewable, Ok,
        Paused, Queued, Running,
        SettingMetadata, Upload
    },
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            dataset: null,
            expand: false,
            showTags: false,
            showToolHelp: false,
            showRaw: false,
            toolHelp: null
        }
    },
    computed: {

        selected() {
            return this.isSelected(this.content);
        },

        unViewable() {
            return false;
            // return !this.dataset || this.dataset.state === STATES.NOT_VIEWABLE;
        },

        expanded() {
            return this.dataset && this.expand && !this.unViewable;
        },

        tagStoreName() {
            return `Dataset-${this.content.id}`;
        },

        annotation: {
            get() {
                return this.dataset.annotation || "";
            },
            set(annotation, oldAnnotation) {
                if (annotation !== oldAnnotation) {
                    this.updateDataset({ annotation });
                }
            }
        },

        datasetName: {
            get() {
                return this.dataset.name;
            },
            set(name, oldName) {
                if (name !== oldName) {
                    this.updateDataset({ name });
                }
            }
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

        loading() {
            return !this.dataset;
        },

        summaryComponent() {
            let state = this.dataset.state;
            if (state == STATES.FAILED_METADATA) {
                state = STATES.OK;
            }
            return capitalize(camelize(state));
        },

        title() {
            const { name, isDeleted, visible, purged } = this.content;

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
        }

    },
    methods: {

        // Holds off on subscribing to the dataset until they open
        // the expanded view. Caches result locally and future expansions
        // will compare the local datset update_time to the content update_time
        // (which is updated through polling) and only requery when the local
        // dataset value has gone stale

        load() {
            if (!this.datasetSub) {
                console.log("subscribing to live dataset observable");
                const sub = this.$subscribeTo(
                    Dataset$(this.content),
                    ds => this.dataset = ds,
                    err => console.warn("Dataset observable err", err),
                    () => console.log("Datset observable complete")
                );
                this.datasetSub = sub;
            }
        },

        async updateDataset(fields) {
            try {
                await updateDatasetFields(this.dataset, fields).toPromise();
            } catch(err) {
                console.warn("boo", err);
            }
        },

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
            this.toggle('expand');
        },

        collapse() {
            this.toggle('expand', false);
        },

        toggleTags() {
            this.toggle('showTags');
        },

        async toggleToolHelp(ds) {
            if (!this.isMe(ds)) return;
            try {
                if (this.toolHelp == null) {
                    const { help } = await loadToolFromDataset(this.dataset);
                    this.toolHelp = help || "";
                }
                this.showToolHelp = !this.showToolHelp;
            } catch(err) {
                console.warn("Error loading tool help", err);
            }
        },

        isMe(ds) {
            return ds.id == this.content.id;
        }
    },
    watch: {
        expand(newVal) {
            if (newVal) {
                this.load();
            }
        }
    },
    created() {
        eventHub.$on('collapseAllContent', this.collapse);
        eventHub.$on('toggleToolHelp', this.toggleToolHelp);
    },
    beforeDestroy() {
        eventHub.$off('collapseAllContent', this.collapse);
        eventHub.$off('toggleToolHelp', this.toggleToolHelp);
    }
}

</script>


<style lang="scss" scoped>

@import "theme/blue.scss";
@import "~scss/mixins.scss";

.hid {
    color: adjust-color($text-color, $alpha: -0.6);
    font-weight: 800;
    font-size: 90%;
    user-select: none;
    position: relative;
    span {
        display: block;
        position: absolute;
        top: 48%;
        left: 0%;
        transform: translateY(-50%);
        margin-left: 4px;
    }
}

header {

    h4,
    h4 a {
        display: block;
        color: $text-color;
        outline: none;
    }

    /* enlarge input to match h4 */
    /deep/ .clickToEdit input {
        font-size: $h4-font-size;
        font-weight: 500;
    }
}

.collapsed header h4 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.dataset-top-menu {
    cursor: pointer;
    margin: 3px 3px 0px 3px;
}

/* there's a quirk in flexbox containers, we need the strange
min-width setting to make the peek overflow properly */

.dataset {
    min-width: 0;
    .details .dataset-peek {
        width: auto;
        max-width: 100%;
        margin-bottom: 0;
        display: inline-block;
    }
}

</style>
