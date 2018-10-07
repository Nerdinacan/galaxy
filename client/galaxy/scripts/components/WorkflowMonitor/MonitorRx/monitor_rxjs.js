/**
 * Workflow monitor component, rxjs style
 */

import Vue from "vue";
import VueRx from "vue-rx";
import { getStatusStream } from "./stream";

Vue.use(VueRx);

export default {
    props: ["workflow_id", "invocation_id"],
    data() {
        return {
            invocation: null
        };
    },
    computed: {
        statusMessage() {
            return this.invocation ? this.invocation.state : "No status";
        }
    },
    subscriptions() {
        return {
            invocation: getStatusStream({
                workflow_id: this.workflow_id,
                invocation_id: this.invocation_id
            })
        };
    }
}
