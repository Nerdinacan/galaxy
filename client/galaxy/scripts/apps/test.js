/**
 * Testing entry point for history models (or whatever)
 * This is a dummy stub vue application we'll add components to
 */

/**
 * Temporary entry point for history model testing
 * This should really be a Vue plugin later on
 * http://localhost:8080/static/test.html
 */

import "@babel/polyfill";
// import "regenerator-runtime/runtime.js";
import Vue from "vue";
import Router from "vue-router";
import Vuex from "vuex";

// Import test module
import History from "./History";

// Shell template
const App = {
    template: `<div><router-view></router-view></div>`
};

const initTempApp = container => () => {
    // Load stuff into vue
    Vue.use(Vuex);
    Vue.use(Router);
    Vue.config.productionTip = false;

    // stub router
    let router = new Router({
        base: "/static/test.html"
    });

    // global store
    let store = new Vuex.Store({});

    // load test plugins
    Vue.use(History, { router, store });

    // mount
    let mountPoint = document.createElement("div");
    container.appendChild(mountPoint);

    new Vue({
        router,
        store,
        render: h => h(App)
    }).$mount(mountPoint);
};

window.addEventListener("load", initTempApp(document.body));
