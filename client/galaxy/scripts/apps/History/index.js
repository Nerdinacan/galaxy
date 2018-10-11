/**
 * Temporary entry point for history model testing
 * This should really be a Vue plugin later on
 * http://localhost:8080/static/history.html
 */

// polyfills, ..., async, move to webpack
import "@babel/polyfill";
import "regenerator-runtime/runtime.js";

import Vue from "vue";
import VueRx from "vue-rx";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.use(VueRx);
Vue.config.productionTip = false;

const initTempApp = container => () => {
    let mountPoint = document.createElement("div");
    container.appendChild(mountPoint);

    new Vue({
        router,
        store,
        render: h => h(App)
    }).$mount(mountPoint);
};

window.addEventListener("load", initTempApp(document.body));
