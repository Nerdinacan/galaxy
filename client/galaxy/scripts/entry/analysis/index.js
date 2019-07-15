import { standardInit, addInitialization } from "onload";
import { getAnalysisRouter } from "./AnalysisRouter";
import ToolPanel from "entry/panels/tool-panel";
import { HistoryPanelProxy } from "components/History";
import HistoryPanel from "entry/panels/history-panel";
import Page from "layout/page";

addInitialization((Galaxy, { options = {} }) => {

    console.log("Analysis custom page setup");

    const useBeta = sessionStorage.getItem("useBetaHistory");
    const RightPanel = Boolean(useBeta) ? HistoryPanelProxy : HistoryPanel;

    const pageOptions = Object.assign({}, options, {
        config: Object.assign({}, options.config, {
            hide_panels: Galaxy.params.hide_panels,
            hide_masthead: Galaxy.params.hide_masthead
        }),
        Left: ToolPanel,
        Right: RightPanel,
        Router: getAnalysisRouter(Galaxy)
    });

    Galaxy.page = new Page.View(pageOptions);
});

window.addEventListener("load", () => standardInit("analysis"));
