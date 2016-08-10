/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var Koa = require('koa');
var path = require('path');
var mongoose = require('mongoose')
var fs = require('fs')
var session = require('koa-session')
var app = new Koa();
var User = mongoose.model('User')

// models loading
var dbUrl = 'mongodb://localhost/movie'
mongoose.connect(dbUrl)

var models_path = __dirname + '/app/models'
var walk = function(path) {
    fs
        .readdirSync(path)
        .forEach(function(file) {
            var newPath = path + '/' + file
            var stat = fs.statSync(newPath)

            if (stat.isFile()) {
                if (/(.*)\.(js|coffee)/.test(file)) {
                    require(newPath)
                }
            }
            else if (stat.isDirectory()) {
                walk(newPath)
            }
        })
}
walk(models_path)

//路由
var Router = require('koa-router');
var router = new Router()
require('./config/routes')(router)

//视图
var views = require('koa-views')
app.use(views(__dirname + '/app/views',{
    extension:'jade'
}))


/*var wx = require('./wx/index');
var menu = require('./wx/menu')
var wechatApi = wx.getWechat();*/

//session
app.keys = ['some secret hurr'];
app.use(session(app));

app.use(function *(next){
    var n = this.session.views || 0;
    this.session.views = ++n;
    this.body = n + ' views';
    var user = this.session.user
    if(user && user._id){
        this.session.user = yield User.findOne({_id:user._id}).exec()
        this.state.user = this.session.user
    }else{
        this.state.user = null
    }

    yield next
})


app
    .use(router.routes())
    .use(router.allowedMethods())






/*
 wechatApi.deleteMenu().then(function(){
 return wechatApi.createMenu(menu)
 }).then(function(msg){
 console.log(msg);
 })
 */


app.listen(3000);

console.log('Listening');


