/**
 * Until we have a true SPA, there's no way to inject the store at the top of
 * the tree because there IS no top of the tree. So for now I'm going to import
 * the store.
 */

// import { mapGetters } from "vuex";
import store from "store";

export default {
    props: ["workflow_id", "invocation_id"],
    computed: {
        statusMessage() {
            let id = this.invocation_id;
            let source = store.invocation.invocationStatus;
            return (id in source) ? source[id] : "Nuthin";
        }
    },
    created() {
        store.invocations.dispatch('checkInvocationStatus', {
            invocation_id: this.invocation_id,
            workflow_id: this.workflow_id
        });
    }
}

