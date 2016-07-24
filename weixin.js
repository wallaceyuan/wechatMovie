/**
 * Created by yuan on 2016/7/21.
 */

var config = require('./config');
var Wechat = require('./wechat/wechat');
var wechatApi = new Wechat(config.wechat);

exports.reply = function* (next){

    var message = this.weixin
    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){
                console.log('扫二维码进来'+message.EventKey+ ' ' + message.ticket);
            }
            this.body ='哈哈，你订阅了一个微信号\r\n'/* +'消息ID:' +message.MsgId*/
        }else if(message.Event === 'unsubscribe'){
            console.log('无情取关');
            this.body = '无情取关'
        }else if(message.Event === 'LOCATION'){
            this.body = '您上报的位置是：'+message.Latitude+' '+message.Longitude+' '+message.Precision;
        }else if(message.Event === 'CLICK'){
            this.body = '您点击了菜单：'+message.EventKey ;
        }else if(message.Event === 'SCAN'){
            console.log('关注后扫二维码：'+message.EventKey+' '+message.Ticket);
            this.body = '看到你扫了一下哦';
        }else if(message.Event === 'VIEW'){
            this.body = '您点急了菜单中的链接：'+message.EventKey;
        }
    }else if(message.MsgType === 'text'){
        var content = message.Content;
        var reply = '您说的:'+message.Content+ ' 太复杂了';
        if(content === '1'){
            reply = '天下第一';
        }else if(content === '2'){
            reply = '天下第二';
        }else if(content === '3'){
            reply = '天下第三';
        }else if(content === '4'){
            reply = [{
                title:'技术改变世界',
                description:'只是个描述',
                picUrl:'http://c.hiphotos.baidu.com/zhidao/pic/item/faf2b2119313b07e6077d3bc0ad7912396dd8cb8.jpg',
                url:'http://www.kankanews.com/a/2016-07-22/0037614649.shtml'
            },{
                title:'nodeJS开发微信',
                description:'爽到爆',
                picUrl:'http://static.statickksmg.com/image/2016/07/19/1de39cf02f732fad41948998f681f40a.jpg',
                url:'http://www.kankanews.com/a/2016-07-19/0037610359.shtml'
            }]
        }else if(content == '5'){
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/vendor/2.jpg');
            reply = {
                "type":'image',
                "mediaId":data.media_id
            }
        }else if(content == '6'){
            var data = yield wechatApi.uploadMaterial('video', __dirname + '/vendor/2.mp4');
            reply = {
                "type":'video',
                "mediaId":data.media_id,
                "title":'普京粉丝团',
                "description":"开会的时候…梅德韦杰夫的iPad音乐响了…这就有点尴尬了……"
            }
        }else if(content == '7'){
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/vendor/2.jpg');
            reply = {
                "type":'music',
                "title":'One For Da Money',
                "description":"听歌放松一下",
                "musicUrl":"http://45.124.125.100/m10.music.126.net/20160724173857/a9007e16a5e12aa5fd08659dd925239a/ymusic/4c3a/5d58/c137/08eccadceb8626dcbf43b2afd4bcb41f.mp3",
                "thumbMediaId":data.media_id
            }
        }else if(content == '8'){
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/vendor/2.jpg',{"type":'image'});
            reply = {
                "type":'image',
                "mediaId":data.media_id
            }
        }else if(content == '9'){
            var data = yield wechatApi.uploadMaterial('video', __dirname + '/vendor/2.mp4',{"type":'video', "description":'{"title":"普京粉丝团", "introduction":"开会的时候…梅德韦杰夫的iPad音乐响了…这就有点尴尬了……"}'});
            reply = {
                "type":'video',
                "mediaId":data.media_id,
                "title":'普京粉丝团',
                "description":"开会的时候…梅德韦杰夫的iPad音乐响了…这就有点尴尬了……"
            }
        }else if(content == '10'){
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/vendor/2.jpg',{"type":'music'});
            reply = {
                "type":'music',
                "title":'One For Da Money',
                "description":"听歌放松一下",
                "musicUrl":"http://45.124.125.100/m10.music.126.net/20160724173857/a9007e16a5e12aa5fd08659dd925239a/ymusic/4c3a/5d58/c137/08eccadceb8626dcbf43b2afd4bcb41f.mp3",
                "thumbMediaId":data.media_id
            }
        }
        this.body = reply;
    }

    yield next
}