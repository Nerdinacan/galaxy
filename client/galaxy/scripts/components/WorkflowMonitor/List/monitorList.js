import MonitorRx from "../MonitorRx";
// import MonitorVuex from "../MonitorVuex";
import { getInvocationsForWorkflow } from "../services";

export default {
    props: ["workflow_id"],
    components: {
        monitor: MonitorRx
    },
    data() {
        return {
            invocations: []
        };
    },
    computed: {
        queryJson() {
            return JSON.stringify(this.invocations);
        }
    },
    created() {
        getInvocationsForWorkflow(this.workflow_id)
            .then(list => (this.invocations = list));
    }
};
