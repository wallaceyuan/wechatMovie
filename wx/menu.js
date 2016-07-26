/**
 * Created by yuan on 2016/7/26.
 */
'use strict'

exports.button = {
    "button":[{
        "type":"click",
        "name":"今日歌曲",
        "key":"V1001_TODAY_MUSIC"
    }, {
        "name":"菜单",
        "sub_button": [
            {
                "type": "pic_sysphoto",
                "name": "系统拍照发图",
                "key": "rselfmenu_1_0",
                "sub_button": [ ]
            },
            {
                "type": "pic_photo_or_album",
                "name": "拍照或者相册发图",
                "key": "rselfmenu_1_1",
                "sub_button": [ ]
            },
            {
                "type": "pic_weixin",
                "name": "微信相册发图",
                "key": "rselfmenu_1_2",
                "sub_button": [ ]
            }
        ]
    }, {
        "name":"菜单",
        "sub_button": [
            {
                "name": "发送位置",
                "type": "location_select",
                "key": "rselfmenu_2_0"
            },
            {
                "type": "media_id",
                "name": "图片",
                "media_id": "MEDIA_ID1"
            },
            {
                "type": "view_limited",
                "name": "图文消息",
                "media_id": "MEDIA_ID2"
            }
        ]
    }]
}
