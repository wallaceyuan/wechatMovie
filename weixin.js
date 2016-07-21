/**
 * Created by yuan on 2016/7/21.
 */
exports.reply = function* (next){

    var message = this.weixin
    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){
                console.log('扫二维码进来'+message.EventKey+ ' ' + message.ticket);
            }
            this.body ='哈哈，你订阅了一个微信号\r\n' +'消息ID:' +message.MsgId
        }else if(message.Event === 'unsubscribe'){
            console.log('无情取关');
            this.body = ''
        }
    }else{

    }

    yield next
}