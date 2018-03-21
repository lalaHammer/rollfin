import Vue from 'vue'
import Router from 'vue-router'
import login from '@/components/login/login'
import home from '@/components/home/home'   

// import map from "@/components/geo/map"

Vue.use(Router)

export default new Router({
  
  routes: [
    {
      path:'/',
      redirect:'/login',
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
  
    //  {
    //   path:'/map',
    //   name:'map',
    //   component:map
    // }
    
  ]
})
