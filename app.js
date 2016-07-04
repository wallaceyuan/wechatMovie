/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var Koa = require('koa');
var path = require('path');
var util = require('./libs/util');
var wechat = require('./wechat/g');

var wechat_file = path.join(__dirname ,'./config/wechat.txt');
var config = {
    wechat:{
        appID : 'wx0527f87ddccbfe13',
        appSecret:'ba2de824eed86e2000980b68e383d9c9',
        token:'TfxtCvw686cEtzB7o7fk',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file,'utf-8')
        },
        saveAccessToken:function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data)
        }
    }
}

var app = new Koa();

app.use(wechat(config.wechat));

app.listen(1234);

console.log('Listening');


