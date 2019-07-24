<template>
    <div>
        <transition name="fade">
            <div v-if="content.length" class="scrollContainer" ref="scrollContainer">
                <ol ref="scrollContent">
                    <li v-for="(c, index) in content" :key="c.type_id" 
                        class="d-flex mb-1">
                        <b-form-checkbox v-if="showSelection" class="m-1"
                            v-model="selection" :value="c" />
                        <content-item  class="flex-grow-1"
                            :type-id="c.type_id"
                            :tabindex="index"
                            v-observe-visibility="updatePageRange(c.hid)"
                            @keyup.space.stop.prevent.self="toggleContent(c)"
                            :data-state="c.state" />
                    </li>
                    <li class="sensor" v-observe-visibility="updatePageRange(nextPage)">
                        <p>Sensor nextPage: {{ nextPage }}</p>
                    </li> 
                </ol>
            </div>
        </transition>

        <transition name="fade">
            <b-alert v-if="!(loading || content.length)" class="m-3" show>
                <history-empty v-observe-visibility="updatePageRange(nextPage)" />
            </b-alert>
        </transition>

        <transition name="fade">
            <div v-if="loading" class="d-flex justify-content-center m-3">
                <b-spinner label="Loading..."></b-spinner>
            </div>
        </transition>

    </div>
</template>


<script>

import { mapGetters, mapActions } from "vuex";
import { debounce } from "debounce";
import { eventHub } from "components/eventHub";
import { ObserveVisibility } from "vue-observe-visibility";
import { SearchParams } from "./model/SearchParams";
import ContentItem from "./ContentItem";
import HistoryEmpty from "./HistoryEmpty";

export default {

    directives: {
        ObserveVisibility
    },

    components: {
        ContentItem,
        HistoryEmpty
    },

    props: {
        history: { type: Object, required: true }
    },

    data() {
        return {
            loading: true,
            showSelection: false,
            localParams: SearchParams.createForHistory(this.history)
        }
    },

    computed: {

        ...mapGetters("history", [
            "searchParams",
            "historyContent",
            "contentSelection"
        ]),

        params() {
            return this.searchParams(this.history.id).clone();
        },

        pageSize() {
            return this.params.pageSize;
        },

        content() {
            return this.historyContent(this.history.id);
        },

        minHid() {
            return this.content
                .map(c => c.hid)
                .reduce((a,b) => Math.min(a, b), this.history.hid_counter);
        },

        nextPage() {
            return this.minHid - this.pageSize;
        },

        selection: {
            get() {
                const selectionSet = this.contentSelection(this.history);
                return Array.from(selectionSet);
            },
            // bootstrap's stupid component fires this multiple times, one
            // for each checkbox, so debounce this function or we'll update
            // way too many times
            set: debounce(function(newList = []) {
                this.setContentSelection({
                    history: this.history,
                    selection: new Set(newList)
                });
            }, 50)
        }

    },

    methods: {

        ...mapActions("history", [
            "loadContent",
            "unsubLoader",
            "setSearchParams",
            "setContentSelection"
        ]),

        displaySelection(show) {
            this.showSelection = show;
        },

        toggleContent(content) {
            eventHub.$emit("collapseContent", content);
        },

        updatePageRange(hid) {
            if (hid < 0) return;
            function handler(isVisible, entry) {
                if (isVisible) {
                    this.localParams.expand(hid);
                } else {
                    if (this.isAboveWindow(entry)) {
                        this.localParams.clipTop(hid);
                    } else if(this.isBelowWindow(entry)) {
                        this.localParams.clipBottom(hid);
                    }
                }
                this.sendParams();
            }
            return handler.bind(this);
        },

        sendParams() {
            if (!SearchParams.equals(this.localParams, this.params)) {
                // this.loading = true;
                this.setSearchParams({
                    history: this.history,
                    params: this.localParams
                });
            }
        },

        getContainerRect() {
            return this.$refs.scrollContainer.getBoundingClientRect();
        },

        isAboveWindow(entry, index) {
            const { boundingClientRect } = entry;
            const containerRect = this.getContainerRect();
            return boundingClientRect.bottom < containerRect.top;
        },

        isBelowWindow({ boundingClientRect }) {
            return boundingClientRect.top > this.getContainerRect().bottom;
        }

    },

    watch: {

        // cosmetic loading flag, unset when content changes
        content(newContent) {
            this.loading = false;
        },

        // Subscribe to polling updates and content output observable
        history: {
            handler(history, oldHistory) {
                if (oldHistory && (history.id !== oldHistory.id)) {
                    this.unsubLoader(oldHistory.id);
                }
                this.loadContent(history.id);
            },
            immediate: true
        },

        // when params changes, create a local copy, that's what we
        // manipulate until it gets sent
        params(newParams) {
            if (!SearchParams.equals(newParams, this.localParams)) {
                this.localParams = newParams.clone();
            }
        }
    },

    mounted() {
        eventHub.$on('toggleShowSelection', this.displaySelection);
    },

    beforeDestroy() {
        this.unsubLoader(this.history.id);
        eventHub.$off('toggleShowSelection', this.displaySelection);
    }
}

</script>


<style lang="scss" scoped>

@import "~scss/mixins.scss";
@import "~scss/transitions.scss";

.scrollContainer {
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;
}

ol {
    @include list_reset();
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}

li.sensor {
    height: 1px;
    padding-bottom: 100px;
}

</style>
