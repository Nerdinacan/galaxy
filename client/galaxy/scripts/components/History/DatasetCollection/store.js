const state = {
    currentCollectionId: null // "1e8ab44153008be8"
}

const getters = {}

const actions = {}

const mutations = {
    setCurrentCollectionId(state, id = null) {
        state.currentCollectionId = id;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
