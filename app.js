/**
 * Created by Yuan on 2016/6/28.
 */
'use strict'

var Koa = require('koa');
var path = require('path');
var crypto = require('crypto');
var util = require('./libs/util');
var wechat = require('./wechat/g');
var config = require('./config');
var Wechat = require('./wechat/wechat');
var reply = require('./wx/reply');

var app = new Koa();
var ejs = require('ejs');
var heredoc = require('heredoc');
var wechat_file = path.join(__dirname ,'./config/wechat.txt');

var tpl = heredoc(function(){/*
<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>猜电影</title>
    </head>
    <body>
        <h1>根据标题猜电影</h1>
        <p id="title"></p>
        <div id="directors"></div>
        <div id="year"></div>
        <div id="poster"></div>
        <script type="text/javascript" src="//cdn.bootcss.com/zepto/1.0rc1/zepto.min.js"></script>
        <script type="text/javascript" src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
    <script>
        wx.config({
            debug: false,
            appId: 'wxe539b74f1500b34f',
            timestamp: '<%= timestamp %>',
            nonceStr: '<%= noncestr %>',
            signature: '<%= signature %>',
            jsApiList: [
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone',
                'translateVoice',
                'startRecord',
                'stopRecord',
                'onVoiceRecordEnd',
                'previewImage'
            ]
        });
        wx.ready(function(){
            wx.checkJsApi({
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'translateVoice',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'previewImage'
                ],
                success: function(res) {
                    console.log(res);
                    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                }
            });


            var shareContent = {
                title: '',
                desc: '',
                link: '',
                imgUrl: '',
                type: '', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    alert('分享成功')
                },
                cancel: function () {
                    alert('分享失败')
                }
            }
            wx.onMenuShareAppMessage(shareContent)
            wx.onMenuShareTimeline(shareContent)
            var isRecording = false
            var slide
            $('#poster').on('tap',function(){
                wx.previewImage(slide);
            });
            $('h1').on('tap',function(){
                if(!isRecording){
                     isRecording = true;
                     wx.startRecord({
                         cancel:function(){
                            alert('那就不搜了哦');
                         }
                     });
                    return
                }
                 isRecording = false;
                 wx.stopRecord({
                     success: function (res) {
                        var localId = res.localId;
                         wx.translateVoice({
                             localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                             isShowProgressTips: 1, // 默认为1，显示进度提示
                             success: function (res) {
                                var result = res.translateResult
                                $.ajax({
                                    type:'get',
                                    url:'https://api.douban.com/v2/movie/search?q='+result,
                                    dataType:'jsonp',
                                    jsonp:'callback',
                                    success:function(data){
                                        var subject = data.subjects[0]
                                        $('#year').html(subject.year)
                                        $('#title').html(subject.title)
                                        $('#directors').html(subject.directors.name)
                                        $('#poster').html('<img src="'+data.subjects[0].images.large+'" />');
                                        shareContent.title = subject.title
                                        shareContent.desc = '我搜出来了'+subject.title
                                        shareContent.link = 'http://wt8drrzc8w.proxy.qqbrowser.cc/movie'
                                        shareContent.imgUrl = data.subjects[0].images.small
                                        shareContent.type = 'link'
                                        slide = {
                                            current: data.subjects[0].images.small,
                                            urls: [data.subjects[0].images.small]
                                        }
                                        data.subjects.forEach(function(item){
                                            slide.urls.push(item.images.large)
                                        })
                                    }
                                })
                            }
                        });
                    }
                 });
            });

        });
    </script>
 </body>
</html>*/
})

var createNonce = function(){
    return Math.random().toString(32).substr(2,15)
}

var createTimeStamp = function(){
    return parseInt(new Date().getTime() / 1000 , 10) + ''
}
function _sign(ticket,noncestr,timestamp,url){
    var params = [
        "jsapi_ticket="+ticket,
        "noncestr="+noncestr,
        "timestamp="+timestamp,
        "url="+url
    ]
    var str = params.sort().join("&")
    //jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg&noncestr=Wm3WZYTPz0wzccnW&timestamp=1414587457&url=http://mp.weixin.qq.com?params=value
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
}

function sign(ticket,url){
    var noncestr = createNonce()
    var timestamp = createTimeStamp()
    var signature = _sign(ticket,noncestr,timestamp,url)
    return {
        noncestr:noncestr,
        timestamp:timestamp,
        signature:signature
    }
}
app.use(function *(next){
    if(this.url.indexOf('/movie') > -1 ){
        var wechatApi = new Wechat(config.wechat);
        var data = yield wechatApi.fecthAccessToken();
        var access_token = data.access_token
        var ticketData = yield  wechatApi.fecthTicket(access_token);
        var ticket = ticketData.ticket
        var url = this.href.replace(':8000','');
        var params =  sign(ticket,url);
        this.body = ejs.render(tpl,params);
        return next
    }
    yield next
});

app.use(wechat(config.wechat,reply.reply));

app.listen(3000);

console.log('Listening');


