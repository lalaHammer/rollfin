<template>
    <div class="container">
        <div class="login_head">
            <img src="http://39.108.180.108/liuliequan/img/door.png" alt="" class="door">
        </div>
        <div class="box">
            <p class="school_name"><img src="http://39.108.180.108/liuliequan/img/logo.jpg" alt="" style="width:40px;height:40px;margin:8px;">广东第二师范学院</p>
            <form action="" class="center-block">
                <div class="form-group">
                    <span>请输入学号或工号</span>
                    <input type="text" name="username" v-model="username" @input="show">
                    <img src="http://39.108.180.108/liuliequan/img/cancal.png" alt="" class="dele-icon" v-if="showIcon" @click="clearUsername">
                    <div class="left"></div>
                    <div class="right"></div>
                </div>
                <div class="form-group">
                    <span>请输入密码</span>
                    <input type="password" v-model="password">
                    <div class="left"></div>
                    <div class="right"></div>
                </div>
                <!-- <div class="select_area">
                      <input type="radio" name="userRadio" id="stu_radio" checked value="student"/><label for="stu_radio"><span>学生</span></label>
                      <input type="radio" name="userRadio" id="te_radio" value="teacher"/><label for="te_radio"><span>教师</span></label>
                    </div> -->
                <!-- <div class="form-group clearfix">
                                            <input type="text" placeholder="请输入验证码" v-model="code" style="width:140px;margin-right:54px" @blur="checkCode">
                                            <div class="left"></div>
                                            <div class="right"></div>
                                            <div id="code"></div>
                                     </div> -->
                <button type="submit" class="btn" @click.prevent="whologin">登 录</button>
            </form>
        </div>
        <div class="footer">
            <p>版权所有&copy;刘烈权</p>
            <p>叮叮当 1.0</p>
        </div>
    </div>
</template>

<script>
import $ from 'jquery'
import { Indicator, Toast } from 'mint-ui'

export default {
    name: 'login',
    data() {
        return {
            username: '',
            password: '',
            showIcon: false,
            ip: '',//手机ip
            code: ''
        }
    },

    methods: {
        whologin() {
            if (this.username == '' || this.password == '') {
                Toast('用户名或密码为空');
                return;
            } else {
                Indicator.open();
                if (this.username.substr(0, 1) == '0') {
                    this.teLogin();
                } else {
                    this.login();
                }
                // var userType=$('.select_area input[type=radio]:checked').val();
                // if(userType=='student'){
                //     console.log('student');
                // }else if(userType=='teacher'){
                //     console.log('teacher');
                // }else{
                //     console.log('非法yonghu')
                // }
            }

        },
        login() {//学生账号登录
            var _this = this;
            $.ajax({//请求用户数据
                url: 'http://39.108.180.108/liuliequan/php/login.php',
                type: 'POST',
                dataType: 'json',
                header: 'Access-Control-Allow-Origin:*',
                data: 'username=' + this.username + '&password=' + this.password + '&ip=' + returnCitySN['cip'],
                success: res => {
                    Indicator.close();
                    console.log(res);
                    if (res.success) {
                        var user = res.user;
                        _this.$store.commit('changeUser', user);
                        $.ajax({//登录成功后请求课表
                            url: 'http://39.108.180.108/liuliequan/php/loginuser.php',
                            type: "POST",
                            dataType: 'json',
                            header: 'Access-Control-Allow-Origin:*',
                            data: 'username=' + this.username + '&password=' + this.password + '&keycode=' + res.user.keycode + '&number=' + res.user.number,
                            success: res => {
                                if (res.success) {
                                    console.log(res);
                                    _this.$router.replace({ path: '/home' });
                                    _this.$store.commit('changeUser', user);
                                    _this.$store.commit('whoIs', 'student');
                                    this.$store.commit('setScheduleList', res.scheduleList);
                                    this.$store.commit('setWeek', res.selectedWeek);
                                } else {
                                    Toast(res.errorMessage);
                                }
                            },
                            erroe: err => {
                                Indicator.close();
                                Toast(res.errorMessage);
                                this.clearUsername();
                            }
                        })
                    } else {
                        Indicator.close();
                        Toast(res.errorMessage);
                        this.clearUsername();
                        return;
                    }
                },
                error: res => {
                    Indicator.close();
                    Toast(res.errorMessage);

                }

            })

        },
        teLogin() {//教师账号登录
            var this_year = new Date().getFullYear();
            var this_mouth = new Date().getMonth() + 1;
            var year, term;
            if (this_mouth <= 2 || this_mouth >= 9) {
                year = this_year + '-' + this_year + 1;
                term = '1';
            } else {
                year = this_year - 1 + '-' + this_year;
                term = '2';
            }
            $.post({
                url: 'http://39.108.180.108/liuliequan/php/teLogin.php',
                dataType: 'json',
                header: 'Access-Control-Allow-Origin:*',
                data: 'username=' + this.username + '&password=' + this.password + '&year=' + year + '&term=' + term,
                success: res => {
                    console.log(res);
                    Indicator.close();
                    if (res.success) {
                        this.$router.replace({ path: '/home' });
                        this.$store.commit('setTeacherScheduleList', res.data);
                        this.$store.commit('whoIs', 'teacher');
                    } else {
                        Toast(res.errorMessage);
                        this.clearUsername();
                    }
                }

            })
        },
        show() {//显示隐藏清空图片按钮
            if (this.username != '') {
                this.showIcon = true;
            } else {
                this.showIcon = false;
            }
        },
        clearUsername() {//清除输入的用户名
            this.username = '';
            this.password = '';
            this.showIcon = false;
            $('.form-group span').animate({
                top: '10px',
                fontSize: '1.1rem'
            });;
        },


    },
    created() {
        //获取手机ip
        if (returnCitySN['cip']) {
            this.ip = returnCitySN['cip'];
            console.log(this.ip);
        } else {
            Toast('获取手机IP失败，请检查网络');
        }

        $(function() {
            $('.form-group span').on('click', (e) => {
                $(e.target).siblings('input').focus();
            });
            $('.form-group input').on('focus', function(e) {
                var width = $('.form-group input').width();
                var $left = $(e.target).siblings('.left');
                var $right = $(e.target).siblings('.right');
                var $span = $(e.target).siblings('span');
                $span.animate({
                    top: '-16px',
                    left: '0px',
                    fontSize: '1rem'
                });
                $left.show().stop().animate({
                    width: width + 10 + 'px'
                }, 'slow');
                $right.show().stop().animate({
                    width: width + 10 + 'px'
                }, 'slow');
            }).on('blur', function(e) {
                var $left = $(e.target).siblings('.left');
                var $right = $(e.target).siblings('.right');
                var $span = $(e.target).siblings('span');
                if ($(e.target).val() == '') {
                    $span.animate({
                        top: '10px',
                        fontSize: '1.1rem'
                    });
                }
                $left.show().stop().animate({
                    width: '0px'
                }, 'slow');
                $right.show().stop().animate({
                    width: '0px'
                }, 'slow');
            });

            $(window).on('resize', function() {
                $('.login_head').addClass('zoomOutUp');
                $('.footer').hide();
                setTimeout(() => {
                    $('.box').animate({ marginTop: '-140px' }, 1000);
                    $('.school_name').addClass('rotateInDownLeft').show();
                    $('.center-block').animate({ marginTop: '20px' });
                }, 300)
            });

        });

    }

}

</script>

<style scoped>
.login_head {
    width: 100%;
    position: relative;
    margin-top: 20px;
}

.login_head .door {
    width: 90%;
    border-radius: 10px;
}

form {
    margin-top: 40px;
    width: 80%;
}

.form-control:focus {
    border-color: #fff;
    outline: 0;
    -webkit-box-shadow: none;
    box-shadow: none;
}

input {
    /* border:; */
    width: 100%;
    padding: 6px;
    border: none;
    outline: none;
    font-size: 1.2rem;
}

.container .form-group {
    position: relative;
    margin-bottom: 20px;
}

.form-group span {
    position: absolute;
    top: 10px;
    color: #989a9a;
    font-size: 1.1rem;
}

.left,
.right {
    width: 1px;
    height: 1px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: none;
    background: #26a2ff;
}

.btn {
    width: 100%;
    border: 1px solid #26a2ff;
    background: #fff;
    color: #26a2ff;
    font-size: 1.3rem;
}

.btn:focus {
    -webkit-box-shadow: 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 8px rgba(102, 175, 233, 0.6);
    outline: none;
    color: #26a2ff
}

.dele-icon {
    width: 16px;
    height: 16px;
    position: absolute;
    right: 5px;
    top: 50%;
    margin-top: -10px;
}

.footer {
    color: #ccc;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 6%;
    font-size: 0.7rem;
}

.school_name {
    font-size: 1.4rem;
    color: #2e97e6;
    text-align: left;
    font-family: '楷体';
    display: none;
}

.select_area label {
    margin: 10px 0;
    position: relative;
}

.select_area span {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #666;
}

.select_area input[type="radio"] {
    position: absolute;
    clip: rect(0, 0, 0, 0);
}

.select_area input[type="radio"]+label::before {
    content: '\a0';
    width: 5rem;
    border: 1px solid #ccc;
    display: inline-block;
    padding: 4px;
    border-radius: 5px;
}

.select_area input[type="radio"]:checked+label::before {
    border: 1px solid #2e97e6;
    color: #2e97e6
}

.select_area input[type="radio"]:checked+label>span {
    color: #2e97e6;
}
</style>
