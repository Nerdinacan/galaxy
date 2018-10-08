/**
 * Vuex store module for invocations
 */

import { loadInvocations, hydrate, invocationCache, getInvocationsForWorkflow }
    from "../services";


// Build data loader function
const loader = loadInvocations(invocationCache, getInvocationsForWorkflow);


// initial application state, keyed object of invocations

const state = {
    invocations: {}
}


// these are what are called from the components via state.dispatch

const actions = {

    // Using only vuex, will rely on a setTimeout to repeat
    // same polling action again and again
    checkInvocationStatus({ dispatch, commit }, params) {

        return loader(params)
            .then(hydrate)
            .then(inv => {
                // console.log("invocation retrieved", inv);
                commit('setInvocation', inv);
                return inv;
            })

            // this never registers changes in components, I suspect
            // the recursive call to dispatch is a problem
            // This is kind of a perfect reason not to use Vuex
            .then(inv => {
                if (!inv.isComplete()) {
                    let retryDelay = 2000;
                    setTimeout(() => {
                        console.log("not done", params);
                        dispatch('checkInvocationStatus', params);
                    }, retryDelay);
                }
                return inv;
            })

            .catch(err => {
                console.log("Ooops", err);
            })
    }
}


// this is where the state actually gets changed, only
// through a commit call inside an action

const mutations = {
    setInvocation(state, inv) {
        console.log('setting invocation', state, inv);
        state.invocations[inv.id] = inv;
    }
}


// anything you expect your view components to react to
// must be defined as a getter (I think)

const getters = {
    getInvocation: (state) => (id) => {
        return state.invocations[id];
    },
    invocationStatus: (state, getters) => (id) => {
        let inv = getters.getInvocation(id);
        return (inv) ? inv.state : "No status";
    }
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