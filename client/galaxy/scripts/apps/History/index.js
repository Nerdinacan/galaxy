/**
 * Temporary entry point for history model testing
 * This should really be a Vue plugin later on
 * http://localhost:8080/static/history.html
 */

// polyfills, ..., async, move to webpack
import "@babel/polyfill";

import Vue from "vue";
import VueRx from "vue-rx";
import historyStore from "./store";
import historyRoutes from "./routes";
import { initAjaxErrorMonitor } from "./util";

Vue.use(VueRx);

export default {
    install(Vue, { router, store }) {
        router.addRoutes(historyRoutes);
        store.registerModule("history", {
            namespaced: true,
            ...historyStore
        });
        initAjaxErrorMonitor(router);
    }
};
