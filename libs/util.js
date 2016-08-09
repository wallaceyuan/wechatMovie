/**
 * Created by yuan on 2016/7/4.
 */
'use strict'

var fs = require('fs');
var Promise = require('bluebird');
var crypto = require('crypto');


exports.readFileAsync = function(fpath ,encode){
    console.log(fpath ,encode);
    return new Promise(function(resolve,reject){
        fs.readFile(fpath, encode,function(err,content){
            if(err) reject(err)
            else resolve(content)
        });
    });
}

exports.writeFileAsync = function(fpath ,content){
    return new Promise(function(resolve,reject){
        fs.writeFile(fpath, content,function(err,content){
            if(err) reject(err)
            else resolve()
        });
    });
}



var createNonce = function() {
    return Math.random().toString(32).substr(2, 15)
}

var createTimeStamp = function() {
    return parseInt(new Date().getTime() / 1000, 10) + ''
}

function _sign(ticket, noncestr, timestamp, url) {
    var params = [
        "jsapi_ticket=" + ticket,
        "noncestr=" + noncestr,
        "timestamp=" + timestamp,
        "url=" + url
    ]
    var str = params.sort().join("&")
    //jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg&noncestr=Wm3WZYTPz0wzccnW&timestamp=1414587457&url=http://mp.weixin.qq.com?params=value
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
}

exports.sign = function(ticket, url) {
    var noncestr = createNonce()
    var timestamp = createTimeStamp()
    var signature = _sign(ticket, noncestr, timestamp, url)
    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    }
}

