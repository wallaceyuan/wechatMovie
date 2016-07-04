/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var sha1 = require('sha1');
var Promise = require('bluebird');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');


var prefix = 'https://api.weixin.qq.com/cgi-bin/';

var api = {
    accessToken:prefix+'token?grant_type=client_credential'
}

module.exports = function(opts){
    var wechat = new Wechat(opts);

    return function *(next){
        console.log(this.query);

        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;

        var str = [token,timestamp,nonce].sort().join('');
        var sha = sha1(str);
        console.log(this.method);

        if(this.method === 'GET'){

            console.log('GET');

            if(sha == signature){
                this.body = echostr + '';
            }else{
                this.body = 'wrong';
            }
        }
        else if(this.method === 'POST'){
            console.log('post');
            if(sha != signature){
                this.body = 'wrong';
                return false
            }

            var data = yield getRawBody(this.req,{
                length:this.length,
                limit:'1mb',
                encoding:this.charset
            });

            console.log(data.toString());
        }
    }
}




