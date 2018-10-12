/**
 * Dumb temporary login form
 */

import { getApiKey } from "../util";

export default {
    data() {
        return {
            username: "",
            password: ""
        };
    },
    methods: {
        login() {
            getApiKey(this.username, this.password).subscribe(
                result => console.log("Yay!", result),
                err => console.warn("Boo!", err),
                () => console.log("done logging in")
            );
        }
    }
};
