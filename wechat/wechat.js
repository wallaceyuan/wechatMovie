/**
 * Created by yuan on 2016/7/4.
 */
'use strict'

var sha1 = require('sha1');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var util = require('./util');


var prefix = 'https://api.weixin.qq.com/cgi-bin/';

var api = {
    accessToken:prefix+'token?grant_type=client_credential',
    upload:prefix+'media/upload?'
}


function Wechat(opts){
    var that = this;

    this.appid = opts.appID;
    this.secret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    console.log('appid',this.appid);
    this.getAccessToken()
        .then(function(data){
            try{
                data = JSON.parse(data);
            }
            catch(e){
                return that.updateAccessToken(opts)
            }
            if(that.isValidAccessToken(data)){
                return Promise.resolve(data)
            }else{
                return that.updateAccessToken(opts)
            }
        })
        .then(function(data){
            console.log('getAccessToken',data);
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;
            that.saveAccessToken(data);
        });


}
//在Wechat原型链上加方法
Wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime())
    if(now < expires_in){
        return true
    }else{
        return false
    }
}

Wechat.prototype.updateAccessToken = function(opts){
    var appID = opts.appID;
    var appSecret = opts.appSecret;
    var url = api.accessToken + '&appid=' +appID+ '&secret='+appSecret;
    console.log('updateAccessToken url',url);
    return new Promise(function(resolve,reject){
        request({url:url,json:true}).then(function(response){
            console.log('response body',response.body);
            var data = response.body;
            var now = (new Date().getTime());
            var expire_in = now + (data.expires_in -20) * 1000;
            data.expires_in = expire_in
            resolve(data);
        });
    })
}

Wechat.prototype.replay = function(){
    var content = this.body
    var message = this.weixin

    console.log('message',message);

    var xml = util.tpl(content,message);

    this.status = 200
    this.type = 'application/xml'
    this.body = xml
}

Wechat.prototype.uploadMaterial = function(type,filepath){
    var that = this;

    var form = {
        media: fs.createReadStream(filepath)
    }

    var appID = opts.appID;
    var appSecret = opts.appSecret;

    return new Promise(function(resolve,reject){
        that
            .getAccessToken()
            .then(function(data){
                var url = api.upload + '&access_token=' +data.access_token+'&type='+type;
                request({methos:"POST",formData:form,url:url,json:true}).then(function(response){
                    console.log('response body',response.body);
                    var data = response.body;
                    var now = (new Date().getTime());
                    var expire_in = now + (data.expires_in -20) * 1000;
                    data.expires_in = expire_in
                    resolve(data);
                });
            })
    })
}

module.exports = Wechat;