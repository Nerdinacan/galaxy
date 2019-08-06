<template>
    <div :class="{ expanded, collapsed: !expanded }"
        :data-state="content.state"
        @keydown.self="onKeydown">

        <nav class="content-top-menu d-flex justify-content-between"
            @click="toggle('expand')">

            <icon-menu class="status-menu">
                <icon-menu-item v-if="showSelection"
                    icon="check"
                    :active="selected"
                    @click.stop="toggleSelection" />
                <icon-menu-item :active="expanded"
                    :icon="expanded ? 'chevron-up' : 'chevron-down'"
                    @click.stop="toggle('expand')" />
                <!--
                <icon-menu-item icon="clock-o" />
                <icon-menu-item icon="eye-slash" />
                <icon-menu-item icon="pause" />
                <icon-menu-item icon="exclamation" />
                -->
            </icon-menu>

            <div class="hid flex-grow-1">
                <span>{{ content.hid }}</span>
            </div>

            <dataset-menu :content="content" :dataset="dataset" />
        </nav>

        <header v-if="!expanded" class="px-3 py-2" >
            <h4>
                <a href="#" @click.stop="toggle('expand')">
                    {{ title }}
                </a>
            </h4>
            <nametags :tags="content.tags" :storeKey="tagStoreName" />
        </header>

        <header v-if="expanded" class="p-3" @mouseover.stop>
            <click-to-edit v-if="datasetName"
                tagName="h4" v-model="datasetName" />
            <annotation class="mt-1"
                tooltip-placement="left"
                v-model="annotation" />
            <dataset-tags :dataset="dataset"
                :historyId="dataset.history_id" />
        </header>

        <transition name="shutterfade">
            <div v-if="expanded" class="details px-3 pb-3">

                <dataset-summary :dataset="dataset" class="summary" />

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

                <pre v-if="dataset.peek" class="dataset-peek"
                    v-html="dataset.peek"></pre>

                <div v-if="showToolHelp && toolHelp" class="toolhelp"
                    v-html="toolHelp"></div>

                <div v-if="showToolHelp && !toolHelp" class="toolhelp">
                    <strong>Tool help is unavailable for this dataset.</strong>
                </div>

                <textarea v-if="showRaw" :value="dataset"></textarea>

            </div>
        </transition>

    </div>
</template>


<script>

import { mapGetters, mapActions } from "vuex";
import { pluck, startWith, tap } from "rxjs/operators";
import { eventHub } from "components/eventHub";

import { Dataset$, updateDataset } from "components/History/model/Dataset$";
import { loadToolFromDataset } from "components/History/model/queries";
import STATES from "mvc/dataset/states";

import Annotation from "components/Form/Annotation";
import ClickToEdit from "components/Form/ClickToEdit";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import { Nametags } from "components/Nametags";
import DatasetTags from "./DatasetTags";
import DatasetMenu from "./DatasetMenu";
import Summary from "./Summary";


export default {
    components: {
        Annotation,
        ClickToEdit,
        DatasetMenu,
        DatasetTags,
        IconMenu,
        IconMenuItem,
        Nametags,
        "dataset-summary": Summary
    },
    props: {
        content: { type: Object, required: true },
        selected: { type: Boolean, required: false, default: false },
        showSelection: { type: Boolean, required: false, default: false }
    },
    data() {
        return {
            dataset: null,
            loading: false,
            expand: false,
            showTags: false,
            showToolHelp: false,
            showRaw: false,
            toolHelp: null
        }
    },
    computed: {

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
                return this.dataset ? this.dataset.annotation : "";
            },
            set(annotation) {
                if (annotation !== this.dataset.annotation) {
                    this.updateModel({ annotation });
                }
            }
        },

        datasetName: {
            get() {
                return this.dataset ? this.dataset.name : "";
            },
            set(name) {
                if (name !== this.dataset.name) {
                    this.updateModel({ name });
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

        title() {
            return this.content.title();
        }

    },
    methods: {

        load() {
            if (!this.datasetSub) {

                const content$ = this.$watchAsObservable('content').pipe(
                    pluck('newValue'),
                    startWith(this.content)
                );

                this.datasetSub = this.$subscribeTo(
                    Dataset$(content$),
                    ds => this.dataset = ds,
                    err => console.warn("datasetSub err", err),
                    () => console.log("datasetSub complete")
                )
            }
        },

        unload() {
            if (this.datasetSub) {
                this.datasetSub.unsubscribe();
                this.datasetSub = null;
            }
        },

        updateModel(fields) {
            this.loading = true;
            return updateDataset(this.dataset, fields)
                .toPromise()
                .finally(() => {
                    this.loading = false;
                })
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

        toggleSelection() {
            this.$emit("update:selected", !this.selected);
        },

        open() {
            this.toggle('expand', true);
        },

        collapse() {
            this.toggle('expand', false);
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

        onKeydown(evt) {
            switch (evt.code) {
                case "Space":
                    if (this.showSelection) {
                        this.toggleSelection();
                    } else {
                        this.toggle('expand');
                    }
                    evt.preventDefault();
                    evt.stopPropagation();
                    break;
                case "ArrowUp":
                    this.collapse();
                    evt.preventDefault();
                    evt.stopPropagation();
                    break;
                case "ArrowDown":
                    this.open();
                    evt.preventDefault();
                    evt.stopPropagation();
                    break;
            }
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
@import "scss/mixins.scss";


/* enlarge input to match h4 */

header /deep/ .clickToEdit input {
    font-size: $h4-font-size;
    font-weight: 500;
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
