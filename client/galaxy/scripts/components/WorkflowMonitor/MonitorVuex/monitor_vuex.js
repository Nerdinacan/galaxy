/**
 * Until we have a true SPA, there's no way to inject the store at the top of
 * the tree because there IS no top of the tree. So for now I'm going to import
 * the store.
 */

import { store } from "store/";

export default {
    props: ["workflow_id", "invocation_id"],
    computed: {
        invocation() {
            let id = this.invocation_id;
            return this.$store.getters.getInvocation(id);
        },
        statusMessage() {
            let inv = this.invocation;
            return inv ? inv.state : "No status";
        }
    },
    created() {
        this.$store.dispatch('checkInvocationStatus', {
            invocation_id: this.invocation_id,
            workflow_id: this.workflow_id
        });
    }
}

