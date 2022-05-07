//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    //轮播图
    imgUrls: [
      'https://image-resizer.cwg.tw/resize/uri/https%3A%2F%2Fcw1.tw%2FCW%2Fimages%2Farticle%2FC1386386999309.jpg/?w=1260&format=webp',
      'https://image-resizer.cwg.tw/resize/uri/https%3A%2F%2Fcw1.tw%2FCW%2Fimages%2Farticle%2FC1386386999309.jpg/?w=1260&format=webp',
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    time: '15:20',
    showAdStatus: false,
    showSleepStatus: false,
    showAppointStatus: false,
    adleft: '7%',
    array: [],
    reList: [],
    isiphonex: false,
    isAppoint: false,
    sleep: false,
    appointTime: '',
  },
  onLoad: function () {
    this.getShopTime()
    // this.getReduction()
    let sysinfo = wx.getSystemInfoSync().windowHeight
    if (sysinfo > 700) {
      this.setData({
        isiphonex: true,
      })
    }
  },
  //自助点单
  golist: function () {
    if (this.data.sleep) {
      this.setData({
        showSleepStatus: true,
      })
    } else {
      wx.navigateTo({
        url: '../list/list?model=0',
      })
    }
  },
  getShopTime: function () {
    let that = this
    wx.showLoading({})
    //获取我的订单
    wx.request({
      url:
        app.globalData.apiHost +
        '/getShopTime',
      method: 'GET',
      data: {},
      header: {
        Accept: 'application/json',
      },
      success: function (res) {
        let openTime = res.data.data.openTime
        let closeTime = res.data.data.closeTime
        let timeRange = []
        let d = new Date()
        let now_h = d.getHours()
        let now_m = d.getMinutes()

        //当处于9:00以前 22:00以后时
        if (now_h < openTime || now_h > closeTime - 1) {
          that.setData({
            sleep: true,
          })
          //从9点开始每隔10分钟
          for (let i = openTime; i < closeTime; i++) {
            for (let j = 0; j < 60; j = j + 10) {
              if (j == 0) {
                timeRange.push(i + ':00')
              } else {
                timeRange.push(i + ':' + j)
              }
            }
          }
        } else {
          //处于营业时间则需提前半小时

          now_m = parseInt(now_m / 10) + 3

          if (now_m > 5) {
            now_m = (now_m - 6) * 10

            now_h += 1
          } else {
            now_m = now_m * 10
          }
          for (let i = now_h; i < closeTime; i++) {
            for (let j = now_m; j < 60; j = j + 10) {
              if (j == 0) {
                timeRange.push(i + ':00')
              } else {
                timeRange.push(i + ':' + j)
              }
            }
          }
        }
        that.setData({
          array: timeRange,
        })
        wx.hideLoading()
      },
    })
  },
  goOrderlist: function () {
    wx.navigateTo({
      url: '../order/list/list',
    })
  },
  goMine: function () {
    wx.navigateTo({
      url: '../mine/mine',
    })
  },
  letAppoint: function () {
    this.setData({
      isAppoint: true,
      showAppointStatus: true,
    })
  },
  //获取可领的优惠券列表
  getReduction: function () {
    let that = this
    wx.showLoading({})
    //获取我的订单
    wx.request({
      url:
        app.globalData.apiHost +
        '/getUserCanUseReductionList?openid=' +
        wx.getStorageSync('openId'),
      method: 'GET',
      data: {},
      header: {
        Accept: 'application/json',
      },
      success: function (res) {
        let showAdStatus = false
        let len = res.data.msg.length > 2 ? 2 : res.data.msg.length
        for (let i = 0; i < len; i++) {
          if (res.data.msg[i].isR == 0) {
            showAdStatus = true
          }
        }
        that.setData({
          reList: res.data.msg,
          showAdStatus: showAdStatus,
        })
        wx.hideLoading()
      },
    })
  },
  //领取优惠券
  getCut: function (e) {
    let that = this
    let reduction = e.currentTarget.dataset.reduction

    //获取我的订单
    wx.request({
      url:
        app.globalData.apiHost +
        '/getCut?openid=' +
        wx.getStorageSync('openId') +
        '&reduction=' +
        reduction,
      method: 'GET',
      data: {},
      header: {
        Accept: 'application/json',
      },
      success: function (res) {
        wx.showToast({
          title: '领取成功',
          icon: 'succes',
          duration: 1000,
          mask: true,
        })
        that.getReduction()
      },
    })
  },

  powerDrawer: function (e) {
    let type = e.currentTarget.dataset.type
    let currentStatu = e.currentTarget.dataset.statu

    if (type == 2) {
      wx.showToast({
        title: '领取成功',
        icon: 'succes',
        duration: 1000,
        mask: true,
      })
    }

    this.util(currentStatu)
  },
  bindPickerChange: function (e) {
    this.setData({
      appointTime: this.data.array[e.detail.value],
    })
    // this.goAppoint(this.data.array[e.detail.value])
  },
  closeAP: function () {
    this.setData({
      isAppoint: false,
      showAppointStatus: false,
    })
  },
  //预约点单
  goAppoint: function (time) {
    wx.navigateTo({
      url: '../list/list?model=1&appointTime=' + this.data.appointTime,
    })
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例
    let animation = wx.createAnimation({
      duration: 200, //动画时长
      timingFunction: 'linear', //线性
      delay: 0, //0则不延迟
    })

    // 第2步：这个动画实例赋给当前的动画实例
    this.animation = animation

    // 第3步：执行第一组动画
    animation.opacity(0).rotateX(-100).step()

    // 第4步：导出动画对象赋给数据对象储存
    this.setData({
      animationData: animation.export(),
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画
    setTimeout(
      function () {
        // 执行第二组动画
        animation.opacity(1).rotateX(0).step()
        // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
        this.setData({
          animationData: animation,
        })

        //关闭
        if (currentStatu == 'close') {
          this.setData({
            showAdStatus: false,
          })
        }
        if (currentStatu == 'close2') {
          this.setData({
            showSleepStatus: false,
          })
        }
        if (currentStatu == 'close3') {
          this.setData({
            isAppoint: false,
            showAppointStatus: false,
          })
        }
      }.bind(this),
      200
    )

    // 显示
    if (currentStatu == 'open') {
      this.setData({
        showAdStatus: true,
      })
    }
  },
})
