/**
 * Created by Yuan on 2016/8/7.
 */
/**
 * Created by Yuan on 2016/8/7.
 */
'use strict'

var Wechat = require('../../wechat/wechat');
var config = require('../../config');
var util = require('../../libs/util');

exports.guess = function *(next) {
  var wechatApi = new Wechat(config.wechat);
  var data = yield wechatApi.fecthAccessToken();
  var access_token = data.access_token
  var ticketData = yield wechatApi.fecthTicket(access_token);
  var ticket = ticketData.ticket
  var url = this.href.replace(':8000', '');
  var params = util.sign(ticket, url);
  console.log('guess',params);
  yield this.render('wechat/game',params);
}

exports.find = function *(next) {
  var wechatApi = new Wechat(config.wechat);
  var data = yield wechatApi.fecthAccessToken();
  var access_token = data.access_token
  var ticketData = yield wechatApi.fecthTicket(access_token);
  var ticket = ticketData.ticket
  var url = this.href.replace(':8000', '');
  var params = util.sign(ticket, url);
  yield this.render('wechat/game',params);
}

