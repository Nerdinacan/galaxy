import Vue from "vue";
import { vueRxShortcutPlugin } from "components/plugins";
import { SearchParams } from "../model/SearchParams";
import { isFiniteNumber } from "./utils";

Vue.use(vueRxShortcutPlugin);

export const ContentProvider = {
    props: {
        // base input, a history object, a collection, whatever the container
        // for this content is. The "subclass" will characterize this property
        // as a history or a collection.
        parent: { type: Object, required: true },

        // size of the resulting content window
        pageSize: { type: Number, default: SearchParams.pageSize },

        // delay between various things, reduces unnecessary operations in the streams
        debouncePeriod: { type: Number, default: 100 },

        // disables cache watch (probably for testing)
        disableWatch: { type: Boolean, default: false },

        // disables ajax loading & polling
        disableLoad: { type: Boolean, default: false },

        // testing prop
        debug: { type: Boolean, default: false },
    },

    computed: {
        busy() {
            return this.loading || this.scrolling;
        },
    },

    data() {
        return {
            payload: {},
            params: new SearchParams(),
            scrollPos: { cursor: 0.0, key: null },
            loading: false,
            scrolling: false,
        };
    },

    created() {
        const { cache$, loader$, loading$, scrolling$ } = this.initStreams();

        this.listenTo(scrolling$, (val) => (this.scrolling = val));
        this.listenTo(loading$, (val) => (this.loading = val));

        // render output
        if (!this.disableWatch) {
            this.listenTo(cache$, {
                next: (payload) => this.setPayload(payload),
                error: (err) => console.warn("error in cache$", err),
                complete: () => console.warn("why did cache$ complete?"),
            });
        }

        // keep sub to loader which popualates the cache
        if (!this.disableLoad) {
            this.listenTo(loader$, {
                // next: (result) => console.log("loader$ result", result),
                error: (err) => console.warn("error in loader$", err),
                complete: () => console.warn("why did loader$ complete?"),
            });
        }
    },

    methods: {
        /**
         * Initialize external rxjs querying and cache logic with inputs from
         * the component, output should be an object containing 4 observables:
         * cache$, loader$, loading$, scrolling$, which are subscribed to in the
         * created lifecycle hook (above).
         *
         * @return  {Object}  Object with for observables
         */
        initStreams() {
            throw new Error("Override initStreams in your provider component");
        },

        /**
         * Handler for the scroller to update its position, either by key or
         * cursor (0-1 value representing how far down it is)
         *
         * @param {object} Object consisting of key and cursor location (0-1)
         */
        setScrollPos({ cursor = 0.0, key = null } = {}) {
            if (isFiniteNumber(cursor)) {
                this.scrollPos = { cursor, key };
            }
        },

        /**
         * After bulk operations there is a need to trigger a fresh load.
         */
        manualReload() {
            // TODO: figure out whether we really need this
            console.warn("Calling, manual reload, was this really necessary?");
            this.scrollPos = { ...this.scrollPos, manualTrigger: true };
        },

        /**
         * Exposed method so child components can update the search parameters.
         * @param {SearchParams} newParams Fresh search params
         */
        updateParams(newParams) {
            const val = newParams instanceof SearchParams ? newParams.clone() : new SearchParams(newParams);
            this.params$.next(val);
        },

        /**
         * Render cache observable results to the payload property. It's best to
         * set everything at once to avoid multiple render passes.
         * @param {object} result Cache observable response
         */
        setPayload(newPayload = {}) {
            this.$set(this, "payload", newPayload);
        },
    },

    render() {
        return this.$scopedSlots.default({
            payload: this.payload,

            // local vars/settings/props passthrough
            loading: this.loading,
            scrolling: this.scrolling,
            busy: this.busy,
            params: this.params,
            pageSize: this.pageSize,

            // update methods
            updateParams: this.updateParams,
            setScrollPos: this.setScrollPos,
            manualReload: this.manualReload,
        });
    },
};

export default ContentProvider;
