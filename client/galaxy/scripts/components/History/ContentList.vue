<template>
    <div>
        <transition name="fade">
            <div v-if="content.length" class="scrollContainer" ref="scrollContainer">
                <ol ref="scrollContent">
                    <li v-for="(c, index) in content" :key="c.type_id" class="d-flex mb-1">
                        <content-item class="flex-grow-1"
                            :type-id="c.type_id"
                            :tabindex="index"
                            v-observe-visibility="updatePageRange(c.hid)"
                            @keyup.space.stop.prevent.self="toggleContent(c)" />
                    </li>
                    <li class="sensor" v-observe-visibility="updatePageRange(nextPage)">
                        <p>Sensor nextPage</p>
                    </li>
                </ol>
            </div>
        </transition>

        <transition name="fade">
            <b-alert v-if="!(loading || content.length)" class="m-3" show>
                <history-empty v-observe-visibility="updatePageRange(-1)" />
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

// TODO: move scrolling features into a separate ui component

import { mapGetters, mapActions } from "vuex";
import { debounce } from "debounce";
import { eventHub } from "components/eventHub";
import { ObserveVisibility } from "vue-observe-visibility";
import { SearchParams } from "./model/SearchParams";
import ContentItem from "./ContentItem";
import HistoryEmpty from "./HistoryEmpty";

import { merge, combineLatest } from "rxjs";
import { pluck, debounceTime, distinctUntilChanged, filter } from "rxjs/operators";

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
            showSelection: false,
            start: Number.POSITIVE_INFINITY,
            end: Number.NEGATIVE_INFINITY
        }
    },

    computed: {

        ...mapGetters("history", [
            "historyContent",
            // "contentSelection",
            "searchParams"
        ]),

        params() {
            return this.searchParams(this.history.id);
        },

        content() {
            const content = this.historyContent(this.history.id);
            return content;
        },

        minHid() {
            return this.content
                .map(c => c.hid)
                .reduce((a,b) => Math.min(a, b), this.history.hid_counter);
        },

        nextPage() {
            return this.params.start - SearchParams.pageSize;
        },

        // selection: {
        //     get() {
        //         const selectionSet = this.contentSelection(this.history);
        //         return Array.from(selectionSet);
        //     },
        //     // bootstrap's stupid component fires this multiple times, one
        //     // for each checkbox, so debounce this function or we'll update
        //     // way too many times
        //     set: debounce(function(newList = []) {
        //         this.setContentSelection({
        //             history: this.history,
        //             selection: new Set(newList)
        //         });
        //     }, 100)
        // }

    },

    methods: {

        ...mapActions("history", [
            "loadContent",
            "unsubLoader",
            "setSearchParams",
            "setContentSelection"
        ]),

        toggleContent(content) {
            eventHub.$emit("collapseContent", content);
        },


        // Scrolling Methods, move to another component

        updatePageRange(hid) {
            function handler(isVisible, entry) {
                if (isVisible) {
                    this.expand(hid);
                } else {
                    if (this.isAboveWindow(entry)) {
                        this.clipTop(hid);
                    } else if(this.isBelowWindow(entry)) {
                        this.clipBottom(hid);
                    }
                }
            }
            return handler.bind(this);
        },

        // this one came into view
        expand(hid) {
            this.start = Math.min(this.start, hid);
            this.end = Math.max(this.end, hid);
        },

        // this one ran off the top
        clipTop(hid) {
            this.end = Math.min(this.end, hid - 1);
        },

        // ran off the bottom
        clipBottom(hid) {
            this.start = Math.max(this.start, hid + 1);
        },

        getContainerRect() {
            try {
                return this.$refs.scrollContainer.getBoundingClientRect();
            } catch(err) {
                return null;
            }
        },

        isAboveWindow(entry, index) {
            const { boundingClientRect } = entry;
            const containerRect = this.getContainerRect();
            if (containerRect) {
                return boundingClientRect.bottom < containerRect.top;
            }
            return false;
        },

        isBelowWindow({ boundingClientRect }) {
            const containerRect = this.getContainerRect();
            if (containerRect) {
                return boundingClientRect.top > containerRect.bottom;
            }
            return false;
        },

        setParameterRange([ start, end ]) {
            const params = this.params.clone();
            params.start = start;
            params.end = end;
            this.setSearchParams(params);
        },

        resetEndPoints() {
            this.start = Number.POSITIVE_INFINITY;
            this.end = Number.NEGATIVE_INFINITY;
        }

    },

    watch: {

        // cosmetic loading flag, unset when content changes
        // content(newContent) {
        //     this.loading = false;
        // },

        // Subscribe to polling updates and content output observable
        history: {
            handler(history, oldHistory) {
                this.resetEndPoints();
                if (oldHistory && (history.id !== oldHistory.id)) {
                    this.unsubLoader(oldHistory.id);
                }
                this.loadContent(history.id);
            },
            immediate: true
        },

    },

    created() {

        const start$ = this.$watchAsObservable('start').pipe(
            filter((n,o) => n !== o),
            pluck('newValue')
        );
        const end$ = this.$watchAsObservable('end').pipe(
            filter((n,o) => n !== o),
            pluck('newValue')
        );
        const range$ = combineLatest(start$, end$).pipe(
            debounceTime(500)
        );

        this.$subscribeTo(range$, this.setParameterRange);
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
}

li.sensor {
    height: 1px;
    padding-bottom: 100px;
}

</style>
