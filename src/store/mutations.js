export default{
    changeTitle(state,title){
        state.title=title;
    },
    setScheduleList(state,scheduleList){
        state.scheduleList=scheduleList;
    },
    changeShowH(state,showH){
        state.showH=showH;
    },
    changeUser(state,user){
        state.user=user;
    },
    whoIs(state,who){
        state.who=who;
    },
    inOut(state,inOut){
        state.inOut=inOut;
    },
    setWeek(state,week){
        state.week=week;
    },
    setTeacherScheduleList(state,scheduleList){
        state.teacherScheduleList=scheduleList;
    }
  
}