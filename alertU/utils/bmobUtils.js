var Bmob = require('bmob.js');

const app = getApp();

 function userRegister(e) { //用户注册
  var Bmob_wx_user = Bmob.Object.extend("wx_user");
  var wx_user = new Bmob_wx_user();
  wx_user.set("userId", e);
  //添加数据，第一个入口参数是null
  wx_user.save(null, {
    success: function (result) {
      // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
      console.log("用户创建成功, objectId:" + result.id);

      app.globalData.userInfo = result
    },
    error: function (result, error) {
      // 添加失败
      console.log('用户日记失败');
    }
  });
}


function qryTasks(e) {//查询所有已完成的任务
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
      if (results.length > 0) {
        for (var index in results) {
          results[index] = results[index].attributes
        }
      }
      app.globalData.taskList = results
      console.log(results)
      
    },
    error: function (error) {
      console.log("查询失败: " + error.code + " " + error.message);
    }
  }).then(function(res){
    return res;
  });
  
}


function qryUndoTasks(e) {//查询所有未完成的任务
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
      app.globalData.unDoTaskList = results
      console.log("undo",results)
    },
    error: function (error) {
      console.log("查询失败: " + error.code + " " + error.message);
      return null;
    }
  });
}


module.exports = {
  userRegister: userRegister,
  qryTasks: qryTasks,
  qryUndoTasks: qryUndoTasks

}
