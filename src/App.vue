<template>
  <div id="app">
    <mt-header :title="title" class="header">
        <mt-button icon="back" @click="back" slot="left" v-if="$route.path !=='/login'" style="font-size:1rem">退出</mt-button>
      <mt-button slot="right" style="margin-right:10px;margin-top:2px;">{{user.xm}}</mt-button>
    </mt-header>
    <router-view/>
  </div>
</template>

<script>
import Vue from 'vue'
import { Header,MessageBox } from 'mint-ui';
import { mapState } from 'vuex'
import $ from 'jquery'

Vue.component(Header.name, Header);
export default {
  name: 'app',
  data() {
    return {

    }
  },
  created() {

    this.$store.commit('changeTitle', '学生点名签到系统登录');

  },
  computed: mapState({
    title() {
      return this.$store.state.title;
    },
    user() {
      return this.$store.state.user;
    }
  }),
  methods:{
    back(){
      MessageBox.confirm('确定退出系统？').then(action=>{
         if(action){
            this.$router.replace({ path: '/' });
            this.$store.commit('changeUser', '');
         }
      });
    }
  }
}
//设置字体大小
function fontSize() {
  var deviceWidth = document.documentElement.clientWidth > 768 ? 768 : document.documentElement.clientWidth;
  document.documentElement.style.fontSize = (deviceWidth / 25) + "px";
  document.body.style.height=document.documentElement.clientHeight+'px';
}
fontSize();
window.onresize = fontSize;

</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 1rem;
  /* margin-top: 60px; */
}
body{margin:0}
h1,
.h1 {
  padding: 0;
  margin: 0;
}
.header{
  height:2.4rem;
  font-size: 1.1rem;
}
</style>
