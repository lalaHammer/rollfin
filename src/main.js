// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import $ from 'jquery'  
import 'bootstrap/dist/css/bootstrap.min.css'  
// import 'bootstrap/dist/js/bootstrap.min'
import mintui from 'mint-ui'
import 'mint-ui/lib/style.css'
import 'vue2-animate/dist/vue2-animate.min.css'
import store from './store/store'


Vue.config.productionTip = false
Vue.use(mintui)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  data:{
    showH:true
  }
})

