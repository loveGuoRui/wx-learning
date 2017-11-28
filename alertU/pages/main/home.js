// pages/main/home.js
var Bmob = require('../../utils/bmob.js');
var bmobUtils = require('../../utils/bmobUtils.js');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskList:[],
    unDoTaskList:[],
    time:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.timeCount()
    wx.login({
      success: function (res) {
        if (res.code) {
          Bmob.User.requestOpenId(res.code, {//获取userData(根据个人的需要，如果需要获取userData的需要在应用密钥中配置你的微信小程序AppId和AppSecret，且在你的项目中要填写你的appId)
            success: function (userData) {
              var wx_user = Bmob.Object.extend("wx_user");
              var query = new Bmob.Query(wx_user);
              query.equalTo("userId", userData.openid);
              // 查询所有数据
              query.find({
                success: function (results) {
                  if(results.length == 0){
                    self.userRegister(userData.openid)
                    app.globalData.userInfo = userData.openid;
                  }else{
                    app.globalData.userInfo = userData.openid;
                    // self.qryTasks(userData.openid)
                    // self.qryUndoTasks(userData.openid)
                  }
                  wx.redirectTo({ //跳转至未完成任务页面
                    url: 'newTask/newTask'
                  })
                },
                error: function (error) {
                  console.log("查询失败: " + error.code + " " + error.message);
                }
              });
            },
            error: function (error) {
              // Show the error message somewhere
              console.log("Error: " + error.code + " " + error.message);
            }
          });

        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },
  timeCount:function(){
    var self = this;
    var target_date = new Date("May 1,2017 00:00:00").getTime(); // set the countdown date

    var days, hours, minutes, seconds; // variables for time units


    getCountdown();

    setInterval(function () { getCountdown(); }, 1000);

    function getCountdown() {

      // find the amount of "seconds" between now and target
      var current_date = new Date().getTime();
      var seconds_left = (current_date - target_date ) / 1000;

      days = pad(parseInt(seconds_left / 86400));
      seconds_left = seconds_left % 86400;

      hours = pad(parseInt(seconds_left / 3600));
      seconds_left = seconds_left % 3600;

      minutes = pad(parseInt(seconds_left / 60));
      seconds = pad(parseInt(seconds_left % 60));

      // format countdown string + set tag value
      self.setData({
        time: days + "天" + hours + "时" + minutes + "分" + seconds +"秒"
      })
      
    }

    function pad(n) {
      return (n < 10 ? '0' : '') + n;
    }
  },
  
  userRegister:function(e){
    var Bmob_wx_user = Bmob.Object.extend("wx_user");
    var wx_user = new Bmob_wx_user();
    wx_user.set("userId", e);
    //添加数据，第一个入口参数是null
    wx_user.save(null, {
      success: function (result) {
        // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
        console.log("用户创建成功, objectId:" + result.id);
      },
      error: function (result, error) {
        // 添加失败
        console.log('用户日记失败');

      }
    });
  },
  qryTasks:function(e){//查询所有已完成的任务
    var self = this;
    var date = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1)  //当前日期24点   
    // date.setDate(date.getDate() - 1) // pre day

    var Task = Bmob.Object.extend("wx_task");
    var query = new Bmob.Query(Task);
    query.equalTo("userId", e);
    query.lessThan("createtime", date);
    query.equalTo("status", "1"); // 1 是已完成的
    query.descending("rank");
    query.descending("createtime");
    //qry today
    query.find({
      success: function (results) {
          // self.addTask({end:new Date(),content:"test"},e)
      if(results.length > 0){
        for(var index in results){
          results[index] = results[index].attributes
        }
      }
      app.globalData.taskList = results;
      self.setData({
        taskList: app.globalData.taskList
      })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },
  qryUndoTasks: function (e) {//查询所有未完成的任务
    var self = this;
    var date = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1)
    // date.setDate(date.getDate() - 1) // pre day

    var Task = Bmob.Object.extend("wx_task");
    var query = new Bmob.Query(Task);
    query.equalTo("userId", e);
    query.equalTo("status", "0"); // 0 是未完成的
    query.lessThan("createtime", date);
    query.descending("rank");
    query.descending("createtime");
    //qry today
    query.find({
      success: function (results) {
        // self.addTask({end:new Date(),content:"test"},e)
        if (results.length > 0) {
          for (var index in results) {
            results[index] = results[index].attributes
          }
        }
        app.globalData.taskList = results;
        self.setData({
          unDoTaskList: app.globalData.taskList
        })
        wx.redirectTo({ //跳转至未完成任务页面
          url: 'newTask/newTask'
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },
  addTask: function(t,e){
    var B = Bmob.Object.extend("wx_task");
    var wx_task = new B();
    wx_task.set("userId", e);
    wx_task.set("createtime",new Date());
    wx_task.set("endtime", t.end);
    wx_task.set("rank", 0);
    wx_task.set("content", t.content);
    wx_task.set("status", "0");//acting
    //添加数据，第一个入口参数是null
    wx_task.save(null, {
      success: function (result) {
        // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
        console.log("创建成功, objectId:" + result.id);
      },
      error: function (result, error) {
        // 添加失败
        console.log('失败');

      }
    });
  }
})