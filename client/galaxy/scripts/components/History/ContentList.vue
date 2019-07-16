<template>
    <div>
        <transition name="fade">
            <div v-if="content.length" class="scrollContainer"
            ref="scrollContainer">

                <ol ref="scrollContent">
                    <li v-for="(c, index) in content" :key="c.type_id"
                        class="d-flex p-2 mb-1"
                        :data-state="c.state"
                        v-observe-visibility="updatePageRange(c.hid)">
                        <b-form-checkbox v-if="showSelection"
                            v-model="selection" :value="c" />
                        <content-item class="flex-grow-1"
                            :content="c" />
                    </li>
                </ol>

            </div>
        </transition>

        <transition name="fade">
            <b-alert v-if="!(loading || content.length)" class="m-3" show>
                <history-empty />
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

        content() {
            return this.historyContent(this.history.id);
        },

        hids() {
            return this.content.map(c => c.hid);
        },

        minHid() {
            return this.hids.reduce((result, hid) => {
                return Math.min(result, hid);
            }, this.history.hid_counter);
        },

        maxHid() {
            return this.hids.reduce((result, hid) => {
                return Math.max(result, hid);
            }, 0);
        },

        selection: {
            get() {
                const selectionSet = this.contentSelection(this.history);
                return Array.from(selectionSet);
            },
            // bootstrap's stupid component fires this multiple times, one
            // for each checkbox, so debounce this function
            set: debounce(function(newList = []) {
                this.setContentSelection({
                    history: this.history,
                    selection: new Set(newList)
                });
            }, 100, true)
        }
    },

    methods: {

        ...mapActions("history", [
            "loadContent",
            "unsubLoader",
            "setSearchParams",
            "setContentSelection"
        ]),

        itemClasses(c) {
            const stateClass = this.itemStateClass(c);
            const classConfig = {};
            if (stateClass) {
                classConfig[stateClass] = true;
            }
            return classConfig;
        },

        displaySelection(show) {
            this.showSelection = show;
        },

        updateParams(newParams) {
            if (!SearchParams.equals(newParams, this.params)) {
                newParams.report("sending new params");
                this.setLoading(true);
                this.setSearchParams({
                    history: this.history,
                    params: newParams
                });
            }
        },


        // Scrolling

        showSensor(hid) {
            const edging = 5;
            if (Math.abs(this.maxHid - hid) <= edging) {
                return true;
            }
            if (Math.abs(this.minHid - hid) <= edging) {
                return true;
            }
            return false;
        },

        updatePageRange(hid) {
            function handler(isVisible, entry) {
                if (isVisible) {
                    this.localParams.expand(hid);
                } else {
                    if (this.isAboveWindow(entry)) {
                        this.localParams.clipTop(hid);
                    }
                    if (this.isBelowWindow(entry)) {
                        this.localParams.clipBottom(hid);
                    }
                }
            }

            return handler.bind(this);
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
        },

        setLoading: debounce(function(val) {
            this.loading = val;
        }, 100, true)
    },

    watch: {
        content(newContent) {
            this.setLoading(false);
        },
        history:{
            handler(history, oldHistory) {
                if (oldHistory && (history.id !== oldHistory.id)) {
                    this.unsubLoader(oldHistory.id);
                }
                this.loadContent(history.id);
            },
            immediate: true
        },
        params(newParams) {
            if (!SearchParams.equals(newParams, this.localParams)) {
                // console.log("updating localParams from params", newParams);
                this.localParams = newParams.clone();
            }
        },
        localParams: {
            handler: debounce(function(newParams) {
                this.updateParams(newParams);
            }, 100, true),
            deep: true
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
    padding-bottom: 100px;
}

li {
    position: relative;
    > .history-content  {
        position: relative;
        z-index: 0;
    }
}

.sensor {
    position: abolute;
    top: 0px;
    left: 0px;
    height: 40px;
    width: 1px;
    background-color: red;
    z-index: 1;
}

</style>
