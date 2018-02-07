<template>
   
</template>

<script>
import AMap from 'AMap'
import AMapUI from 'AMapUI'
import { Indicator, Toast } from 'mint-ui'
export default {
    name: 'map',
    data() {
        return {
            user:this.$store.state.user,
            addr: '',
            lng: '',
            lat: '',
            pointsArr:{
               '教学楼': '113.190061,23.410619;113.191678,23.410603;113.190066,23.410412;113.191678,23.410375',//教学楼围栏坐标
                "实验楼":'113.190115,23.408961;113.190241,23.408696;113.191198,23.408667;113.191193,23.408866',//实验楼围栏坐标
                "艺术楼":'113.191651,23.40928;113.191593,23.408534;113.192145,23.408551;113.192172,23.409259' //艺术楼围栏坐标
            },

        }
    },
    methods: {
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
                    //  mapObj.setCenter(result.position)
                })  //  返回定位信息
                AMap.event.addListener(geolocation, 'error', (result) => {
                    console.log(result)
                })  //  返回定位出错信息
            });
           this.createPoint();

        },

        //重新定位
        regeo() {
            console.log('开始重新定位');
            this.init();
        },
        //获取当前签到的时间
        getTime() {
            var weekArr = ['周日', '周一', '二', '周三', '周四', '周五', '周六',]
            var date = new Date();
            var year = date.getFullYear(),
                month=this.checkDate(date.getMonth()+1),
                day=this.checkDate(date.getDate()),
                hour =this.checkDate(date.getHours()),
                min = this.checkDate(date.getMinutes()),
                sec = this.checkDate(date.getSeconds()),
                currentTime = year+'/'+month+'/'+day + "  " + hour + ":" + min + ":" + sec,
                week=weekArr[date.getDay()];
            return {
                'currentTime':currentTime,
                "week":week,
                "day":month+'-'+day
            };
        },
        //格式化日期
        checkDate(date){
            if(date<10){
                return '0'+date;
            }else{
                return date;
            }
        },
        //创建围栏
        createRail(name,point) {
            let data = {
                'name':"'"+ name+"'",
                'points': point,
                'repeat': "Mon,Tues,Wed,Thur,Fri",
            };
            $.ajax({
                url: 'http://restapi.amap.com/v4/geofence/meta?key=1d62d5d73074e9d614c1581397b70a29',
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                success(res) {
                    console.log('围栏创建成功。。');
                    console.log(res);
                },
                error(err) {
                    console.log('创建围栏失败')
                    console.log(err);
                }
            });
        },
        //查询围栏
        reseacherRail() {
           $.get({
               url:'http://restapi.amap.com/v4/geofence/meta?key=1d62d5d73074e9d614c1581397b70a29',
               success(res){
                   console.log(res);
               },
               error(err){
                   console.log('创建围栏失败'+err);
                   Toast('创建围栏失败！！');
               }
           })
        },
        //查询定位是否在围栏中
        outOrIn() {
            var _this=this;
            let time = new Data().getTime();
            console.log('开始测试。。。。');
            let dius='';
            switch(ismobile()){//没有权限获取识别码，暂代
                case 'ad':dius='99001021626653';break;
                case 'ios':dius='359241060970941';break;
                case 'ot':Toast('仅支持Android和IOS系统');break;
            }
            //判断当前时间的课程
            let scheduleList=_this.$store.state.scheduleList;
            
            $.ajax({
                url: 'http://restapi.amap.com/v4/geofence/status?key=1d62d5d73074e9d614c1581397b70a29',
                type: 'GET',
                dataTyep: 'json',
                header: 'Access-Control-Allow-Origin:*',
                data:{
                    'diu':dius,
                    'locations':_this.lng+','+_this.lat+','+time
                },
                success(res){
                    if(res.data.fencing_event_list[0].client_status=='in'){
                        // Toast("签到成功");
                        //签到成功
                        //不同的课程为一张表，判断thisclass
                        let data={
                          'class':thisclass,
                          'number':_this.user.number,
                          'xm':_this.user.xm,
                          'time':time
                        };
                      
                        return data;
                    }else if(res.data.fencing_event_list[0].client_status=='out'){
                        // Toast('目前不在签到范围内！！');
                        return false;
                    }
                },
                error(err){
                    Toast('定位失败');
                    return fasle;
                }
            });
        },
        //判断手机型号
        ismobile() {
            var u = navigator.userAgent;
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
            var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
            if(isAndroid){
                return 'ad';
            }else if(isiOS){
                return 'ios';
            }else{
                return 'ot';
            }
        },
        //创建地理围栏
       createPoint(){
           console.log('开始创建围栏')
        //    for(let i in this.pointsArr){
        //         this.createRail(i,this.pointsArr[i]);
           
        //    }
        this.createPoint('教',this.pointsArr[1]);
       }

    },
    mounted() {
        this.init();
    },

}
</script>

<style>
#map-container {
    height: 300px;
}
</style>
