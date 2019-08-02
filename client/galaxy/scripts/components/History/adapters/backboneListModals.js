/**
 * Temporary adapters launch bootstrap modals from Vue components, for use with
 * the dataset assembly modals. i.e. With selected..... create dataset collection,
 * create paired collection, etc.
 */

import jQuery from "jquery";
import atrocities from "mvc/collection/list-collection-creator";
import warcrimes from "mvc/collection/pair-collection-creator";
import lawyers from "mvc/collection/list-of-pairs-collection-creator";

export async function datasetListModal(selection) {
    const fn = _createCollectionModal(atrocities.createListCollection);
    return await fn(selection);
}

export async function datasetPairModal(selection) {
    const fn = _createCollectionModal(warcrimes.createPairCollection);
    return await fn(selection);
}

export async function listOfPairsModal(selection) {
    const fn = _createCollectionModal(lawyers.createListOfPairsCollection);
    return await fn(selection);
}

export async function collectionFromRulesModal(selection) {
    const fn = _createCollectionModal(atrocities.createCollectionViaRules);
    return await fn(selection);
}

const _createCollectionModal = modalHandler => async (selection) => {

    // flatten set to array, turn into plain javascript
    const flatSelection = Array.from(selection).map(doc => doc.toJSON());

    const trojanHorse = {
        toJSON: () => flatSelection,

        // result must be a $.Deferred object instead of a promise because
        // that's the kind of deprecated data format that backbone likes to use.
        createHDCA(
            element_identifiers,
            collection_type,
            name,
            hide_source_items,
            copy_elements,
            options = {}
        ) {
            const def = jQuery.Deferred();
            return def.resolve(null, {
                collection_type,
                name,
                copy_elements,
                hide_source_items,
                element_identifiers
            });
        }
    }

    const def = modalHandler(trojanHorse);
    return await Promise.resolve(def);
}


/*
_collectionActions: function() {
    var panel = this;
    return [
        {
            html: _l("Build Dataset List"),
            func: () => panel.buildCollection("list")
        },
        // TODO: Only show quick pair if two things selected.
        {
            html: _l("Build Dataset Pair"),
            func: () => panel.buildCollection("paired")
        },
        {
            html: _l("Build List of Dataset Pairs"),
            func: () => panel.buildCollection("list:paired")
        },
        {
            html: _l("Build Collection from Rules"),
            func: () => panel.buildCollection("rules")
        }
    ];
},

buildCollection: function(collectionType, selection, hideSourceItems) {
    var panel = this;
    selection = selection || panel.getSelectedModels();
    hideSourceItems = hideSourceItems || false;
    var createFunc;
    if (collectionType == "list") {
        createFunc = LIST_COLLECTION_CREATOR.createListCollection;
    } else if (collectionType == "paired") {
        createFunc = PAIR_COLLECTION_CREATOR.createPairCollection;
    } else if (collectionType == "list:paired") {
        createFunc = LIST_OF_PAIRS_COLLECTION_CREATOR.createListOfPairsCollection;
    } else if (collectionType.startsWith("rules")) {
        createFunc = LIST_COLLECTION_CREATOR.createCollectionViaRules;
    } else {
        console.warn(`Unknown collectionType encountered ${collectionType}`);
    }
    createFunc(selection, hideSourceItems).then(() => {
        panel.model.refresh();
    });
},
*/
