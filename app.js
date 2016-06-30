/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var Koa = require('koa');
var sha1 = require('sha1');


var config = {
    wechat:{
        appID : 'wx0527f87ddccbfe13',
        appSecret:'ba2de824eed86e2000980b68e383d9c9',
        token:'TfxtCvw686cEtzB7o7fk'
    }
}

var app = new Koa();

app.use(function *(next){
    console.log(this.query);

    var token = config.wechat.token;
    var signature = this.query.signature;
    var nonce = this.query.nonce;
    var timestamp = this.query.timestamp;
    var echostr = this.query.echostr;


    var str = [token,timestamp,nonce].sort().join('');
    var sha = sha1(str);

    if(sha == signature){
        this.body = echostr + '';
    }else{
        this.body = 'wrong';
    }
});

app.listen(1234);

console.log('Listening');


