<template>
  <div id="app">
    <mt-header :title="title" class="header">
      <router-link to="/home" slot="left" v-if="$route.path !=='/login' && $route.path !=='/home'">
        <mt-button icon="back">返回</mt-button>
      </router-link>
      <mt-button slot="right">{{user.xm}}</mt-button>
    </mt-header>
    <router-view/>
  </div>
</template>

<script>
import Vue from 'vue'
import { Header } from 'mint-ui';
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
  })
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

h1,
.h1 {
  padding: 0;
  margin: 0;
}
.header{
  height:2.4rem;
  font-size: 0.9rem;
}
</style>
