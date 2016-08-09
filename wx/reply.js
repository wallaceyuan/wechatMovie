/**
 * Created by yuan on 2016/7/21.
 */

var config = require('../config')
var Wechat = require('../wechat/wechat')
var menu = require('./menu')
var wechatApi = new Wechat(config.wechat);
var Movie = require('../app/api/movie')
/*wechatApi.deleteMenu().then(function(){
 return wechatApi.createMenu(menu)
 }).then(function(msg){
 console.log(msg);
 })*/

exports.reply = function* (next){
    var message = this.weixin
    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){
                console.log('扫二维码进来'+message.EventKey+ ' ' + message.ticket);
            }
            this.body ='哈哈，你订阅了一个微信号\r\n'+
                '回复 1-3，测试文字回复\n'+
                '回复 4，测试图文回复\n'+
                '回复 首页，回到电影首页\n'+
                '回复 微信，完成微信绑定\n'+
                '回复 游戏，进入游戏页面\n'+
                '回复 电影名字，查询相关电影\n'+
                '<a href="http://ltbho8ed41.proxy.qqbrowser.cc/movie">点击这里开始语音查电影</a>'
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
    }else if(message.MsgType === 'location'){
        this.body = '您上报的位置是：'+message.Label+' '+message.Location_X+' '+message.Location_Y;
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
        }else if(content == '11'){
            var picData = yield wechatApi.uploadMaterial('image', __dirname + '/vendor/2.jpg',{});//上传永久图片素材
            console.log('picData',picData);
            var media = {
                "articles":[{//若新增的是多图文素材，则此处应还有几段articles结构
                    "title": '图片',
                    "thumb_media_id": picData.media_id,
                    "author": 'Wallace',
                    "digest": '没有摘要',
                    "show_cover_pic": 1,
                    "content": '没有内容',
                    "content_source_url": 'http://github.com'
                },{
                    "title": '图片',
                    "thumb_media_id": picData.media_id,
                    "author": 'Wallace',
                    "digest": '没有摘要',
                    "show_cover_pic": 1,
                    "content": '没有内容',
                    "content_source_url": 'http://github.com'
                },{
                    "title": '图片',
                    "thumb_media_id": picData.media_id,
                    "author": 'Wallace',
                    "digest": '没有摘要',
                    "show_cover_pic": 1,
                    "content": '没有内容',
                    "content_source_url": 'http://github.com'
                }]
            }
            var data = yield wechatApi.uploadMaterial('news',media,{})//上传永久图文素材
            console.log('data.media_id',data);
            data = yield wechatApi.fetchMaterial(data.media_id,'news',{})//获取永久图文素材

            var items = data.news_item
            var news = []
            items.forEach(function(item){
                news.push({
                    title:item.title,
                    description:item.content,
                    picUrl:item.thumb_url,
                    url:item.url
                });
            });
            reply = news
        }else if(content == 12){
            var counts = yield wechatApi.countMaterial();
            console.log(JSON.stringify(counts));
            var result = yield [
                wechatApi.batchMaterial({
                    "type":'image',
                    "offset":0,
                    "count":10
                }),
                wechatApi.batchMaterial({
                    "type":'news',
                    "offset":0,
                    "count":10
                }),
                wechatApi.batchMaterial({
                    "type":'video',
                    "offset":0,
                    "count":10
                }),
                wechatApi.batchMaterial({
                    "type":'voice',
                    "offset":0,
                    "count":10
                })
            ]
            reply = 12;
            console.log(JSON.stringify(result));
        }else if(content == 13){
            /*            var tag = yield wechatApi.createTag('weixin2');
             var res1 = yield wechatApi.getTag();
             var res2 = yield wechatApi.updateTag(100,'weixin100');
             var res1 = yield wechatApi.getTag();
             var tag = yield wechatApi.createTag('weixintest');
             var res3 = yield wechatApi.delTag(101);
             var res1 = yield wechatApi.getTag();
             var re5 = yield wechatApi.batchtagTag(100,message.FromUserName);
             var re6 = yield wechatApi.batchtagTag(100,["oXGVcwNPgkIWx1Uxno49JXjDKzmI","oXGVcwDluAg83pBPe1g-99lSxcCE"])
             var re4 = yield wechatApi.usergetTag(100);
             var re7 = yield wechatApi.batchuntagTag(100,"oXGVcwNPgkIWx1Uxno49JXjDKzmI")*/
            var re4 = yield wechatApi.usergetTag(100);
            var re8 = yield wechatApi.getlistTag(message.FromUserName)
            reply = 'Tag Done';
        }else if(content == 14){
            /*
             var res = yield wechatApi.usermark(message.FromUserName,'me');
             */
            var res1 = yield wechatApi.userget(message.FromUserName)
            var openids = [{
                "openid": "oXGVcwDluAg83pBPe1g-99lSxcCE",
                "lang": "zh-CN"
            }, {
                "openid": "oXGVcwNPgkIWx1Uxno49JXjDKzmI",
                "lang": "zh-CN"
            }]

            var res2 = yield wechatApi.userget(openids)
            reply = 'usermark Done';
        }else if(content == 15){
            var res1 = yield wechatApi.userlist()
            var res2 = yield wechatApi.userlist('oXGVcwNPgkIWx1Uxno49JXjDKzmI')
            reply = 'userlist Done';
        }else if(content == 16){
            wechatApi.createMenu(menu)
        }else {
            var movies = yield Movie.searchByName(content)
            if(!movies || movies.length === 0){
                movies = yield Movie.searchByDouban(content)
            }
            if(movies && movies.length > 0){
                reply = []
                movies = movies.slice(0,10)

                movies.forEach( function(movie) {
                    reply.push({
                        title:movie.title,
                        description:movie.description,
                        picUrl:movie.images.large,
                        url:movie.alt
                    })
                })
            }else{
                reply = '没有查询到匹配的电影 换一个试试吧~'
            }
        }

        this.body = reply;
    }else if(message.MsgType === 'voice'){
        var voiceText = message.Recognition

        var movies = yield Movie.searchByName(voiceText)
        if(!movies || movies.length === 0){
            movies = yield Movie.searchByDouban(voiceText)
        }
        if(movies && movies.length > 0){
            reply = []
            movies = movies.slice(0,10)

            movies.forEach(function(movie) {
                reply.push({
                    title:movie.title,
                    description:movie.description,
                    picUrl:movie.poster,
                    url:'http://7d332322.ngrok.io/wx/'+movie._id
                })
            })
        }else{
            reply = '没有查询到匹配的电影 换一个试试吧~'
        }
        this.body = reply;
    }
    yield next
}