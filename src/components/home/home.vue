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
                        <tr>
                            <td>课程</td>
                            <td>上课时间</td>
                            <td>上课地点</th>
                            <td>授课教师</td>
                        </tr>
                        <tr v-for="item of scheduleList ">
                            <td>{{item.scheduleName}}</td>
                            <td>{{item.scheduleLesson}}</td>
                            <td>{{item.scheduleLocation}}</td>
                            <td>{{item.scheduleTeacher}}</td>
                        </tr>
                    </table>
                    <div v-else>
                        <span>今天没有课喔 ！！</span>
                    </div>
                </div>
                <div class="list" v-else>
                    <table v-if="teacherSchedule.length!=0">
                        <tr>
                            <td>课程</td>
                            <td>上课时间</td>
                            <td>上课地点</td>
                            <td>班级</td>
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
                <div class="signCir" @click="sign()">
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
                <div v-if="showFlag['search_result']=='show'">
                    <p class="count">
                        考勤统计： 迟到
                        <span>{{search_result.lateCount}}</span>次　 缺勤
                        <span>{{search_result.absenseCount}}</span>次
                    </p>
                    <!--学生用户查询结果  -->
                    <div v-if="who">
                        <table class="record_result">
                            <thead>
                                <th>课程</th>
                                <th>签到日期</th>
                                <th>签到状态</th>
                            </thead>
                            <tbody>
                                <tr v-for="(item,i) of search_result['result']">
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
                        <table class="record_result">
                            <thead>
                                <tr>
                                    <th>学号</th>
                                    <th>姓名</th>
                                    <th>迟到次数</th>
                                    <th>缺勤次数</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item,key,i) of teacher_result">
                                    <td>{{key}}</td>
                                    <td>{{item.username}}</td>
                                    <td>{{item.lateCount}} 次</td>
                                    <td>{{item.absenseCount}} 次</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!--加载完毕  -->
                <p v-if="showFlag['load']=='show'">加载完毕</p>
            </div>
        </div>
        <!--暂无数据  -->
     <div  class="nodata">
                    <div><img src="http://39.108.180.108/liuliequan/img/nodata.jpg" alt=""></div>
                    <p>暂无数据</p>
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
export default {
    name: 'home',
    data() {
        return {
            scheduleList: [],//学生当前课表
            week: this.$store.state.week,//当前周(学生账号可见)
            who: true,//用户登录标识，教师账号为false(0)，学生账号为true(1)
            today: {},
            inOrOut: true,//是否在定位围栏中
            user: this.$store.state.user,
            signType: '',
            signCourse: '',
            search_result: {},//考勤查询结果
            teacherSchedule: [],//教师课表
            scheduleNameList: [],//教师当前课表
            teacher_result: [],//教师查询结果
            courseSelect: '课程选择',//课程选择
            courseSelectShow: false,
            pageCount: 1,
            pageSize: 5,
            showFlag: { 'dropdown': 'hidden', 'search_result': 'hidden', 'load': 'hidden' },//显示状态
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
            $('body').css({height:$(window).height()+100+'px'})
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
                if (_this.pageSize*_this.pageCount <= _this.search_result.count) {
                    Indicator.open();
                    _this.pageCount++;
                    _this.searchSign();
                }
                if (_this.pageCount * _this.pageSize >= _this.search_result.count){
                        _this.showFlag['load'] = 'show';
                }
            }
        }
        if(!this.inOrOut){
           setInterval(()=>{
               this.init();
           },1000);
        }
        if(this.inOrOut){
            clearInterval();
        }

        console.log(this.inOrOut);
    },
    mounted() {
        if (this.$store.state.user.username) {//学生账号登录初始定位
          Indicator.open({
                text: '正在定位请稍后',
                spinnerType: 'fading-circle'
            });
           this.init();
        }
        this.today = this.getTime();
    },
    methods: {
        //点击进行签到
        sign() {
            console.log('签到...');
            if (!this.inOrOut) {
                Toast('目前不在签到地点中');
                return;
            }
            //判断需要进行签到的课程
            var filter_course = this.filterCourse();
            console.log(filter_course)
            if (filter_course.length < 1) {
                Toast('没有需要签到的课程!');
                return;
            }
            this.judgeTime(filter_course);
            //记录签到的情况，签到人，签到课程，签到时间，签到状态
            $.ajax({
                url: 'http://39.108.180.108/liuliequan/php/sign.php',
                type: 'POST',
                dataType: 'json',
                header: 'Access-Control-Allow-Origin:*',
                data: 'number=' + this.user.number + '&username=' + this.user.xm + '&course=' + this.signCourse + '&time=' + this.today.currentTime + '&week=' + this.today.week + '&signType=' + this.signType,
                success: res => {
                    console.log(res)
                    if (res.success == 'ok') {
                        Toast('签到成功');
                    } else {
                        //  Toast('签到失败');
                    }
                },
                error: err => {
                    Toast(err);
                }
            });
        },

        //学生签到相关
          //筛选需要进行签到的课程
        filterCourse() {
            var arr = [], arr2 = [];
            $.each(this.scheduleList, (i) => {
                var flag = true;
                if (arr.length > 0) {
                    $.each(arr, (n) => {
                        if (this.scheduleList[i].position < 35) {
                            if (arr[n].scheduleName == this.scheduleList[i].scheduleName) {
                                flag = false;
                            }
                        }
                    });
                }
                flag = true;
                if (arr2.length > 0) {
                    $.each(arr2, (n) => {
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
        judgeTime(arr) {
            var thisHour = new Date().getHours(),
            // var thisHour='9',
                _this = this;
            console.log(thisHour);
            switch (thisHour) {
                case '8':
                    $.each(arr, (i, item) => {
                        if (item.position < 14) {
                            if (item.position < 7) {
                                console.log('第一节')
                                _this.judge(0);//第一节课
                                _this.signCourse = item.scheduleName;
                            } else {
                                _this.judge(1);//第二节课
                                _this.signCourse = item.scheduleName;
                            }
                        }
                    }); break;
                case "9":
                    $.each(arr, (i, item) => {
                        if (item.position >= 14 && item.position < 21) {
                            _this.judge(2);//第三节课
                            _this.signCourse = item.scheduleName;
                        }
                    }); break;
                case '10':
                    $.each(arr, (i, item) => {
                        if (item.position >= 21 && item.position < 28) {
                            _this.judge(3);//第四节课
                            _this.signCourse = item.scheduleName;
                        }
                    }); break;
                case '11':
                    $.each(arr, (i, item) => {
                        if (item.position >= 28 && item.position < 35) {
                            _this.judge(4);//第5节课
                            _this.signCourse = item.scheduleName;
                        }
                    }); break;
                case '14':
                    $.each(arr, (i, item) => {
                        if (item.position >= 34 && item.position < 49) {
                            if (item.position < 42) {
                                _this.judge(5);//第6节课
                                _this.signCourse = item.scheduleName;
                            } else {
                                _this.judge(6);//第7节课
                                _this.signCourse = item.scheduleName;
                            }
                        }
                    }); break;
                case '15':
                    $.each(arr, (i, item) => {
                        if (item.position >= 49 && item.position < 56) {
                            _this.judge(7);//第8节课
                            _this.signCourse = item.scheduleName;
                        }
                    }); break;
                case '14':
                    $.each(arr, (i, item) => {
                        if (item.position >= 56 && item.position < 63) {
                            _this.judge(8);//第9节课
                            _this.signCourse = item.scheduleName;
                        }
                    }); break;
                default:
                    Toast('当前没有需要签到的课程！');
                    return;
            }
        },
        judge(i) {
            var timeArr = ['08:10', '08:55', '09:45', '10:30', '11:15', '14:00', '14:45', '15:35', '16:20'],
                tTime=new Date(this.today.signDay+" "+this.today.signTime).getTime(),
                // tTime = new Date(this.today.signDay + " " + '14:50').getTime(),
                cTime = new Date(this.today.signDay + " " + timeArr[i]).getTime();
            if (tTime - cTime < 0) {
                if (cTime - tTime <= 10 * 60 * 1000) {
                    this.signType = '0';//出勤
                }
            } else {
                if (tTime - cTime < 40 * 1000 * 60) {
                    this.signType = "1";//迟到

                } else if (tTime - cTime >= 40 * 1000 * 60) {
                    this.signType = '2';//缺勤

                }
            }
        },


        //查询考勤记录相关
        searchSign() {
            if (this.courseSelect == '课程选择') {
                Toast('请先选择课程在查询');
                return;
            } else {
                Indicator.open();
                this.lateCount = 0;
                this.absenseCount = 0;
                if (this.who) {//学生查询
                    $.post({
                        url: 'http://39.108.180.108/liuliequan/php/search.php',
                        dataType: 'json',
                        header: 'Access-Control-Allow-Origin:*',
                        data: 'number=' + this.user.number + '&course=' + this.courseSelect + '&pageCount=' + this.pageCount + '&pageSize=' + this.pageSize,
                        success: res => {
                            console.log(res);
                            if (res.success) {
                                Toast(res.text);
                            } else {
                                setTimeout(() => {
                                    this.search_result = res;
                                }, 200);
                            }
                            if (this.search_result.success != 'true') {
                                    this.showFlag['search_result'] = 'show';
                            }
                           setTimeout(()=>{
                                Indicator.close();
                           },1000)
                        },
                        error: err => {
                            Toast('查询失败');
                            console.log(err)
                            Indicator.close();
                        }
                    });
                } else {//教师查询
                    $.post({
                        url: '',
                        url: 'http://39.108.180.108/liuliequan/php/search.php',
                        dataType: 'json',
                        header: 'Access-Control-Allow-Origin:*',
                        data: 'course=' + this.courseSelect + '&pageCount=' + this.pageCount + '&pageSize=' + this.pageSize,
                        success: res => {
                            console.log(res);
                            if (res.success) {
                                Toast(res.text);
                            } else {
                                setTimeout(() => {
                                    this.search_result = res;
                                    this.teacher_result = {};
                                    $.each(this.search_result.result, (i, item) => {
                                        console.log(item)
                                        if (this.teacher_result[item.number]) {
                                            if (item.signType == '1') {
                                                this.teacher_result[item.number].lateCount++;
                                            } else if (item.signType == '2') {
                                                this.teacher_result[item.number].absenseCount++;
                                            }
                                        }else{
                                            if(item.signType=='1'){
                                                 this.teacher_result[item.number]={number:encodeURI(item.number),lateCount:1,absenseCount:0};
                                            }else if(item.signType=="2"){
                                                this.teacher_result[item.number]={number:encodeURI(item.number),lateCount:0,absenseCount:1};
                                            }
                                        }
                                        if (this.search_result.success != 'true') {
                                                this.showFlag['search_result'] = 'show';
                                            }
                                    });
                                    // this.teacher_result=Object.keys( this.teacher_result).sort((a, b)=> {
                                    //     return  this.teacher_result[b]-  this.teacher_result[a];
                                    // });
                                    console.log(this.teacher_result)
                                }, 200);
                            }
                            setTimeout(()=>{
                                Indicator.close();
                           },1000)
                        },
                        error: err => {
                            Toast('查询失败');
                            console.log(err)
                            Indicator.close();
                        }
                    });
                }

            }
        },

          //判断当天的课程
        todaySchedule(scheduleList) {
            // var today = new Date().getDay(),
             var today=1,
             todaySchedule = [];
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

        //重新查询
        reSearchSign() { Indicator.open(); this.searchSign() },
        //重新定位
        rgeo() { 
             clearInterval();
            Indicator.open({
                text: '正在定位请稍后',
                spinnerType: 'fading-circle'
            });
            this.init() ;
        },
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
            this.pageCount = 1;

        },

       

        //定位相关
        init() {//获取定位信息
            //  创建地图
            let mapObj = new AMap.Map('map-container', {
                center: [117.000923, 36.675807],
                zoom: 6
            });
            var _this = this;
            mapObj.plugin(['AMap.Geolocation'], function() {
                let geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true, //  是否使用高精度定位，默认:true
                    timeout: 10000, //  超过10秒后停止定位，默认：无穷大
                    maximumAge: 0, // 定位结果缓存0毫秒，默认：0
                    convert: false, // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    showButton: false, //  显示定位按钮，默认：true
                    buttonPosition: 'LB',  // 定位按钮停靠位置，默认：'LB'，左下角
                    buttonOffset: new AMap.Pixel(10, 20), //  定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    showMarker: true, //  定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true, //  定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true,  //  定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy: true  //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                })
                mapObj.addControl(geolocation)
                geolocation.getCurrentPosition()
                AMap.event.addListener(geolocation, 'complete', (result) => {
                    console.log(result);
                    // _this.addr = result.formattedAddress;
                    console.log(result.formattedAddress);
                    // _this.lng = result.position.lng;
                    // _this.lat = result.position.lat;
                    Indicator.close();
                    //创建围栏
                    var pointsArr = {
                        '教学楼': '113.190043,23.410623;113.19007,23.410408;113.191687,23.410607;113.191687,23.41037',//教学楼围栏坐标
                        "实验楼": '113.190115,23.408961;113.190241,23.408696;113.191198,23.408667;113.191193,23.408866',//实验楼围栏坐标
                        "艺术楼": '113.191651,23.40928;113.191593,23.408534;113.192145,23.408551;113.192172,23.409259' //艺术楼围栏坐标
                    };
                    var havenRail = _this.reseacherRail();
                    if (havenRail) {
                        for (let i in _this.pointsArr) {
                            _this.createRail(i, _this.pointsArr[i]);
                        }
                    }
                    _this.returnPoint(result.position.lng, result.position.lat);
                    //  mapObj.setCenter(result.position)
                })  //  返回定位信息
                AMap.event.addListener(geolocation, 'error', (result) => {
                    console.log(result)
                })  //  返回定位出错信息
            });
        },

        //获取当前签到的时间
        getTime() {
            var date = new Date();
            var year = date.getFullYear(),
                month = this.checkDate(date.getMonth() + 1),
                day = this.checkDate(date.getDate()),
                hour = this.checkDate(date.getHours()),
                min = this.checkDate(date.getMinutes()),
                sec = this.checkDate(date.getSeconds()),
                currentTime = year + '-' + month + '-' + day + " " + hour + ":" + min + ":" + sec,
                time = date.getTime();
            return {
                'currentTime': currentTime,
                "week": date.getDay(),
                "day": month + '-' + day,
                "time": time,
                'signTime': hour + ':' + min,
                'signDay': year + '-' + month + '-' + day
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
      
        //创建围栏
        createRail(name, point) {
            var data = {
                "name": name,
                'points': point,
                "repeat": "Mon,Tues,Wed,Thur,Fri,Sat,Sun"
            };
            $.ajax({
                type: 'POST',
                url: "http://restapi.amap.com/v4/geofence/meta?key=1d62d5d73074e9d614c1581397b70a29",
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                success: function(res) {
                    console.log('创建' + name + '围栏成功')
                    console.log(res);
                },
                error(res) {
                    console.log('创建围栏失败')
                    console.log(res);
                }
            });
        },
        //查询围栏
        reseacherRail() {
            $.get({
                url: 'http://restapi.amap.com/v4/geofence/meta?key=1d62d5d73074e9d614c1581397b70a29',
                success(res) {
                    console.log('已存在围栏');
                    return true;
                },
                error(err) {
                    console.log('创建围栏失败' + err);
                    Toast('创建围栏失败！！');
                    return false;
                }
            })
        },
        //查询定位是否在围栏中
        returnPoint(lng, lat) {
            var diu = '', _this = this;
            switch (this.ismobile()) {//没有权限获取识别码，暂代
                case 'ad':
                    diu = '99001021626653'; break;
                case 'ios':
                    diu = '359241060970941'; break;
                case 'ot': Toast('仅支持Android和IOS系统'); break;
            }
            if (lng != '' || lat != '') {
                console.log('查询定位是否在围栏中')
                $.ajax({
                    url: 'http://restapi.amap.com/v4/geofence/status?key=1d62d5d73074e9d614c1581397b70a29',
                    type: 'GET',
                    dataTyep: 'json',
                    header: 'Access-Control-Allow-Origin:*',
                    data: { diu: diu, locations: lng + ',' + lat + ',1484816232' },
                    // data: { diu: diu, locations:'113.190822,23.410491,1484816232' },
                    success(res) {
                        console.log(res);
                        if (parseInt(res.data.nearest_fence_distance) < 20 || res.data.fencing_event_list[0].client_status == 'in') {
                            console.log('在围栏中');
                            _this.inOrOut=true;
                        } else {
                            console.log('不在围栏中');
                            _this.inOrOut = false;
                            Toast({
                                message:'距离最近的签到地点' + res.data.nearest_fence_distance + '米',
                                duration:2000
                            });
                        }
                    },
                    error(err) {
                        console.log('err')
                        Toast(err);
                        return fasle;
                    }
                });
            }

        },
        //判断手机型号
        ismobile() {
            var u = navigator.userAgent;
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
            var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
            if (isAndroid) {
                return 'ad';
            } else if (isiOS) {
                return 'ios';
            } else {
                return 'ot';
            }
        },
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
    line-height:2rem;
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

.nodata {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: -1;
    bottom:-5rem;
}

.nodata p {
    color: #ccc;
    font-size: 0.7rem;
    text-align: center;
    letter-spacing: 1rem;
    margin: 20px 0 0 1rem;
}

.nodata>div {
    width: 10rem;
    height: 10rem;
    border-radius: 50%;
    overflow: hidden;
}

.nodata img {
    width: 10rem;
    height: 10rem;
}

</style>
