import { Toast, Indicator } from 'mint-ui'
import $ from 'jquery'

export default{
    
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
            var thisHour = new Date().getHours(),
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
                // tTime=new Date(this.today.signDay+" "+this.today.signTime).getTime(),
                tTime = new Date(this.today.signDay + " " + '14:50').getTime(),
                cTime = new Date(this.today.signDay + " " + timeArr[i]).getTime();
            console.log(tTime - cTime)
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
}