/**
 * Created by Yuan on 2016/8/7.
 */
var wechat = require('../../wechat/g');
var reply = require('../../wx/reply');
var wx = require('../../wx/index');

exports.hear = function *(next){
    this.middle = wechat(wx.wechatOptions.wechat, reply.reply)
    yield this.middle(next)
}
