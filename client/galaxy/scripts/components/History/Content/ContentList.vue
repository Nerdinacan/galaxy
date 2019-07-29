<template>
    <div>

        <transition name="fade">
            <div v-if="content.length" class="scrollContainer" ref="scrollContainer">
                <ol ref="scrollContent">
                    <li v-for="(c, index) in content" :key="c.type_id" class="mb-1">
                        <div class="sensor" v-if="showSensor(index)" 
                            v-observe-visibility="updatePageRange(c.hid)"></div>
                        <content-item :content="c" :tabindex="index" />
                    </li>
                    <div v-observe-visibility="updatePageRange(nextPage)">
                        <!-- Load until: {{ nextPage }} -->
                    </div>
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

import { combineLatest } from "rxjs";
import { pluck, filter, debounceTime, distinctUntilChanged } from "rxjs/operators";
import { mapGetters, mapActions } from "vuex";
import { ObserveVisibility } from "vue-observe-visibility";
import { SearchParams } from "../model/SearchParams";
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
            loading: false,
            
            // actually the top content entry since
            // query returns in hid descending
            end: Number.NEGATIVE_INFINITY,

            // hid for the bottom content item
            start: Number.POSITIVE_INFINITY
        }
    },

    computed: {

        ...mapGetters("history", [
            "historyContent",
            "searchParams"
        ]),

        params() {
            if (this.history) {
                return this.searchParams(this.history.id);
            }
            return null;
        },

        content() {
            if (this.history) {
                return this.historyContent(this.history.id);
            }
            return [];
        },

        minHid() {
            const hids = this.content.map(c => c.hid);
            return Math.min(this.history.hid_counter, ...hids);
        },

        nextPage() {
            return Math.max(this.minHid - SearchParams.pageSize, 0);
        }
    },

    methods: {

        ...mapActions("history", [
            "loadContent",
            "unsubLoader",
            "setSearchParams",
            "setContentSelection"
        ]),

        updatePageRange(hid) {

            function handler(isVisible, entry) {

                // this one came into view
                if (isVisible) {
                    this.start = Math.min(this.start, hid);
                    this.end = Math.max(this.end, hid);
                    return;
                }

                // item left view
                const containerRect = this.getContainerRect();
                if (containerRect) {
                    if (this.isAboveWindow(containerRect, entry)) {
                        // ran off the top
                        this.end = Math.min(this.end, hid - 1);
                    } else if(this.isBelowWindow(containerRect, entry)) {
                        // ran off the bottom
                        this.start = Math.max(this.start, hid + 1);
                    }
                }
            }

            return handler.bind(this);
        },

        getContainerRect() {
            try {
                return this.$refs.scrollContainer.getBoundingClientRect();
            } catch(err) {
                return null;
            }
        },

        isAboveWindow(containerRect, { boundingClientRect }) {
            return boundingClientRect.bottom < containerRect.top;
        },

        isBelowWindow(containerRect, { boundingClientRect }) {
            return boundingClientRect.top > containerRect.bottom;
        },

        updateParamRange([ start, end ]) {
            const newParams = this.params.clone();
            newParams.start = start;
            newParams.end = end;
            this.sendParams(newParams);
        },

        sendParams(newParams) {
            this.setSearchParams(newParams);
            this.loading = true;
        },

        showSensor(index) {
            return true;
        }

    },

    watch: {

        content() {
            this.loading = false;
            this.end = this.content.hid_counter;
            this.start = Number.POSITIVE_INFINITY;
        },

        params() {
            this.loading = true;
        },

        // Subscribe to polling updates and content output observable
        history: {
            handler(history, oldHistory) {
                if (oldHistory && (history.id !== oldHistory.id)) {
                    this.unsubLoader(oldHistory.id);
                }
                this.loading = true;
                this.loadContent(history.id);
            },
            immediate: true
        },

    },

    created() {

        const start$ = this.$watchAsObservable('start').pipe(
            pluck('newValue'),
            distinctUntilChanged()
        );
        const end$ = this.$watchAsObservable('end').pipe(
            pluck('newValue'),
            distinctUntilChanged()
        );
        const range$ = combineLatest(start$, end$).pipe(
            filter(([ start, end ]) => {
                return (start < Number.POSITIVE_INFINITY)
                    && (end > Number.NEGATIVE_INFINITY)
                    && (end >= start);
            }),
            debounceTime(250)
        );

        this.$subscribeTo(range$, this.updateParamRange);

        // init the pagination
        // this.sendParams(this.params);
    },

    beforeDestroy() {
        this.unsubLoader(this.history.id);
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
    padding-bottom: 100px;
}

ol li {
    position: relative;
}

.sensor {
    position: absolute;
    height: 1px;
    width: 1px;
    bottom: 0;
    left: 0;
}

</style>
