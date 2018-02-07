<template>
    <div class="container">
        <div class="login_head">
            <img src="../../assets/door.png" alt="" class="door">
        </div>
        <form action="" class="center-block">
            <div class="form-group">
                <input type="text" placeholder="请输入用户名" name="username" v-model="username" @input="show">
                <img src="../../assets/cancal.png" alt="" class="dele-icon" v-if="showIcon" @click="clearUsername">
                <div class="left"></div>
                <div class="right"></div>
            </div>
            <div class="form-group">
                <input type="password" placeholder="请输入密码" v-model="password">
                <div class="left"></div>
                <div class="right"></div>
            </div>
            <!-- <div class="form-group clearfix">
                                    <input type="text" placeholder="请输入验证码" v-model="code" style="width:140px;margin-right:54px" @blur="checkCode">
                                    <div class="left"></div>
                                    <div class="right"></div>
                                    <div id="code"></div>
                             </div> -->
            <button type="submit" class="btn" @click.prevent="whologin">登 录</button>
        </form>
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
                Indicator.open({ spinnerType: 'fading-circle' });
                if (this.username.length > 5) {
                    if (isNaN(this.username)) {
                        console.log('学生账号');
                        this.login();
                    } else {
                        Toast('请输入教务系统账号');
                    }
                } else {
                    console.log('教师账号')
                    this.teLogin();
                }
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
                    // console.log(res);
                    if (res.success) {
                        var user = res.user;
                        $.ajax({//登录成功后请求课表
                            url: 'http://39.108.180.108/liuliequan/php/loginuser.php',
                            type: "POST",
                            dataType: 'json',
                            header: 'Access-Control-Allow-Origin:*',
                            data: 'username=' + this.username + '&password=' + this.password + '&keycode=' + res.user.keycode + '&number=' + res.user.number,
                            success: res => {
                                _this.$router.replace({ path: '/home' });
                                _this.$store.commit('changeUser', user);
                                _this.$store.commit('whoIs','student');
                                Indicator.close();
                                if (res.success) {
                                    console.log(res.scheduleList);
                                    this.$store.commit('setScheduleList', res.scheduleList);
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
                    }
                },
                error: res => {
                    Indicator.close();
                    Toast(res.errorMessage);

                }

            })

        },
        teLogin() {//教师账号登录
         var _this=this;
            $.ajax({
                url: 'http://39.108.180.108/liuliequan/php/login.php',
                type: 'POST',
                dataType: 'json',
                header: 'Access-Control-Allow-Origin:*',
                data: 'username=' + this.username + '&password=' + this.password,
                success:res=> {
                    Indicator.close();
                    console.log(res);
                     _this.$router.replace({ path: '/home' });
                     _this.$store.commit('changeUser', res.user.name);
                     _this.$store.commit('whoIs','teacher');
                },
                error:err=>{
                    Indicator.close();
                    Toast(res.errorMessage);
                    this.clearUsername();
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
        },


    },
    created() {
        //获取手机ip
        this.ip = returnCitySN['cip'];
        console.log(this.ip);
    }

}
$(function() {
    $('.form-group input').on('focus', function(e) {
        var width = $('.form-group input').width();
        var $left = $(e.target).siblings('.left');
        var $right = $(e.target).siblings('.right');
        $left.show().stop().animate({
            width: width + 10 + 'px'
        }, 'slow');
        $right.show().stop().animate({
            width: width + 10 + 'px'
        }, 'slow');
    }).on('blur', function(e) {
        var $left = $(e.target).siblings('.left');
        var $right = $(e.target).siblings('.right');
        $left.show().stop().animate({
            width: '0px'
        }, 'slow');
        $right.show().stop().animate({
            width: '0px'
        }, 'slow');
    });
})

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
}

.form-group {
    position: relative;
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
    font-size: 0.9rem;
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
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 6%;
    font-size: 0.7rem;
}
</style>
