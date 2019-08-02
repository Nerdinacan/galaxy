<template>
    <div>

        <transition name="fade">
            <scroller v-if="content.length" :items="content" keyProp="hid"
                @itemIsVisible="onIsVisible"
                @itemIsAboveWindow="onIsAboveWindow"
                @itemIsBelowWindow="onIsBelowWindow">
                <template #default="{ item, index }">
                    <keep-alive>
                        <content-item :content="item" :tabindex="index" />
                    </keep-alive>
                </template>
            </scroller>
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
import { mapGetters } from "vuex";
import { SearchParams } from "../model/SearchParams";
import HistoryEmpty from "./HistoryEmpty";
import Scroller from "components/Form/Scroller";

export default {
    components: {
        // ContentItem, // globally registered to avoid recursion issue
        HistoryEmpty,
        Scroller
    },
    props: {
        content: {
            type: Array,
            required: false,
            default: () => []
        },
        params: {
            type: SearchParams,
            required: true
        }
    },
    data() {
        return {
            loading: true,

            // actually the top content entry since
            // query returns in hid descending
            end: Number.NEGATIVE_INFINITY,

            // hid for the bottom content item
            start: Number.POSITIVE_INFINITY
        }
    },

    methods: {

        onIsVisible({ hid }) {
            this.start = Math.min(this.start, hid);
            this.end = Math.max(this.end, hid);
        },

        onIsAboveWindow({ hid }) {
            this.end = Math.min(this.end, hid - 1);
        },

        onIsBelowWindow({ hid }) {
            this.start = Math.max(this.start, hid + 1);
        },

        updateParamRange([ start, end ]) {
            const newParams = this.params.clone();
            newParams.start = start;
            newParams.end = end;
            this.$emit("paramChange", newParams);
            this.loading = true;
        }
    },

    watch: {
        content() {
            this.loading = false;
            this.end = Number.NEGATIVE_INFINITY;
            this.start = Number.POSITIVE_INFINITY;
        }
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
    }
}

</script>
