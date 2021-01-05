import Backbone from "backbone";
import { UploadModalWrapper } from "components/Upload";
import _l from "utils/localization";
import { getGalaxyInstance } from "app";
import ToolBox from "../../components/Panels/ToolBox";
import SidePanel from "../../components/Panels/SidePanel";
import { mountVueComponent } from "../../utils/mountVueComponent";

const ToolPanel = Backbone.View.extend({
    initialize: function () {
        const Galaxy = getGalaxyInstance();

        // create container element, no need for jquery to do this
        const container = document.createElement("div");
        document.body.appendChild(container);

        // Using standard init which will have access to the store and other standard plugins
        const mounter = mountVueComponent(UploadModalWrapper);
        // const propsData = initializeUploadDefaults(Galaxy);
        const uploadComponent = mounter({}, container);

        // attach upload entrypoint to Galaxy object
        Galaxy.upload = uploadComponent;

        // components for panel definition
        this.model = new Backbone.Model({
            title: _l("Tools"),
        });
    },

    isVueWrapper: true,

    mountVueComponent: function (el) {
        const Galaxy = getGalaxyInstance();
        return (this.component = mountVueComponent(SidePanel)(
            {
                side: "left",
                currentPanel: ToolBox,
                currentPanelProperties: {
                    storedWorkflowMenuEntries: Galaxy.config.stored_workflow_menu_entries,
                    toolbox: Galaxy.config.toolbox,
                },
            },
            el
        ));
    },

    toString: function () {
        return "toolPanel";
    },
});

export default ToolPanel;
