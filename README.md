# wechat
接受消息


var content = yield util.parseXMLAsync(data);//data to xml

<xml><ToUserName><![CDATA[gh_4e7f68d8fcc7]]></ToUserName>
<FromUserName><![CDATA[o82rWwLSOmHGWDKL4ZQA8fSceGKQ]]></FromUserName>
<CreateTime>1469170565</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[1]]></Content>
<MsgId>6310039529339247464</MsgId>
</xml>


var message = util.formatMessage(content.xml);//xml to json

{ ToUserName: 'gh_4e7f68d8fcc7',
  FromUserName: 'o82rWwLSOmHGWDKL4ZQA8fSceGKQ',
  CreateTime: '1469170565',
  MsgType: 'text',
  Content: '1',
  MsgId: '6310039529339247464' }


this.weixin = message;

yield handler.call(this,next);//weixin.reply
根据message.Event || message.MsgType 返回 this.body


wechat.replay.call(this);
//根据content message 返回对应的xml



var content = this.body
var message = this.weixin

console.log('message',message);

var xml = util.tpl(content,message);//content ——服务器返回的对应内容
                                      messgae ——微信放发来的对应用户操作信息

this.status = 200
this.type = 'application/xml'
this.body = xml

