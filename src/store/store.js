import Vue from 'vue'
import vuex from 'vuex'
import state from './state'
import mutations from './mutations'
import actions from "./actions"

Vue.use(vuex)
const store =new vuex.Store({
    state,
    mutations,
    actions
});

export default store;