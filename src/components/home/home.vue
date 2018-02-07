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
                <div class="signCir" @click="sign()" >
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
        }
    },
    components: {
        mymap
    },
    created() {
        this.$store.commit('changeTitle', '叮叮当');
        var whoIs = this.$store.state.who;
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
         //获取当前日期
        this.today = this.getTime();
        
    },
    methods: {
        sign() {
            console.log('签到...');
             //创建围栏
            this.$refs.map.createPoint();
            //判断当前是否可以进行签到
            var pointMsg=this.$refs.map.outOrIn();
            if(pointMsg){
                this.inOrOut=true;
                console.log(pointMsg);
            }else{
                console.log('err'+pointMsg);
            }


           
        },
        //获取当前签到的时间
        getTime() {
            var weekArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六',]
            var date = new Date();
            var month = this.checkDate(date.getMonth() + 1),
                day = this.checkDate(date.getDate()),
                week = weekArr[date.getDay()];
            return {
                "week": week,
                "day": month + '-' + day
            };
        },
        //格式化日期
        checkDate(date) {
            if (date < 10) {
                return '0' + date;
            } else {
                return date;
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
    flex-direction:column;
}



/*顶部图片  */

.headerImg {
    height: 132px;
    background: url('../../assets/door_02.png') no-repeat 100% 100%;
    margin-bottom: 10px;
    flex:1;
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
.prompt img{
    vertical-align: text-bottom;
}
.prompt span{
    font-size:0.5rem;
    color:#ccc;
}
</style>
