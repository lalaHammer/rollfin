<template>
    <div>
        <input type="text" @focus="">
        <mt-picker :slots="slots" ></mt-picker>
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>周一</th>
                    <th>周二</th>
                    <th>周三</th>
                    <th>周四</th>
                    <th>周五</th>
                    <th>周六</th>
                    <th>周日</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="d in 12">
                    <td>{{d}}</td>
                    <td v-for="i in 7"></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import Vue from 'vue'
import { Picker } from 'mint-ui';

Vue.component(Picker.name, Picker);
export default {
    name: "schedule",
    data() {
        return {
            scheduleList: [],
            slots:[
                {flex:1,values:['第1周','第2周','第3周','第4周','第5周','第6周','第7周','第8周','第9周','第10周','第11周','第12周','第13周','第15周','第15周','第16周','第17周','第18周',]}
                ]
        }
    },
    created() {
        this.scheduleList = this.$store.state.scheduleList;
        this.$store.commit('changeTitle', '课程表');
        console.log(this.scheduleList)
    }
}
</script>

<style scoped>
table {
    width: 100%;
}

td,
th {
    height: 50px;
}

thead {
    background: #D3D3D3;
}

tr {
    border: 1px solid #ccc;
}

tr td:first-child {
    width: 50px;
    background: #F5F5F5;
}
</style>
