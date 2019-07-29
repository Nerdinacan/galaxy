<template>
    <div :class="{ expanded, collapsed: !expanded, selected }">

        <!-- #region dataset top button bar -->
        <nav class="dataset-top-menu d-flex justify-content-between" 
            @click="toggleDetails">

            <icon-menu class="status-menu">
                <icon-menu-item :active="expanded"
                    :icon="expanded ? 'chevron-up' : 'chevron-down'"
                    @click.stop="toggleDetails" />
                <!-- <icon-menu-item icon="clock-o" />
                <icon-menu-item icon="eye-slash" />
                <icon-menu-item icon="pause" />
                <icon-menu-item icon="exclamation" /> -->
            </icon-menu>
            
            <div class="hid flex-grow-1">
                <span>{{ content.hid }}</span>
            </div>

            <dataset-menu :content="content" :dataset="dataset" />

        </nav>
        <!-- #endregion -->

        <!-- #region dataset header always visible -->
        <header :class="expanded ? 'p-3' : 'px-3 py-2'">
 
            <div class="d-flex">
                <content-selection-box 
                    class="content-select-box" 
                    :content="content" />
                <div>
                    <h4 v-if="!expanded">
                        <a href="#" @click.stop="toggleDetails">
                            {{ title(content) }}
                        </a>
                    </h4>
                    <click-to-edit v-if="expanded && datasetName" 
                        tagName="h4" v-model="datasetName" />
                </div>
            </div>

            <annotation v-if="expanded" class="mt-1"
                tooltip-placement="left"
                v-model="annotation" />

            <!-- tags visible as nametags in collapsed, editor in expanded -->
            <nametags v-if="!expanded" :tags="content.tags"
                :storeKey="tagStoreName" />
            <dataset-tags v-if="expanded" :dataset="dataset"
                :historyId="dataset.history_id" />

        </header>
        <!-- #endregion -->

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

import { mapGetters } from "vuex";
import { capitalize, camelize } from "underscore.string";
import { Dataset$, updateDatasetFields } from "./model/Dataset$";
import { loadToolFromDataset } from "./model/queries";
import { eventHub } from "components/eventHub";
import STATES from "mvc/dataset/states";

import Annotation from "components/Form/Annotation";
import ClickToEdit from "components/Form/ClickToEdit";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import { Nametags } from "components/Nametags";
import DatasetTags from "./DatasetTags";
import DatasetMenu from "./DatasetMenu";
import ContentSelectionBox from "../Content/ContentSelectionBox";
import { Discarded, Empty, Error, New, NotViewable, Ok, Paused, 
    Queued, Running, SettingMetadata, Upload } from "./Summary";

// import { create } from "rxjs-spy";
// import { tag } from "rxjs-spy/operators";
// window.spy = create();


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
            loading: false,
            dataset: null,
            expand: false,
            showTags: false,
            showToolHelp: false,
            showRaw: false,
            toolHelp: null
        }
    },
    computed: {

        ...mapGetters("history", ["contentIsSelected"]),

        selected() {
            return this.contentIsSelected(this.content);
        },

        unViewable() {
            return !this.dataset || this.dataset.state === STATES.NOT_VIEWABLE;
        },

        expanded() {
            return this.dataset && this.expand;
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

        summaryComponent() {
            let state = this.dataset.state;
            if (state == STATES.FAILED_METADATA) {
                state = STATES.OK;
            }
            return capitalize(camelize(state));
        },

    },
    methods: {

        load() {
            if (!this.datasetSub) {
                this.datasetSub = this.$subscribeTo(
                    Dataset$(this.content),
                    ds => {
                        this.loading = false;
                        this.dataset = ds;
                    },
                    err => console.warn("Dataset observable err", err)
                )
            }
        },

        unload() {
            if (this.datasetSub) {
                this.datasetSub.unsubscribe();
                this.dataset = null;
                this.loading = false;
                this.datasetSub = null;
            }
        },

        async updateDataset(fields) {
            try {
                this.loading = true;
                await updateDatasetFields(this.dataset, fields).toPromise();
            } catch(err) {
                this.loading = false;
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
        },

        title(data) {
            const { name, isDeleted, visible, purged } = data;

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
    watch: {
        expand(newVal) {
            newVal ? this.load() : this.unload();
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
        top: 52%;
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
}

/* there's a quirk in flexbox containers, we need the strange
min-width setting to make the peek overflow properly */

.dataset {
    min-width: 0;
    border-style: none;
    border-width: 0;
    .details .dataset-peek {
        width: auto;
        max-width: 100%;
        margin-bottom: 0;
        display: inline-block;
    }
}



</style>
