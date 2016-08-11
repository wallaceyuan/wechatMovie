/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var Koa = require('koa');
var fs = require('fs')
var app = new Koa();
var path = require('path');
var session = require('koa-session')
var mongoose = require('mongoose')
var bodyParser = require('koa-bodyparser');
var views = require('koa-views')
var Router = require('koa-router');
var router = new Router()

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


//视图
var User = mongoose.model('User')

app.use(views(__dirname + '/app/views',{
    extension:'jade'
}))


//session
app.keys = ['some secret hurr'];
app.use(session(app));
app.use(bodyParser());

app.use(function *(next){
    var user = this.session.user
    if(user && user._id){
        this.session.user = yield User.findOne({_id:user._id}).exec()
        this.state.user = this.session.user
    }else{
        this.state.user = null
    }

    yield next
})

require('./config/routes')(router)

app
    .use(router.routes())
    .use(router.allowedMethods())

app.listen(3000);

console.log('Listening');


