/**
 * This is a backbone view adapter for a Vue component. It's just
 * a Vue mount function with the interface of a backbone view so
 * that it can fit into the existing backbone layout scheme.
 * 
 * TODO: Delete this abomination when Backbone is finally gone.
 */

import Backbone from "backbone";
import { mountHistory } from "./mounts";
// import { genericProxy } from "utils/genericProxy";

export default Backbone.View.extend({
    initialize(page, options) {
        this.model = {};
        // bypass letting SidePanel render the layout
        this.omitLayout = true;
        this.setElement('<div />');
    },
    render() {
        let container = this.$el[0];
        let vm = mountHistory({}, container);
        console.log('HistoryPanel vm', vm);
        return this;
    },
    toString() {
        return "historyPanel";
    }
});

// Wrapper shows external access to the view to make sure
// we've finished the required external interface
// export default function(page, config) {
//     let view = new HistoryProxy(page, config);
//     return genericProxy(view, "history-proxy");
// }
