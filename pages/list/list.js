// pages/list/list.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    listData: [],
    activeIndex: 0,
    toView: 'a0',
    scrollTop: 100,
    screenWidth: 667,
    showModalStatus: false,
    currentType: 0, //当前分类
    currentIndex: 0, //当前分类下序号
    sizeIndex: 0, //杯型分类序号
    sugarIndex: 0, //甜度分类序号
    temIndex: 0, //温度分类序号
    sugar: ['正常糖', '少糖', '半糖'],
    tem: ['正常冰', '少冰', '去冰'],
    size: ['常规', '珍珠', '西米露'],
    cartList: [], //购物车
    sumMonney: 0, //总金额
    cupNumber: 0, //总杯数
    scrollH: 1000,
    showCart: false, //是否显示购物车
    loading: false,
    cartMap: {}, //购物车map
    model: 0, //1是预约模式  0是到店模式
    appointTime: '',
    scrollArr: [],
    sizeBox: [],
    sizeEx: 0,
    virtualHeight: 0, //解决联动问题，处理左右联动问题
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.model == 1) {
      this.setData({
        model: 1,
        appointTime: options.appointTime,
      })
    }
    this.getList()
  },
  // 获取数据
  getList() {
    let that = this
    let sysinfo = wx.getSystemInfoSync().windowHeight
    wx.showLoading()
    let offsetS = 120
    //兼容iphone5滚动
    if (sysinfo < 550) {
      offsetS = -40
    }
    //兼容iphone Plus滚动
    if (sysinfo > 650 && sysinfo < 700) {
      offsetS = 240
    }
    wx.request({
      url: app.globalData.apiHost + '/getfoodList',
      method: 'GET',
      data: {},
      header: {
        Accept: 'application/json',
      },
      success: function (res) {
        let scrollArr = [0]
        //动态计算联动节点
        for (let i = 0; i < res.data.data.length; i++) {
          scrollArr.push(scrollArr[i] + 73 * res.data.data[i].foods.length + 18)
        }
        that.setData({
          scrollArr: scrollArr,
          listData: res.data.data,
          loading: true,
          scrollH: sysinfo * 2 - offsetS,
          virtualHeight:
            sysinfo * 2 -
            offsetS -
            36 -
            (scrollArr[scrollArr.length - 1] - scrollArr[scrollArr.length - 2]),
        })
        wx.hideLoading()
      },
    })
  },
  //触底
  bin: function () {
    this.setData({
      activeIndex: 0,
      toView: 'a0',
    })
  },
  // 左侧选择
  selectMenu: function (e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      activeIndex: index,
      toView: 'a' + index,
    })
  },
  //监听滚动 完成右到左的联动
  scroll: function (e) {
    let dis = e.detail.scrollTop
    console.log(dis)
    if (dis < 1) {
      this.setData({
        activeIndex: 0,
      })
      return
    }
    for (let i = 0; i < this.data.scrollArr.length; i++) {
      if (dis >= this.data.scrollArr[i] && dis < this.data.scrollArr[i + 1]) {
        this.setData({
          activeIndex: i,
        })
        break
      }
    }
  },
  selectInfo: function (e) {
    let type = e.currentTarget.dataset.type
    let index = e.currentTarget.dataset.index
    let a = this.data
    let tem = a.listData[type].foods[index].tem
    let temBox = []
    for (let i = 0; i < tem.length; i++) {
      temBox.push(tem[i].specs)
    }
    this.setData({
      showModalStatus: !this.data.showModalStatus,
      currentType: type,
      currentIndex: index,
      sizeBox: ['常规'],
      sizeEx: 0,
      sugarIndex: 0,
      temIndex: 0,
      tem: temBox,
    })
  },
  closeModal: function () {
    this.setData({
      showModalStatus: false,
    })
  },
  chooseSE: function (e) {
    let a = this.data.listData
    let index = e.currentTarget.dataset.index
    let type = e.currentTarget.dataset.type
    if (type == 0) {
      let item = a[this.data.currentType].foods[this.data.currentIndex].size
      let sizeBox = this.data.sizeBox
      let sizeEx = this.data.sizeEx
      if (item[index].packing_fee == 0) {
        item[index].packing_fee = 1
        sizeBox.push(item[index].specs)
        sizeEx += item[index].price
      } else {
        item[index].packing_fee = 0
        for (let i = 0; i < sizeBox.length; i++) {
          if (sizeBox[i] == item[index].specs) {
            sizeBox.splice(i, 1)
            sizeEx -= item[index].price
          }
        }
      }
      this.setData({
        listData: a,
        sizeBox: sizeBox,
        sizeEx: sizeEx,
      })
    }
    if (type == 1) {
      this.setData({
        sugarIndex: index,
      })
    }
    if (type == 2) {
      this.setData({
        temIndex: index,
      })
    }
  },
  //查看是否添加过相同规格的商品
  isSameAdd: function () {
    let a = this.data
    let name = a.listData[a.currentType].foods[a.currentIndex].name
    let detail =
      a.size[a.sizeIndex] +
      ',+' +
      a.sugar[a.sugarIndex] +
      '+' +
      a.tem[a.temIndex]
    let cartList = this.data.cartList
    for (let i = 0; i < cartList.length; i++) {
      if (name == cartList[i].name && detail == cartList[i].detail) {
        return i
      }
    }
  },
  //加入购物车
  addToCart: function () {
    let a = this.data
    let listData = a.listData
    let cartList = this.data.cartList
    if (this.isSameAdd() != undefined) {
      console.log('添加过')
      cartList[this.isSameAdd()].number += 1
    } else {
      console.log('没加过')
      let detail = ''
      for (let i = 0; i < a.sizeBox.length; i++) {
        detail += a.sizeBox[i] + ','
      }
      let addItem = {
        cType: a.currentType,
        cIndex: a.currentIndex,
        name: a.listData[a.currentType].foods[a.currentIndex].name,
        price: a.listData[a.currentType].foods[a.currentIndex].price + a.sizeEx,
        enName: a.listData[a.currentType].foods[a.currentIndex].enName,
        detail: detail + '+' + a.sugar[a.sugarIndex] + '+' + a.tem[a.temIndex],
        number: 1,
        sum: a.listData[a.currentType].foods[a.currentIndex].price + a.sizeEx,
        img:
          a.currentType +
          1 +
          '-' +
          a.listData[a.currentType].foods[a.currentIndex].img,
        desc: a.listData[a.currentType].foods[a.currentIndex].desc,
      }
      cartList.push(addItem)
    }

    //刷新总金额
    let sumMonney =
      a.sumMonney +
      a.listData[a.currentType].foods[a.currentIndex].price +
      a.sizeEx
    //刷新单品杯数
    listData[a.currentType].foods[a.currentIndex].num += 1
    this.setData({
      cartList: cartList,
      showModalStatus: false,
      sumMonney: sumMonney,
      cupNumber: a.cupNumber + 1,
      listData: listData,
    })
  },
  showCartList: function () {
    if (this.data.cartList.length != 0) {
      this.setData({
        showCart: !this.data.showCart,
      })
    }
  },
  clearCartList: function () {
    this.data.listData.forEach((element) => {
      element.foods.forEach((e) => {
        e.num = 0
      })
    })

    this.setData({
      cartList: [],
      showCart: false,
      sumMonney: 0,
      cupNumber: 0,
      listData: this.data.listData,
    })
  },
  addNumber: function (e) {
    let index = e.currentTarget.dataset.index
    let cartList = this.data.cartList
    let listData = this.data.listData
    listData[cartList[index].cType].foods[cartList[index].cIndex].num =
      listData[cartList[index].cType].foods[cartList[index].cIndex].num + 1
    cartList[index].number++
    let sum = this.data.sumMonney + cartList[index].price
    cartList[index].sum += cartList[index].price
    this.setData({
      listData: listData,
      cartList: cartList,
      sumMonney: sum,
      cupNumber: this.data.cupNumber + 1,
    })
  },
  decNumber: function (e) {
    let index = e.currentTarget.dataset.index

    let cartList = this.data.cartList
    let listData = this.data.listData
    listData[cartList[index].cType].foods[cartList[index].cIndex].num =
      listData[cartList[index].cType].foods[cartList[index].cIndex].num - 1
    let sum = this.data.sumMonney - cartList[index].price
    cartList[index].sum -= cartList[index].price
    cartList[index].number == 1
      ? cartList.splice(index, 1)
      : cartList[index].number--
    this.setData({
      listData: listData,
      cartList: cartList,
      sumMonney: sum,
      showCart: cartList.length == 0 ? false : true,
      cupNumber: this.data.cupNumber - 1,
    })
  },
  goBalance: function () {
    if (this.data.sumMonney != 0) {
      wx.setStorageSync('cartList', this.data.cartList)
      wx.setStorageSync('sumMonney', this.data.sumMonney)
      wx.setStorageSync('cupNumber', this.data.cupNumber)
      wx.navigateTo({
        url:
          '../order/balance/balance?model=' +
          this.data.model +
          '&appointTime=' +
          this.data.appointTime,
      })
    }
  },
  //提示
  notice: function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: '因含有规格，请在购物车内删减',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          that.setData({
            showCart: true,
          })
        }
      },
    })
  },
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
})
