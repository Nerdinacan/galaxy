/**
 * Global store, this is realistically going to be part of the
 * root application
 */

import Vue from "vue";
import Vuex from "vuex";
import history from "./globalStore";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: { history }
});
