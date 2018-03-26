<template>
    <div class="bbody">
        <div class="headerImg"></div>
        <!--学生账号登录显示  -->
        <div style="flex:3">
            <div class="schedule">
                <ul style="flex:1;margin-right:10px;">
                    <li v-if="who">第{{week}}周</li>
                    <li v-else>课表</li>
                    <li style="color:rgb(38, 162, 255)">{{checkWeek(today.week)}}</li>
                    <li>{{today.day}}</li>
                </ul>
                <div class="list" v-if="who">
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
                <div class="list" v-else>
                    <table v-if="teacherSchedule.length!=0">
                        <tr>
                            <th>课程名</th>
                            <th>时间</th>
                            <th>上课地点</th>
                            <th>班级</th>
                        </tr>
                        <tr v-for="item of teacherSchedule ">
                            <td>{{item.scheduleName}}</td>
                            <td>{{checkWeek(today.week)+item.scheduleLesson}}节</td>
                            <td>{{item.scheduleLocation}}</td>
                            <td>{{item.scheduleClass}}</td>
                        </tr>
                    </table>
                    <div v-else>
                        <span>今天没有课喔 ！！</span>
                    </div>
                </div>
            </div>
            <div class="signBox" v-if="who">
                <div class="signCir" @click="sign()" >
                    <div class="sign" :class="inOrOut? '' : 'gray'">
                        <span>签到</span>
                    </div>
                </div>
                <p @click="rgeo">
                    <a href="javascript:;">重新定位</a>
                </p>
                <p class="prompt">
                    <p v-if="inOrOut">
                        <img alt="" src="http://39.108.180.108/liuliequan/img/in.png">
                        <span>已进入考勤范围</span>
                    </p>
                    <p v-else>
                        <img src="http://39.108.180.108/liuliequan/img/out.png" alt="">
                        <span>不在考勤范围内，请进入考勤范围后签到</span>
                    </p>
                </p>
            </div>
            <div class="record">
                <p>考勤记录</p>
                <div style="overflow:hidden;line-height:34px;">
                    <div class="dropdown">
                        <button class="btn btn-default dropdown-toggle" @click="dropdownShow">
                            {{courseSelect}}
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdownMenu" @click="courseClick" v-if="showFlag['dropdown']=='show'">
                            <li v-for="(item,i) of  scheduleNameList">
                                <a href="javascript:void(0)">{{item.scheduleName}}</a>
                            </li>
                        </ul>
                    </div>
                    <a href="javascript:void(0)" class="search_sign" @click="searchSign">查询</a>
                </div>
                <div v-if="who && showFlag['search_result']=='show'">
                    <p class="count">
                        考勤统计： 迟到
                        <span>{{search_result.lateCount}}</span>次　 缺勤
                        <span>{{search_result.absenseCount}}</span>次
                    </p>
                    <!--学生用户查询结果  -->
                    <table class="record_result">
                        <thead>
                            <th>课程</th>
                            <th>签到日期</th>
                            <th>签到状态</th>
                        </thead>
                        <tbody>
                            <tr  v-for="(item,i) of search_result['result']">
                                <td>{{search_result['course']}}</td>
                                <td>
                                    <p style="margin:0">{{checkWeek(item['week'])}}</p>{{item['time']}} </td>
                                <td>
                                    <!-- <span v-if="in_i.signType==0">出勤</span> -->
                                    <span v-if="item.signType==1">迟到</span>
                                    <span v-else-if="item.signType==2">缺勤</span>
                                </td>

                            </tr>
                        </tbody>
                    </table>
                </div>
                <!--教师查询结果  -->
                <div v-else>

                </div>
                <p v-if="showFlag['load']=='show'">加载完毕</p>
            </div>
        </div>

        <div class="toTop" @click="toTop">
            <img src="http://39.108.180.108/liuliequan/img/toTop.png" alt="">
        </div>

    </div>
</template>

<script>
import Vue from 'vue'
import AMap from 'AMap'
import AMapUI from 'AMapUI'
import { Toast, Indicator, InfiniteScroll } from 'mint-ui'
import $ from 'jquery'
import teacher from './t_search.js'
import map from './map'
import stuSearch from './stu_search'
export default {
    name: 'home',
    data() {
        return {
            scheduleList: [],//学生当前课表
            week: this.$store.state.week,//当前周(学生账号可见)
            who: true,//用户登录标识，教师账号为false(0)，学生账号为true(1)
            today: {},
            inOrOut: false,//是否在定位围栏中
            user: this.$store.state.user,
            signType: '',
            signCourse: '',
            search_result: {},//考勤查询结果
            teacherSchedule: [],//教师当前课表
            scheduleNameList: [],
            courseSelect: '课程选择',//课程选择
            courseSelectShow: false,
            pageCount: 1,
            pageSize:2,
            showFlag: { 'dropdown': 'hidden', 'search_result': 'hidden','load':'hidden' },//显示状态
        }
    },
    created() {
        this.$store.commit('changeTitle', '叮叮当');
        var whoIs = this.$store.state.who;
        if (whoIs == 'teacher') {//教师
            this.who = false;
            var allTeacherSchedule = this.$store.state.teacherScheduleList;
            this.teacherSchedule = this.todaySchedule(allTeacherSchedule);
            console.log('today');
            console.log(this.teacherSchedule);
            this.scheduleNameList = this.removal(this.todaySchedule(allTeacherSchedule), 'scheduleName');
            console.log(this.scheduleNameList)

        } else if (whoIs == 'student') {//学生
            this.who = true;
            var allSchedule = this.$store.state.scheduleList;
            console.log('all')
            console.log(allSchedule);
            this.scheduleList = this.todaySchedule(allSchedule);
            console.log('today');
            console.log(this.scheduleList);
            this.scheduleNameList = this.removal(allSchedule, 'scheduleName');
            console.log(this.scheduleNameList)

        } else {//非法用户跳转回登录页面
            Toast('非法用户登录');
            this.$router.replace({ path: '/' });
        }
        var _this = this;
        window.onscroll = function() {
            var scrollTop = $(window).scrollTop(),
                scrollHeight = $(document).height(),
                clientHeight = $(window).height();
            if (scrollTop > 120) {
                $('.toTop').show();
            } else {
                $('.toTop').hide();
            }
            if (!$.isEmptyObject(_this.search_result) && scrollTop + clientHeight == scrollHeight) {
                _this.pageCount++;
                _this.searchSign();
                if(_this.pageCount*2>=_this.search_result.lateCount+_this.search_result.absenseCount){
                    _this.showFlag['load']='show';
                }
            }
        }
    },
    mounted() {
        if (this.$store.state.user.username) {//学生账号登录初始定位
            map.init();
        }
        this.today = map.getTime();
    },
    methods: {
        returnshowFlag() { console.log(this.showFlag) },
        //点击进行签到
        sign() {
            console.log('签到...');
            console.log(this.inOrOut);
            if (!this.inOrOut) {
                Toast('目前不在签到地点中');
                return;
            }
            //判断需要进行签到的课程
            var filterCour = stuSearch.filterCourse();
            if (filterCour.length < 1) {
                return;
            }
            stuSearch.judgeTime(filterCour);
            console.log(this.signCourse);
            console.log(this.signType)
            //记录签到的情况，签到人，签到课程，签到时间，签到状态
            $.ajax({
                url: 'http://39.108.180.108/liuliequan/php/sign.php',
                type: 'POST',
                dataType: 'json',
                header: 'Access-Control-Allow-Origin:*',
                data: 'number=' + this.user.number + '&username=' + this.user.username + '&course=' + this.signCourse + '&time=' + this.today.currentTime + '&week=' + this.today.week + '&signType=' + this.signType,
                success: res => {
                    console.log(res)
                    if (res.success == 'ok') {
                        Toast('签到成功');
                    } else {
                        // Toast('签到不成功');
                    }
                },
                error: err => {
                    Toast(err);
                }
            });
        },


        //查询考勤记录
        searchSign() {
            var _this = this;
            if(this.courseSelect == '课程选择'){
                Toast('请先选择课程在查询');
                return ;
            }else  {
                Indicator.open();
                this.showFlag['search_result'] = 'show';
                if(this.who){//学生查询
                    this.lateCount = 0;
                    this.absenseCount = 0;
                    $.post({
                    url: 'http://39.108.180.108/liuliequan/php/search.php',
                    dataType: 'json',
                    header: 'Access-Control-Allow-Origin:*',
                    data: 'number=' + this.user.number + '&course='+ this.courseSelect+'&pageCount=' + this.pageCount*this.pageSize,
                    success: res => {
                        Indicator.close();
                        console.log(res);
                        this.search_result = res;
                        Indicator.close();
                    },
                    error: err => {
                        Indicator.close();
                        console.log(err)
                    }
                });
                }else{//教师查询

                }
            }

        },


        //重新查询
        reSearchSign() { Indicator.open(); this.searchSign() },
        //重新定位
        rgeo() { map.init() },
        //格式化星期
        checkWeek(week) {
            var weekArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六',]
            return weekArr[week];
        },
        toTop() {
            $('html,body').animate({ scrollTop: '0px' }, 500);
        },
        dropdownShow() {
            if (this.showFlag['dropdown'] == 'show') {
                this.showFlag['dropdown'] = 'hidden';
            } else {
                this.showFlag['dropdown'] = 'show';
            }
        },
        courseClick(e) {
            this.dropdownShow();
            this.courseSelect = $(e.target).html();
            this.pageCount=1;

        },
        //判断教师当天的课程
        todaySchedule(scheduleList) {
            var today = 0, todaySchedule = [];
            for (let i = 0; i < scheduleList.length; i++) {
                if (scheduleList[i].position == today || scheduleList[i].position == today + scheduleList[i].row * 7) {
                    todaySchedule.push(scheduleList[i]);
                }
            }

            return todaySchedule;
        },

        //教师课程去重
        removal(oldArr) {
            var newArr = [];
            $.each(oldArr, (i, item) => {
                var flag = true;
                if (newArr.length > 0) {
                    $.each(newArr, (v, m) => {
                        if (newArr[v].scheduleName == oldArr[i].scheduleName) {
                            flag = false;
                        }
                    })
                }
                if (flag) {
                    newArr.push(oldArr[i]);
                }
            });
            return newArr;
        },

        //教师查询结果
        teacherSearch() {
        }

    }//end of methods



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
    width: 100%;
    height: 132px;
    background: url('http://39.108.180.108/liuliequan/img/door_02.png') no-repeat 100% 100%;
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
    text-align: center;
}

.list th {
    text-align: center;
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
    text-decoration: line-through;
    color: #666;
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

.record {
    background: #fff;
    padding: 0 20px;
}

.record_result {
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    table-layout: fixed;
}

.record_result td,
.record_result th {
    text-align: center;
    width: 30%;
    border-bottom: 1px solid #ccc;
}

.toTop {
    position: fixed;
    right: 20px;
    bottom: 30px;
    display: none;
}

.count {
    margin: 10px 0;
}

.count span {
    color: #26a2ff;
}

.dropdown {
    float: left;
}

.dropdownMenu {
    list-style: none;
    background: #fff;
    text-align: left;
    padding: 4px 8px;
    border: 1px solid #ccc;
}

.dropdownMenu li {
    line-height: 26px;
}

.search_sign {
    font-size: 0.9rem;
    position: absolute;
    right: 6rem;
}
</style>
