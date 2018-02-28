import Vue from 'vue'
import Router from 'vue-router'
import login from '@/components/login/login'
import home from '@/components/home/home'   
import schedule from '@/components/schedule/schedule'
// import map from "@/components/geo/map"

Vue.use(Router)

export default new Router({
  mode:'history',
  routes: [
    {
      path:'/',
      redirect:'/login',
      component:login
    },
    {
      path:'/login',
      name:'login',
      component:login
    },
    {
      path:'/home',
      name:'home',
      component:home
    },
    {
      path:'/schedule',
      name:'schedule',
      component:schedule
    },
    //  {
    //   path:'/map',
    //   name:'map',
    //   component:map
    // }
    
  ]
})
