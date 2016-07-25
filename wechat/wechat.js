/**
 * Created by yuan on 2016/7/4.
 */
'use strict'

var sha1 = require('sha1');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var util = require('./util');
var fs = require('fs');
var _ = require('lodash');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';

var api = {
    accessToken:prefix+'token?grant_type=client_credential',
    temporary:{
        upload:prefix+'media/upload?',
        //https://api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID
        fetch:prefix+'media/get?'
    },
    permanent:{
        //https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE
        upload:prefix+'material/add_material?',
        //https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=ACCESS_TOKEN
        uploadNews:prefix+'material/add_news?',
        //https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=ACCESS_TOKEN
        uploadNewsPic:prefix+'media/uploadimg?',
        //https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=ACCESS_TOKEN
        fetch:prefix+'material/get_material?',
        //https://api.weixin.qq.com/cgi-bin/material/del_material?access_token=ACCESS_TOKEN
        del:prefix+'material/del_material?',
        //https://api.weixin.qq.com/cgi-bin/material/update_news?access_token=ACCESS_TOKEN
        update:prefix+'material/update_news?',
        //https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=ACCESS_TOKEN
        count:prefix+'material/get_materialcount?',
        //https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=ACCESS_TOKEN
        batch:prefix+'material/batchget_material?'
    },
    tags:{
        //https://api.weixin.qq.com/cgi-bin/tags/create?access_token=ACCESS_TOKEN
        create:prefix+'tags/create?',
        //https://api.weixin.qq.com/cgi-bin/tags/get?access_token=ACCESS_TOKEN
        get:prefix+'tags/get?',
        //https://api.weixin.qq.com/cgi-bin/tags/update?access_token=ACCESS_TOKEN
        update:prefix+'tags/update?',
        //https://api.weixin.qq.com/cgi-bin/tags/delete?access_token=ACCESS_TOKEN
        del:prefix+'tags/delete?',
        //https://api.weixin.qq.com/cgi-bin/user/tag/get?access_token=ACCESS_TOKEN
        userget:prefix+'user/tag/get?',
        //https://api.weixin.qq.com/cgi-bin/tags/members/batchtagging?access_token=ACCESS_TOKEN
        batchtag:prefix+'tags/members/batchtagging?',
        //https://api.weixin.qq.com/cgi-bin/tags/members/batchuntagging?access_token=ACCESS_TOKEN
        batchuntag:prefix+'tags/members/batchuntagging?',
        //https://api.weixin.qq.com/cgi-bin/tags/getidlist?access_token=ACCESS_TOKEN
        getlist:prefix+'tags/getidlist?'
    }
}


function Wechat(opts){
    var that = this;
    this.appid = opts.appID;
    this.secret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.fecthAccessToken(opts);
}

Wechat.prototype.fecthAccessToken = function(opts){
    var that = this;
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this);
        }
    }

    this.getAccessToken()
        .then(function(data){
            try{
                data = JSON.parse(data);
            }
            catch(e){
                return that.updateAccessToken(opts)
            }
            if(that.isValidAccessToken(data)){
                return Promise.resolve(data)
            }else{
                return that.updateAccessToken(opts)
            }
        })
        .then(function(data){
            //console.log('getAccessToken',data);
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;
            that.saveAccessToken(data);
            return Promise.resolve(data);
        });
}

Wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime())
    if(now < expires_in){
        return true
    }else{
        return false
    }
}

Wechat.prototype.updateAccessToken = function(opts){
    var appID = opts.appID;
    var appSecret = opts.appSecret;
    var url = api.accessToken + '&appid=' +appID+ '&secret='+appSecret;
    console.log('updateAccessToken url',url);
    return new Promise(function(resolve,reject){
        request({url:url,json:true}).then(function(response){
            console.log('response body',response.body);
            var data = response.body;
            var now = (new Date().getTime());
            var expire_in = now + (data.expires_in -20) * 1000;
            data.expires_in = expire_in
            resolve(data);
        });
    })
}

Wechat.prototype.replay = function(){
    var content = this.body//this.body = reply
    var message = this.weixin

    console.log('message',message);

    var xml = util.tpl(content,message);

    this.status = 200
    this.type = 'application/xml'
    this.body = xml
}

Wechat.prototype.uploadMaterial = function(type,material,permanent){
    var that = this;
    var form = {};

    var uploadUrl = api.temporary.upload
    if(permanent){
        uploadUrl = api.permanent.upload
        _.extend(form,permanent);
    }
    if(type == 'pic'){
        uploadUrl = api.permanent.uploadNewsPic
    }
    if(type == 'news'){
        uploadUrl = api.permanent.uploadNews
        form = material
    }else{
        form.media = fs.createReadStream(material)
    }

    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = uploadUrl + 'access_token=' + data.access_token
                if(!permanent){
                    url += '&type=' + type
                }

                var option = {
                    "method":"POST",
                    "url":url,
                    "json":true
                }

                if(type === 'news'){
                    option.body = form
                }else{
                    option.formData = form
                }
                request(option).then(function(response){
                    var _data = response.body;
                    console.log('uploadMaterial',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('Upload material fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            })
    })
}

Wechat.prototype.fetchMaterial = function(media_id,type,permanent){
    var that = this;
    var form = {};
    var fetchUrl = api.temporary.fetch
    if(permanent){
        fetchUrl = api.permanent.fetch
    }

    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = fetchUrl + '&access_token=' + data.access_token
                var options = {
                    url:url,
                    method:"POST",
                    json:true
                }
                if(permanent){
                    form.media_id = media_id
                    form.access_token = data.access_token
                    options.body = form
                }else{
                    if(type=='video'){
                        url.replace('https://','http://')
                    }
                    url +='&media_id=' + media_id
                }
                //resolve(url)

                if( type === 'news' || type === 'video'){
                    request(options).then(function(response){
                        var _data = response.body;
                        console.log('fetchMaterial',response.body);
                        if(_data){
                            resolve(_data);
                        }else{
                            throw new Error('Upload material fails');
                        }
                    })
                    .catch(function(err){
                        reject(err);
                    });
                }else{
                    resolve(url)
                }
            })
    })
}

Wechat.prototype.deleteMaterial = function(media_id,type){
    var that = this;
    var form = {};

    var delUrl = api.permanent.del

    var form = {
        "media_id":media_id
    }
    var option = {
        "method":"POST",
        "url":url,
        "json":true,
        body:form
    }

    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = delUrl + '&access_token=' + data.access_token
                request(option).then(function(response){
                    var _data = response.body;
                    console.log('deleteMaterial',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('Upload material fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            })
    })
}

Wechat.prototype.updateMaterial = function(media_id,news){
    var that = this;
    var form = {};

    var updatelUrl = api.permanent.update

    var form = {
        "media_id":media_id
    }
    _.extend(form,news)

    var option = {
        "method":"POST",
        "url":url,
        "json":true,
        body:form
    }


    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = updatelUrl + '&access_token=' + data.access_token
                request(option).then(function(response){
                    var _data = response.body;
                    console.log('updateMaterial',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('Upload material fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            })
    })
}

Wechat.prototype.countMaterial = function(){
    var that = this;
    var countUrl = api.permanent.count

    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = countUrl + 'access_token=' + data.access_token
                var option = {
                    "method":"GET",
                    "url":url,
                    "json":true
                }
                request(option).then(function(response){
                    var _data = response.body;
                    console.log('countMaterial',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('Upload material fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            })
    })
}

Wechat.prototype.batchMaterial = function(options){
    var that = this;
    var form = {};

    var batchlUrl = api.permanent.batch
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 1
    _.extend(form,options)

    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = batchlUrl + '&access_token=' + data.access_token
                var option = {
                    "method":"POST",
                    "url":url,
                    "json":true,
                    body:form
                }
                request(option).then(function(response){
                    var _data = response.body;
                    console.log('batchMaterial',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('Upload material fails');
                    }
                })
                resolve(url)
            })
    })
}

Wechat.prototype.createTag = function(name){
    var that = this;
    var createlUrl = api.tags.create
    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = createlUrl + '&access_token=' + data.access_token
                var form = {
                    "tag" : {
                        "name" : name//标签名
                    }
                }
                request({"method":"POST","url":url,"json":true,body:form}).then(function(response){
                    var _data = response.body;
                    console.log('createTag',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('createTag fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            })
    })
}

Wechat.prototype.getTag = function(){
    var that = this;
    var getlUrl = api.tags.get
    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = getlUrl + '&access_token=' + data.access_token
                request({"url":url,"json":true}).then(function(response){
                    var _data = response.body;
                    console.log('getTag',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('getTag fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            })
    })
}

Wechat.prototype.updateTag = function(id,name){
    var that = this;
    var updateUrl = api.tags.update
    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = updateUrl + '&access_token=' + data.access_token
                var form = {
                    "tag" : {
                        "id" : id,
                        "name" : name
                    }
                }
                request({"method":"POST","url":url,"json":true,body:form}).then(function(response){
                    var _data = response.body;
                    console.log('updateTag',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('updateTag fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            })
    })
}

Wechat.prototype.delTag = function(id){
    var that = this;
    var delUrl = api.tags.del
    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = delUrl + '&access_token=' + data.access_token
                var form = {
                    "tag" : {
                        "id" : id
                    }
                }
                request({"method":"POST","url":url,"json":true,body:form}).then(function(response){
                    var _data = response.body;
                    console.log('delTag',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('delTag fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            })
    })
}

Wechat.prototype.usergetTag = function(id,openid){
    var that = this;
    var usergetUrl = api.tags.userget
    var openid = openid || ""
    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = usergetUrl + '&access_token=' + data.access_token
                var form = {
                    "tagid" : id,
                    "next_openid":openid
                }
                request({"method":"POST","url":url,"json":true,body:form}).then(function(response){
                    var _data = response.body;
                    console.log('usergetTag',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('usergetTag fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            })
    })
}

Wechat.prototype.batchtagTag = function(id,openids){
    var that = this;
    var batchtagUrl = api.tags.batchtag
    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = batchtagUrl + '&access_token=' + data.access_token
                var form = {
                    "openid_list" : openids,
                    "tagid" : id
                }
                request({"method":"POST","url":url,"json":true,body:form}).then(function(response){
                    var _data = response.body;
                    console.log('batchtagTag',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('batchtagTag fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                })
            })
    })
}

Wechat.prototype.batchuntagTag = function(id,openids){
    var that = this;
    var batchuntagUrl = api.tags.batchuntag
    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = batchuntagUrl + '&access_token=' + data.access_token
                var form = {
                    "openid_list" : openids,
                    "tagid" : id
                }
                request({"method":"POST","url":url,"json":true,body:form}).then(function(response){
                    var _data = response.body;
                    console.log('batchuntagTag',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('batchuntagTag fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                })
            })
    })
}

Wechat.prototype.getlistTag = function(openid){
    var that = this;
    var getlistUrl = api.tags.getlist
    return new Promise(function(resolve,reject){
        that
            .fecthAccessToken()
            .then(function(data){
                var url = getlistUrl + '&access_token=' + data.access_token
                var form = {
                    "openid" : openid
                }
                request({"method":"POST","url":url,"json":true,body:form}).then(function(response){
                    var _data = response.body;
                    console.log('getlistTag',response.body);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('getlistTag fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                })
            })
    })
}


module.exports = Wechat;