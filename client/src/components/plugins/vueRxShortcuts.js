import VueRx from "vue-rx";
import { isObservable } from "rxjs";
import { pluck } from "rxjs/operators";

const defaultNext = (label) => (result) => {
    if (label) console.log(`[${label}] next`, result);
};

const defaultErr = (label) => (err) => {
    if (label) console.warn(`[${label}] error`, err);
};

const defaultComplete = (label) => () => {
    if (label) console.log(`[${label}] complete`);
};

export const vueRxShortcuts = {
    methods: {
        /**
         * Watch any property, adds debugging tag and assumes you want newValue,
         * this is usually what we want and shorter than typing it every time
         *
         * @param {String | Function} watchExpr Vue prop, data, computed or function to evaluate
         * @param {Object} opts Vue watch options
         *
         * @returns {Observable} Observable of watchExpr
         */
        watch$(watchExpr, opts = {}) {
            const watchDefaults = { immediate: true };
            const watchOpts = { ...watchDefaults, opts };
            if (Array.isArray(watchExpr)) {
                return this.watchAll$(watchExpr, watchOpts);
            }
            return this.$watchAsObservable(watchExpr, watchOpts).pipe(pluck("newValue"));
        },

        /**
         * Same as watch$ but for an array of props or expressions
         *
         * @param {Array} watchExpressions Array of functions or prop names
         * @param {Object} opts Vue watch options
         *
         * @return {Array} Array of observables
         */
        watchAll$(watchExpressions, opts = {}) {
            return watchExpressions.map((watchExpr) => this.watch$(watchExpr, opts));
        },

        /**
         * Generic subscriber to an observable. Subscribes using provided
         * handler or default and disposes of subscription when component is destroyed.
         *
         * @param {Observable} obs$ Observable to subscribe to
         * @param {Object | Function} cfg Configuration or next handler
         *
         * @return {Subscription}
         */
        listenTo(obs$, cfg = {}) {
            const config = cfg instanceof Function ? { next: cfg } : cfg;
            const {
                label = null,
                next = defaultNext(label),
                error = defaultErr(label),
                complete = defaultComplete(label),
            } = config;

            if (!isObservable(obs$)) {
                console.warn("Object provided to listenTo was not an observable");
                return;
            }

            this.$subscribeTo(obs$, next, error, complete);
        },
    },
};

export const vueRxShortcutPlugin = {
    install(Vue) {
        Vue.use(VueRx);
        Vue.mixin(vueRxShortcuts);
    },
};
