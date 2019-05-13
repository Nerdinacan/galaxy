<template>
    <section class="history" :class="stateClasses">
        <header>

            <slot name="nav" />

            <hgroup class="historyDetails">

                <!-- todo: editable name header -->
                
                <h2><input v-model="historyName" /></h2>
                <p>{{ countShown }} shown, {{ countHidden }} hidden</p>
                <p>{{ sizeDisplay }}</p>

                <!-- 3 button menu -->
                <button @click="toggleFlag('selectionActive')">
                    Select
                </button>
                <button @click="toggleFlag('tagsActive')">
                    Tags
                </button>
                <button @click="toggleFlag('annotationActive')">
                    Annotation
                </button>
                <button @click="unsub">
                    unsub
                </button>

            </hgroup>

            <transition name="shutterfade">
                <hgroup v-if="tagsActive">
                    <h3>Tags</h3>
                    <history-tags :history="history" />
                </hgroup>
            </transition>

             <transition name="shutterfade">
                <hgroup v-if="annotationActive">
                    <h3>Annotation</h3>
                    <textarea v-model="annotation"></textarea>
                </hgroup>
            </transition>

            <transition name="shutterfade">
                <hgroup v-if="selectionActive" class="selectionUtils">
                    <button @click="selectAllVisibleContent">Select All</button>
                    <button @click="clearSelection">Clear Selection</button>
                    <!-- TODO:  For all selected... -->
                </hgroup>
            </transition>

            <hgroup class="historyFilters">
                <history-search-params v-model="params" />
            </hgroup>

        </header>

        <history-content v-if="historyContent"
            :historyContent="historyContent"
            @paginate="paginate" />

    </section>
</template>

<script>

import { mapActions } from "vuex";
import { SearchParams } from "./model";
import { loadHistoryById } from "./model/queries";
import HistoryContent from "./HistoryContent";
import HistorySearchParams from "./HistorySearchParams";
import HistoryTags from "./HistoryTags";
import debounce from "debounce";


export default {
    components: {
        HistoryContent,
        HistorySearchParams,
        HistoryTags
    },
    props: {
        history: { type: Object, required: true }
    },
    data() {
        return {
            params: new SearchParams(),
            selectionActive: false,
            tagsActive: false,
            annotationActive: false
        };
    },
    computed: {
        historyContent() {
            let filterText = this.params.filterText;
            let getContent = this.$store.getters["history/historyContent"];
            return getContent(this.history.id).filter(content => {
                return this.filterContent(content, filterText);
            });
        },
        requestParams() {
            let { history, params } = this;
            return { history, params };
        },
        stateClasses() {
            let { selectionActive } = this;
            return { selectionActive };
        },
        countShown() {
            return this.history.contents_active.active;
        },
        countHidden() {
            return this.history.contents_active.hidden;
        },
        sizeDisplay() {
            return this.history.size + ` display stuff`;
        },
        annotation: {
            get() {
                return this.history.annotation;
            },
            set: debounce(function(annotation) {
                this.updateFields({ annotation });
            }, 1000)
        },
        historyId() {
            return this.history.id;
        },
        historyName: {
            get() {
                return this.history.name;
            },
            set: debounce(function(name) {
                this.updateFields({ name });
            }, 1000)
        }
    },
    methods: {

        ...mapActions("history", [
            "loadContent",
            "unsubLoader",
            "updateHistory"
        ]),

        updateFields(fields) {
            this.updateHistory({
                history: this.history,
                fields
            });
        },

        toggleFlag(paramName, forceVal) {
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

        // list pagination, just extend page size for now
        paginate(numRows) {
            const newParams = this.params.clone();
            newParams.pageSize = newParams.minPageSize + numRows;
            this.params = newParams;
        },
        filterContent(content, strFilter) {
            const source = content.name.toLowerCase();
            const searchTerm = strFilter.toLowerCase();
            return searchTerm.length ? source.includes(searchTerm) : true;
        },

        // content selection
        selectAllVisibleContent() {
            const ids = this.historyContent.map(o => o.type_id);
            this.$store.commit("history/setContentSelection", ids);
        },
        clearSelection() {
            this.$store.commit("history/setContentSelection", []);
        },

        // History updates
        saveAnnotation() {
            console.log("saveAnnotation", arguments);
        },

        unsub() {
            console.log("manually unsubscribing");
            this.unsubLoader(this.history.id)
        }

    },
    watch: {
        requestParams: {
            handler(p) {
                return this.loadContent(p);
            },
            immediate: true
        },
        historyId(newId, oldId) {
            if (oldId) {
                this.unsubLoader(oldId);
            }
        }
    },
    beforeDestroy() {
        this.unsubLoader(this.history.id);
    }
}

</script>

<style lang="scss" src="./history.scss"></style>