/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var Koa = require('koa');
var path = require('path');
var app = new Koa();
var mongoose = require('mongoose')
var fs = require('fs')
var dbUrl = 'mongodb://localhost/moive'

mongoose.connect(dbUrl)
// models loading
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


var Router = require('koa-router');
var router = new Router()

var game = require('./app/controllers/game')
var wechat = require('./app/controllers/wechat')
var views = require('koa-views')

app.use(views(__dirname + '/app/views'),{
    extension:'jade'
})

router.get('/movie',game.movie)
router.get('/wx',wechat.hear)
router.post('/wx',wechat.hear)


var wx = require('./wx/index');
var menu = require('./wx/menu')
//var wechatApi = wx.getWechat();

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


