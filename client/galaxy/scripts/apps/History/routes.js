/**
 * History component routes
 */

import Login from "./components/Login.vue";
import History from "./components/History.vue";

export default {
    routes: [
        {
            name: "home",
            path: "/",
            component: History
        },
        {
            name: "login",
            path: "/login",
            component: Login
        }
    ]
};
