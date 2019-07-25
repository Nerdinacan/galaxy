// Temporary adapters for launching backbone modals I don't want to replace yet

import jQuery from "jquery";
import atrocities from "mvc/collection/list-collection-creator.js";

export async function datasetListModal(selection) {
    
    // Opens a drag/drop list creator
    // POST http://localhost:8080/api/histories/8317ee2b0d0f62d9/contents/dataset_collection
    // sample post: testdata/createList.json

    // flatten set to array, turn into plain javascript
    const flatSelection = Array.from(selection).map(doc => doc.toJSON());

    const trojanHorse = {
        toJSON: () => flatSelection,
        createHDCA(element_identifiers, collection_type, name, hide_source_items, copy_elements, options = {}) {
            
            // response needs to be a deferred instead of a promise
            // (Mmmm... tasty depricated data types!)
            const def = jQuery.Deferred();
            
            // Pointlessly rename a bunch of properties
            return def.resolve(null, {
                collection_type,
                name,
                copy_elements,
                hide_source_items,
                element_identifiers
            });
        }
    }

    const dfr = atrocities.createListCollection(trojanHorse);
    return await Promise.resolve(dfr);
}



export async function datasetPairModal(selection) {
    
    // POST http://localhost:8080/api/histories/8317ee2b0d0f62d9/contents
    // createPair.json
    // opens a similar list creator with only 2 slots
    
    return 1;
}

export async function listOfPairsModal(selection) {
    return 1;
}

export async function collectionFromRulesModal(selection) {
    return 1;
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
        createFunc = totalCrap.createListCollection;
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
