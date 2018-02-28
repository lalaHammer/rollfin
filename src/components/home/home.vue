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
                <p @click="rgeo">重新定位</p>
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
            <!-- <mymap class="mymap" ref="map"></mymap> -->
        </div>

    </div>
</template>

<script>
import AMap from 'AMap'
import AMapUI from 'AMapUI'
import { Toast,Indicator } from 'mint-ui'
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
            signType: '',//0出勤 1迟到 2缺勤
            signCourse: '',
             addr: '',
            lng: '',
            lat: '',
            pointsArr: {
                '教学楼': '113.190061,23.410619;113.191678,23.410603;113.190066,23.410412;113.191678,23.410375',//教学楼围栏坐标
                "实验楼": '113.190115,23.408961;113.190241,23.408696;113.191198,23.408667;113.191193,23.408866',//实验楼围栏坐标
                "艺术楼": '113.191651,23.40928;113.191593,23.408534;113.192145,23.408551;113.192172,23.409259' //艺术楼围栏坐标
            },
        }
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

console.log(this.inOrOut);
 

    },
    mounted() {
        this.init();
        this.today = this.getTime();
    },
    methods: {
        //点击进行签到
        sign() {          
            console.log('签到...');
            console.log(this.inOrOut);
            if(!this.inOrOut){
                Toast('目前不在签到地点中');
                return ;
            }
            //判断需要进行签到的课程
            var filterCour = this.filterCourse();
            if (filterCour.length < 1) {
                return;
            }
            this.judgeTime(filterCour);
            console.log(this.signType);
            console.log(this.signCourse);
            //记录签到的情况，签到人，签到课程，签到时间，签到状态
            $.ajax({
                url: 'http://39.108.180.108/liuliequan/php/sign.php',
                type: 'POST',
                dataType: 'json',
                header: 'Access-Control-Allow-Origin:*',
                data: 'number=' + this.user.number + '&username=' + this.user.username + '&course=' + this.signCourse + '&time=' + this.today.currentTime + '&signType=' + this.signType,
                success: res => {
                    console.log(res)
                    if (res.success == 'ok') {
                        Toast('签到成功');
                    } else {
                        Toast('签到不成功');
                    }
                },
                error: err => {
                    Toast(err);
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
            //var thisHour=new Date().getHours(),
            var thisHour = '14',
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

            }
        },
        judge(i) {
            var timeArr = ['08:10', '08:55', '09:45', '10:30', '11:15', '14:00', '14:45', '15:35', '16:20'],
                // tTime=new Date(this.today.signDay+" "+this.today.signTime).getTime(),
                tTime = new Date(this.today.signDay + " " + '14:50').getTime(),
                cTime = new Date(this.today.signDay + " " + timeArr[i]).getTime();
            console.log(tTime - cTime)
            if (tTime - cTime < 0) {
                if (cTime - tTime <= 10 * 60 * 1000) {
                    this.signType = '0';
                }
            } else {
                if (tTime - cTime < 40 * 1000 * 60) {
                    this.signType = "1";

                } else if (tTime - cTime >= 40 * 1000 * 60) {
                    this.signType = '2';

                }
            }
        },
         rgeo(){this.init()},
         init() {//获取定位信息
            Indicator.open({
                text: '正在定位请稍后',
                spinnerType: 'fading-circle'
            });
            var _this = this;
            //  创建地图
            let mapObj = new AMap.Map('map-container', {
                center: [117.000923, 36.675807],
                zoom: 6
            });

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
                    _this.addr = result.formattedAddress;
                    console.log(_this.addr);
                    _this.lng = result.position.lng;
                    _this.lat = result.position.lat;
                    Indicator.close();
                    //创建围栏
                    var havenRail = _this.reseacherRail();
                    if (havenRail) {
                        for (let i in _this.pointsArr) {
                            _this.createRail(i, _this.pointsArr[i]);
                        }
                    }
                    _this.returnPoint();
                    //  mapObj.setCenter(result.position)
                })  //  返回定位信息
                AMap.event.addListener(geolocation, 'error', (result) => {
                    console.log(result)
                })  //  返回定位出错信息
            });


        },


        //获取当前签到的时间
        getTime() {
            var weekArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六',]
            var date = new Date();
            var year = date.getFullYear(),
                month = this.checkDate(date.getMonth() + 1),
                day = this.checkDate(date.getDate()),
                hour = this.checkDate(date.getHours()),
                min = this.checkDate(date.getMinutes()),
                sec = this.checkDate(date.getSeconds()),
                currentTime = year + '-' + month + '-' + day + " " + hour + ":" + min + ":" + sec,
                time = date.getTime(),
                week = weekArr[date.getDay()];
            return {
                'currentTime': currentTime,
                "week": week,
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
        returnPoint() {
            var _this = this, diu = '';
            switch (this.ismobile()) {//没有权限获取识别码，暂代
                case 'ad':
                    diu = '99001021626653'; break;
                case 'ios':
                    diu = '359241060970941'; break;
                case 'ot': Toast('仅支持Android和IOS系统'); break;
            }
            if (this.lng != '' || this.lat != '') {
                console.log('查询定位是否在围栏中')
                $.ajax({
                    url: 'http://restapi.amap.com/v4/geofence/status?key=1d62d5d73074e9d614c1581397b70a29',
                    type: 'GET',
                    dataTyep: 'json',
                    header: 'Access-Control-Allow-Origin:*',
                    data: { diu: diu, locations: '113.191692,23.410449,1484816232' },
                    success(res) {
                        console.log(res);
                        if (parseInt(res.data.nearest_fence_distance)<20 || res.data.fencing_event_list[0].client_status == 'in') {
                            console.log('在围栏中');
                            _this.inOrOut=true;
                        } else {
                            console.log('不在围栏中');
                           _this.inOrOut=false;
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
