/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var Koa = require('koa');
var sha1 = require('sha1');
var EventEmitter = require('events');
var util = require('util');
function Girl(name){
    this.name = name;
    EventEmitter.call(this);
}
util.inherits(Girl,EventEmitter);

var config = {
    wechat:{
        appID : 'wx0527f87ddccbfe13',
        appSecret:'ba2de824eed86e2000980b68e383d9c9',
        token:'TfxtCvw686cEtzB7o7fk'
    }
}

var app = new Koa();

app.use(function *(res,req,next){
    console.log(this.query);
});

app.listen(1234);

console.log('Listening');


