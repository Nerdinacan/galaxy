/**
 * Vuex store module for invocations
 */

import { loadInvocations, hydrate } from "../service";


// initial application state, keyed object of invocations

const state = {
    invocations: {}
}


// these are what are called from the components via state.dispatch

const actions = {

    // Using only vuex, will rely on a setTimeout to repeat
    // same polling action again and again
    checkInvocationStatus({ dispatch, commit }, params) {

        loadInvocations(params)
            .then(hydrate)
            .then(invocation => {
                commit('setInvocation', invocation);
                if (!invocation.isComplete()) {
                    let retryDelay = 1000;
                    setTimeout(() => {
                        dispatch('checkInvocationStatus', params);
                    }, retryDelay);
                }
            })
            .catch(err => {
                console.log("Ooops", err);
            })
    }
}


// this is where the state actually gets changed, only
// through a commit call inside an action

const mutations = {
    setInvocation(state, invocation) {
        state.invocations[invocation.id] = invocation;
    }
}


// anything you expect your view components to react to
// must be defined as a getter (I think)

const getters = {
    invocationStatus(state) {
        return objectPluck(state.invocations, "state");
    }
}


// utility func

function objectPluck(o, pluckProp) {
    return Object.keys(o).reduce((result, key) => {
        result[key] = o[key][pluckProp];
        return result;
    }, {});
}


export default {
    state,
    getters,
    actions,
    mutations
}





/*

import { getStatusStream } from "../MonitorRx/stream";


    // Could maybe do a hybrid like this where we let the
    // rxjs handle the fancy stuff but the end storage destination
    // is still the familiar Vuex?
    // Con: More types of tech
    // Pro: Rxjs is better for complex tasks that would suck
    // to model with repeated dispatch/commit logic

    checkInvocationStatusWithRxjs({ commit }, params) {

        getStatusStream(params)
            .subscribe(invocation => {
                commit('setInvocation', invocation);
            });
    }

*/