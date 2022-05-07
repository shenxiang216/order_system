// pages/order/list/list.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabIndex: 0,
    orderList: [1],
    opList: [1],
    listData: [],
    appointlist: [],
  },
  onShow: function () {
    this.getMyOrder()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  //获取我的订单
  getMyOrder: function () {
    wx.showLoading()
    let that = this
    //获取我的订单
    wx.request({
      url:
        app.globalData.apiHost +
        '/getMyOrderList?openid=' +
        wx.getStorageSync('openId') +
        '&model=0',
      method: 'GET',
      data: {},
      header: {
        Accept: 'application/json',
      },
      success: function (res) {
        wx.hideLoading()

        that.setData({
          listData: res.data.data,
          loading: true,
        })
      },
    })
  },

  getMyAppoint: function () {
    wx.showLoading()
    let that = this
    //获取我的预约
    wx.request({
      url:
        app.globalData.apiHost +
        '/getMyOrderList?openid=' +
        wx.getStorageSync('openId') +
        '&model=1',
      method: 'GET',
      data: {},
      header: {
        Accept: 'application/json',
      },
      success: function (res) {
        wx.hideLoading()

        that.setData({
          listData: res.data.data,
          loading: true,
        })
      },
    })
  },
  changeTab: function (e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      tabIndex: index,
    })
    if (index == 0) {
      this.getMyOrder()
    } else {
      this.getMyAppoint()
    }
  },
  golist: function () {
    wx.navigateTo({
      url: '../../list/list?model=0',
    })
  },
  goAppoint: function () {
    wx.navigateTo({
      url: '../../appoint/appoint',
    })
  },
  //进入详情
  goDetail(e) {
    let orderId = e.currentTarget.dataset.orderid
    wx.navigateTo({
      url: '../detail/detail?orderId=' + orderId,
    })
  },
  call(e) {
    wx.sendSocketMessage({
      data: JSON.stringify({
        nu: e.target.dataset.nu,
        type: 'call',
      }),
    })
  },
})
