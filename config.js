/**
 * Created by yuan on 2016/7/21.
 */
'use strict'

var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname ,'./config/wechat.txt');
var ticket_file = path.join(__dirname ,'./config/ticket.txt');

var config = {
    wechat:{//
        appID : 'wxe539b74f1500b34f',//wx0527f87ddccbfe13//wxe539b74f1500b34f
        appSecret:'247fbdaee6f89a225345f7a56b5398b4',//ba2de824eed86e2000980b68e383d9c9//247fbdaee6f89a225345f7a56b5398b4
        token:'Wallace746cEtzB7o7fk',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file,'utf-8')
        },
        getTicket:function(){
            return util.readFileAsync(ticket_file,'utf-8')
        },
        saveAccessToken:function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data)
        },
        saveTicket:function(){
            data = JSON.stringify(data);
            return util.writeFileAsync(ticket_file,data)
        }
    }
}

module.exports = config;