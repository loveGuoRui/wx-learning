// pages/main/newTask/newTask.js
var Bmob = require('../../../utils/bmob.js');
const app = getApp();
var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";
var flag_hd = true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    unDoTaskList:[],
    am_leftbox:{},
    isLeft:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData)
    this.qryUndoTasks(app.globalData.userInfo);
  },
  onShow:function(){
    flag_hd = true;    //重新进入页面之后，可以再次执行滑动切换页面代码
    clearInterval(interval); // 清除setInterval
    time = 0;
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
            results[index].attributes.id = results[index].id;
            results[index] = results[index].attributes
          }
        }
        self.setData({
          unDoTaskList: results
        })
        app.globalData.unDoTaskList = results;
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },
  addTask: function (t, e) {
    var B = Bmob.Object.extend("wx_task");
    var wx_task = new B();
    wx_task.set("userId", e);
    wx_task.set("createtime", new Date());
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
  },
  showOpt: function(e){
    var index = e.currentTarget.id;
    var item = e.currentTarget.dataset.item;
    var list = this.data.unDoTaskList;
    for(var i in list){
      list[i].showOpt =false;
    }
    list[index].showOpt = true;
    this.setData({
      unDoTaskList:list
    })
  },
  cancel:function(e){
    var index = e.currentTarget.id;
    var item = e.currentTarget.dataset.item;
    var list = this.data.unDoTaskList;
    list[index].showOpt = false;
    this.setData({
      unDoTaskList: list
    })
  },
  // 触摸开始事件
  touchStart: function (e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点
    // 使用js计时器记录时间    
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  touchEnd: function (e) {
    var screenW = null;
    wx.getSystemInfo({
      success: function (res) {
        screenW = res.windowWidth;
      }
    })
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })

    var touchMove = e.changedTouches[0].pageX;
    // 向左滑动   
    if (touchMove - touchDot <= -70 && time < 10 && flag_hd == true) {
      // flag_hd = false;
      //执行切换页面的方法
      console.log("向左滑动");
      animation.width(screenW * 0.05).step();
      this.setData({
        am_leftbox: animation.export(),
        isLeft: false
      })
    }
    // 向右滑动   
    if (touchMove - touchDot >= 70 && time < 10 && flag_hd == true) {
      // flag_hd = false;
      //执行切换页面的方法
      console.log("向右滑动");
      animation.width(screenW * 0.95).step();
      this.setData({
        am_leftbox: animation.export(),
        isLeft:true
      })

    }
    clearInterval(interval); // 清除setInterval
    time = 0;
  }


})