/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var Koa = require('koa');
var path = require('path');
var util = require('./libs/util');
var wechat = require('./wechat/g');
var config = require('./config');
var reply = require('./wx/reply');


var wechat_file = path.join(__dirname ,'./config/wechat.txt');


var app = new Koa();

app.use(wechat(config.wechat,reply.reply));

app.listen(3000);

console.log('Listening');


