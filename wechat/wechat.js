/**
 * Created by yuan on 2016/7/4.
 */
'use strict'

var sha1 = require('sha1');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));



var prefix = 'https://api.weixin.qq.com/cgi-bin/';

var api = {
    accessToken:prefix+'token?grant_type=client_credential'
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
    var appid = opts.appID;
    var secret = opts.appSecret;
    var url = api.accessToken + '&appid=' +appid+ '&secret='+secret;
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

module.exports = Wechat;