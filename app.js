/*
 * @Author: 赵亚鑫Deep Lane
 * @Date: 2022-01-14 22:08:05
 * @LastEditors: 赵亚鑫Deep Lane
 * @LastEditTime: 2022-05-07 08:32:44
 * @Description: 
 */
//app.js
App({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },
  onLaunch: function () {
    let that = this
    // 登录
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log(res.code)
        let openId = wx.getStorageSync('openId')
        //没有openid则获取保存本地
        wx.request({
          url: that.globalData.apiHost + '/getUserOpenId?code=' + res.code,
          success: function (res) {
            console.log(res.data.msg.openid)
            openId = res.data.msg.openid
            let session_key = res.data.msg.session_key
            wx.setStorageSync('openId', openId)
            wx.setStorageSync('session_key', session_key)
            wx.request({
              url:
                that.globalData.apiHost +
                '/login?openId=' +
                wx.getStorageSync('openId'), //登录
              header: {
                'content-type': 'application/json',
              },
              success: function (res) {
                if (res.data.code === 0) {
                }
                if (res.data.code === 1) {
                  let userInfo = {
                    openId: wx.getStorageSync('openId'),
                  }
                  wx.request({
                    url: that.globalData.apiHost + '/register', //注册
                    method: 'POST',
                    data: userInfo,
                    dataType: 'json',
                    header: {
                      'content-type': 'application/json',
                    },
                    success() {
                      wx.request({
                        url:
                          that.globalData.apiHost +
                          '/login?openId=' +
                          wx.getStorageSync('openId'), //登录
                        header: {
                          'content-type': 'application/json',
                        },
                      })
                    },
                  })
                }
              },
              fail() {
                console.log('shibai')
              },
            })
          },
        })
      },
    })
  },
  globalData: {
    userInfo: null,
    openId: null,
    apiHost: 'https://order.mmyxyz.xyz', //云端
    // apiHost: 'http://127.0.0.1:7002', //电脑本地联调
    // apiHost: "http://172.20.10.2:7002",//手机预览 电脑手机需同网段
  },
})
