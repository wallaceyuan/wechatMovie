/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('./util');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';

var api = {
    accessToken:prefix+'token?grant_type=client_credential'
}

module.exports = function(opts,handler){
    var wechat = new Wechat(opts);
    return function *(next){
        console.log('this.query',this.query,'this.method',this.method);
        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;

        var str = [token,timestamp,nonce].sort().join('');
        var sha = sha1(str);

        var that = this;

        if(this.method === 'GET'){

            if(sha === signature){
                this.body = echostr + '';
            }else{
                this.body = 'wrong';
            }
        }
        else if(this.method === 'POST'){
            if(sha != signature){
                this.body = 'wrong';
                return false
            }else{
                //wechat.deleteMenu();
                var data = yield getRawBody(this.req,{
                    length:this.length,
                    limit:'1mb',
                    encoding:this.charset
                });
                //data <Buffer 3c 78 6d 6c 3e 3c 54 6f 55 73 65 72 4e 61 6d 65 3e 3c 21 5b 43 44 41 54 41 5b 67 68 5f 61 32 32 34 65 31 30 36 31 64 34 61 5d 5d 3e 3c 2f 54 6f 55 73 ... >
                //console.log('buffer-xml',data.toString());

                var content = yield util.parseXMLAsync(data);//xml to js

                var message = util.formatMessage(content.xml);

                this.weixin = message;
                yield handler.call(this,next);
                wechat.replay.call(this);
                //console.log('g content',content);
                //console.log('g message',message);
            }
        }
    }
}




