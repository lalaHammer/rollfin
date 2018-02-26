<template>
    <div class="bbody">
        <!--学生账号登录显示  -->
        <div class="headerImg">
            <!-- <div>
                                                        <span>广东第二师范学院</span>
                                                    </div> -->
        </div>
        <div v-if="who" style="flex:3">
            <div class="schedule">
                <ul style="flex:1;margin-right:10px;">
                    <li>课表</li>
                    <li style="color:rgb(38, 162, 255)">{{today.week}}</li>
                    <li>{{today.day}}</li>
                </ul>
                <div class="list">
                    <table v-if="scheduleList.length!=0">
                        <tr v-for="item of scheduleList ">
                            <td>{{item.scheduleName}}</td>
                            <td>{{item.scheduleLesson}}</td>
                            <td>{{item.scheduleLocation}}</td>
                        </tr>
                    </table>
                    <div v-else>
                        <span>今天没有课喔 ！！</span>
                    </div>
                </div>
            </div>
            <div class="signBox">
                <div class="signCir" @click="sign()">
                    <div class="sign" :class="inOrOut? '' : 'gray'">
                        <span>签到</span>
                    </div>
                </div>
                <p class="prompt">
                    <p v-if="inOrOut">
                        <img alt="" src="../../assets/in.png">
                        <span>已进入考勤范围</span>
                    </p>
                    <p v-else>
                        <img src="../../assets/out.png" alt="">
                        <span>不在考勤范围内，请进入考勤范围后签到</span>
                    </p>
                </p>
            </div>
            <div class="record">
                <span>考勤记录</span>
            </div>
            <mymap class="mymap" ref="map"></mymap>
        </div>

    </div>
</template>

<script>
import mymap from '../geo/map'
import { Toast } from 'mint-ui'
import $ from 'jquery'
export default {
    name: 'home',
    data() {
        return {
            scheduleList: [],
            who: false,//教师账号为false(0)，学生账号为true(1)
            today: {},
            inOrOut: false,
            user: this.$store.state.user,
            signType:'',//0出勤 1迟到 2缺勤
        }
    },
    components: {
        mymap
    },
    created() {
        this.$store.commit('changeTitle', '叮叮当');
        // var whoIs = this.$store.state.who;
        var whoIs = "student"
        if (whoIs == 'teacher') {
            this.who = false;
        } else if (whoIs == 'student') {
            this.who = true;
        } else {//非法用户跳转回登录页面
            Toast('非法用户登录');
            this.$router.replace({ path: '/' });
        }

        //获取当天的课表信息
        // var today=new Date().getDay()-1;//0为周一
        //  var allSchedule=this.$store.state.scheduleList;
        // for(let i=0;i<allSchedule.length;i++){
        //     if(allSchedule[i].position==today || allSchedule[i].position == today + allSchedule[i].row * 7){
        //         this.scheduleList.push(allSchedule[i]);
        //     }
        // }
        var _this = this, allSchedule = [];
        $.get({
            url: '../../../static/FeHelper-20171120143706.json',
            success(res) {
                allSchedule = res.scheduleList;
                console.log('all')
                console.log(allSchedule);
                var today = new Date().getDay() - 1;
                // var today = 3;
                for (let i = 0; i < allSchedule.length; i++) {
                    if (allSchedule[i].position == today || allSchedule[i].position == today + allSchedule[i].row * 7) {
                        _this.scheduleList.push(allSchedule[i]);
                    }
                }
                console.log('today');
                console.log(_this.scheduleList);
                
            },
            error(err) {
                console.log(err);
            }
        });




    },
    mounted() {
        this.today = this.$refs.map.getTime();
        //判断当前是否可以进行签到
        console.log('判断是否可签到');
        var myData = this.$refs.map.returnPoint(), _this = this;

        $.ajax({
            url: 'http://restapi.amap.com/v4/geofence/status?key=1d62d5d73074e9d614c1581397b70a29',
            type: 'GET',
            dataTyep: 'json',
            header: 'Access-Control-Allow-Origin:*',
            data: myData,
            success(res) {
                console.log(res);
                if (res.data.fencing_event_list.length > 0 && res.data.fencing_event_list[0].client_status == 'in') {
                    _this.inOrOut = true;
                }
            },
            error(err) {
                Toast('定位失败');
                return fasle;
            }
        });
    },
    methods: {
        //点击进行签到
        sign() {
            console.log('签到...');
        
            //创建围栏
            // this.$refs.map.createPoint();
       //判断需要进行签到的课程
       var filterCour=this.filterCourse();
       if(filterCour.length<1){
           return ;
       }
       this.judgeTime(filterCour);
       console.log(this.signType);
       $.post({
           url:'',
           dataTyep: 'json',
           header: 'Access-Control-Allow-Origin:*',
           data:{name:},
           success(res){

           },
           error(err){

           }
       });


        },

        //筛选需要进行签到的课程
        filterCourse() {
            var arr = [], arr2 = [];
            $.each(this.scheduleList, (i) => {
                var flag = true;
                if (arr.length > 0) {
                    $.each(arr, (n) => {
                        if (this.scheduleList[i].position < 35) {
                            if (arr[n].scheduleName == this.scheduleList[i].scheduleName) {
                                flag=false;
                            }
                        }

                    });
                }
                flag=true;
                if (arr2.length > 0) {
                    $.each(arr2, (n) => {
                        console.log('la')
                        if (arr2[n].scheduleName == this.scheduleList[i].scheduleName) {
                            flag = false;
                        }

                    });
                }
                if (flag) {
                    if (this.scheduleList[i].position < 35) {
                        arr.push(this.scheduleList[i]);
                        flag = true;
                    } else {
                        arr2.push(this.scheduleList[i]);
                    }

                }
            });
            return arr.concat(arr2);
        },
        
        //判断当前是否为可签到时间
        judgeTime(arr){
        //    var thisHour=new Date().getHours();
        var thisHour='8',
            _this=this;
           console.log(thisHour);
           switch(thisHour){
               case '8':
               console.log('第一二节')
               $.each(arr,(i,item)=>{
                   if(item.position<14){
                       if(item.position<7){
                           console.log('第一节')
                           _this.judge(0);//第一节课
                       }else{
                           _this.judge(1);//第二节课
                       }
                   }
               });break;
               case "9":
               $.each(arr,(i,item)=>{
                  if(item.position>=14 && item.position<21){
                      _this.judge(2);//第三节课
                  }
               });break;
               case '10':
               $.each(arr,(i,item)=>{
                   if(item.position>=21 && item.position<28){
                       _this.judge(3);//第四节课
                   }
               });break;
              case '11':
               $.each(arr,(i,item)=>{
                   if(item.position>=28 && item.position<35){
                       _this.judge(4);//第5节课
                   }
               });break;
               case '14':
               $.each(arr,(i,item)=>{
                   if(item.position>=34 && item.position<49){
                       if(item.position<42){
                           _this.judge(5);//第6节课
                       }else{
                           _this.judge(6);//第7节课
                       }
                   }
               });break;
               case '15':
               $.each(arr,(i,item)=>{
                   if(item.position>=49 && item.position<56){
                       _this.judge(7);//第8节课
                   }
               });break;
               case '14':
               $.each(arr,(i,item)=>{
                   if(item.position>=56 && item.position<63){
                       _this.judge(8);//第9节课
                   }
               });break;
                  
           }
        },
        judge(i){
            var timeArr=['08:10','08:55','09:45','10:30','11:15','14:00','14:45','15:35','16:20'],
                // tTime=new Date(this.today.signDay+" "+this.today.signTime).getTime(),
                tTime=new Date(this.today.signDay+" "+'08:50').getTime(),
                cTime=new Date(this.today.signDay+" "+timeArr[i]).getTime();
                 console.log(tTime-cTime)
            if(tTime-cTime<0){
                if(cTime-tTime<=10*60*1000){
                   this.signType='0';
                }
            }else{
                if(tTime-cTime<40*1000*60){
                    this.signType="1";
                    
                }else if(tTime-cTime>=40*1000*60){
                    this.signType='2';
                    
                }
            }
        },

    }



}
</script>

<style scoped>
.bbody {
    background-color: #f4f2f2;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}











/*顶部图片  */

.headerImg {
    height: 132px;
    background: url('../../assets/door_02.png') no-repeat 100% 100%;
    margin-bottom: 10px;
    flex: 1;
}

.headerImg div {
    background: rgba(255, 255, 255, 0.3);
    padding: 26px 0 10px 0;
}

.headerImg span {
    font-size: 1rem;
    color: #fff;
}











/*课表显示  */

.schedule {
    display: flex;
    padding: 0 20px;
}

.schedule ul,
.schedule .list {
    background: #fff;
    padding: 0 10px;
    list-style: none;
    height: 120px;
    overflow: auto;
    font-size: 0.9rem;
}

.list table {
    width: 100%;
}

.schedule .list::-webkit-scrollbar {
    display: none
}

.schedule li,
.schedule .list tr {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #ccc;
}


.schedule li:nth-last-child(1),
.schedule .list tr:nth-last-child(1) {
    border: none;
}

.schedule .list {
    flex: 5;
}

.schedule .list td {
    padding-right: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.list>div {
    line-height: 120px;
    color: #ccc;
}











/*签到  */

.sign {
    width: 100px;
    display: inline-block;
    height: 100px;
    background: rgba(38, 162, 255, 1);
    text-align: center;
    line-height: 100px;
    color: white;
    cursor: pointer;
    position: absolute;
    left: 50%;
    top: 50%;
    margin: -50px 0 0 -50px;
    border-radius: 50%;
}

.gray {
    background: #ccc;
}

.signCir {
    width: 110px;
    height: 110px;
    display: inline-block;
    position: relative;
    border: 1px solid rgba(38, 162, 255, 0.5);
}


.signCir {
    border-radius: 50%;
    /* -webkit-animation: scaleout 1.3s infinite ease-in-out;
    animation: scaleout 5s infinite ease-in-out; */
}

@-webkit-keyframes scaleout {
    0% {
        -webkit-transform: scale(1.0)
    }
    100% {
        -webkit-transform: scale(1.1);
        opacity: 0.7;
    }
}

@keyframes scaleout {
    0% {
        transform: scale(1.0);
        -webkit-transform: scale(1.0);
    }
    100% {
        transform: scale(1.1);
        -webkit-transform: scale(1.1);
        opacity: 0.7;
    }
}

.prompt {
    font-size: 0.5rem;
    margin-top: 4px;
}

.prompt img {
    vertical-align: text-bottom;
}

.prompt span {
    font-size: 0.5rem;
    color: #ccc;
}
</style>
