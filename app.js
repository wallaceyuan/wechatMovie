/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var Koa = require('koa');
var path = require('path');
var crypto = require('crypto');
var util = require('./libs/util');
var wechat = require('./wechat/g');
var config = require('./config');
var wechat = require('./wechat/wechat');
var reply = require('./wx/reply');

var app = new Koa();
var ejs = require('ejs');
var heredoc = require('heredoc');
var wechat_file = path.join(__dirname ,'./config/wechat.txt');

var tpl = heredoc(function(){/*
<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>猜电影</title>
    </head>
    <body>
        <h1>根据标题猜电影</h1>
        <p id="title"></p>
        <p id="poster"></p>
        <script type="text/javascript" src="//cdn.bootcss.com/zepto/1.0rc1/zepto.min.js"></script>
        <script type="text/javascript" src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
 </body>
</html>*/
})

var createNonce = function(){
    return Math.random().toString(32).substr(2,15)
}

var createTimeStamp = function(){
    return parseInt(new Date().getTime() / 1000 , 10) + ''
}
function _sign(ticket,noncestr,timestamp,url){
    var params = [
        "jsapi_ticket="+ticket,
        "noncestr="+noncestr,
        "timestamp="+timestamp,
        "url="+url
    ]
    var str = params.sort().join("&")
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
}

function sign(ticket,url){
    var noncestr = createNonce()
    var timestamp = createTimeStamp()
    var signature = _sign(ticket,noncestr,timestamp,url)
    return {
        noncestr:noncestr,
        timestamp:timestamp,
        signature:signature
    }
}
app.use(function *(next){
    if(this.url.indexOf('/movie') > -1 ){
        var wechatApi = new wechat(config.wechat);
        var data = yield wechatApi.fecthAccessToken();
        var ticket = wechatApi.fecthTicket(data.access_token);
        var url = this.href
        var params =  sign(ticket,url);
        this.body = ejs.render(tpl,params);
        return next
    }
    yield next
});

app.use(wechat(config.wechat,reply.reply));

app.listen(3000);

console.log('Listening');


