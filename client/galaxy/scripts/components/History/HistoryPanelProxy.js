/**
 * This is a backbone view adapter for a Vue component. It's just
 * a Vue mount function with the interface of a backbone view so
 * that it can fit into the existing backbone layout scheme.
 * 
 * TODO: Delete this abomination when Backbone is finally gone.
 */

import $ from "jquery";
import Backbone from "backbone";
import { mountHistory } from "./mounts";
// import { genericProxy } from "utils/genericProxy";

export default Backbone.View.extend({
    initialize(page, options) {
        this.model = {};
        this.setElement('<div />');
    },
    render() {
        let container = this.$el[0];
        mountHistory({}, container);
        
        // Hack: For now, remove unused "unified-panel" elements until we can
        // completely re-work the layout container. Unfortunately the
        // layout/page and sidepanel views are super-rigid and expect an
        // explicit header and controls element that I'd rather be managed by by
        // the component, so I'm just chopping those elements out manually.
        
        // TODO: Rework layout/page and sidepanel to avoid this arrangement

        $('#right > .unified-panel-header').remove();
        $('#right > .unified-panel-controls').remove();

        return this;
    },
    toString() {
        return "historyPanel";
    }
});

// Wrapper shows external access to the view to make sure
// we've finished the required external interfac
// export default function(page, config) {
//     let view = new HistoryProxy(page, config);
//     return genericProxy(view, "history-proxy");
// }
