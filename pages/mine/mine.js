/*
 * @Author: 赵亚鑫Deep Lane
 * @Date: 2022-01-14 22:08:05
 * @LastEditors: 赵亚鑫Deep Lane
 * @LastEditTime: 2022-05-07 00:11:48
 * @Description:
 */
// pages/mine/mine.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    userInfo: {},
    hasUserInfo: false,
  },
  bindGetUserInfo(e) {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let hasUserInfo = JSON.parse(wx.getStorageSync('hasUserInfo'))
    let userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    if (hasUserInfo) {
      this.setData({
        hasUserInfo: true,
        userInfo: userInfo,
      })
    }
    // this.getKeyInfo()
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
        wx.setStorageSync('userInfo', JSON.stringify(res.userInfo))
        wx.setStorageSync('hasUserInfo', JSON.stringify(true))
      },
    })
  },
  about: function () {
    wx.showToast({
      title: '敬请期待！',
      duration: 500,
      mask: true,
    })
  },
  gocut: function () {
    wx.navigateTo({
      url: '../cut/cut',
    })
  },
  bitphone: function () {
    wx.makePhoneCall({
      phoneNumber: '4001118024',
    })
  },
})
