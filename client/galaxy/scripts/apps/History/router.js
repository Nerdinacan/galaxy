import Vue from "vue";
import Router from "vue-router";
import routes from "./routes";

Vue.use(Router);

let routeConfig = {
    ...routes,
    base: "/static/history.html"
};

export default new Router(routeConfig);
