import { sequelize } from '../sql.js'
let wxConfig = require('../config/wxConfig')
let cryptoMO = require('crypto') // MD5算法
let parseString = require('xml2js').parseString // xml转js对象
let rp = require('request-promise')
let moment = require('moment')
let fs = require('fs')
let path = require('path')
//*************** 统一下单签名  *********//
// 生成签名
function paysignjsapi(
  appid,
  body,
  mch_id,
  nonce_str,
  notify_url,
  openid,
  out_trade_no,
  spbill_create_ip,
  total_fee
) {
  let ret = {
    appid: appid,
    body: body,
    mch_id: mch_id,
    nonce_str: nonce_str,
    notify_url: notify_url,
    openid: openid,
    out_trade_no: out_trade_no,
    spbill_create_ip: spbill_create_ip,
    total_fee: total_fee,
    trade_type: 'JSAPI',
  }
  let str = raw(ret)
  str = str + '&key=' + wxConfig.Mch_key
  let md5Str = cryptoMO.createHash('md5').update(str).digest('hex')
  md5Str = md5Str.toUpperCase()
  return md5Str
}
function raw(args) {
  let keys = Object.keys(args)
  keys = keys.sort()
  let newArgs = {}
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key]
  })

  let str = ''
  for (let k in newArgs) {
    str += '&' + k + '=' + newArgs[k]
  }
  str = str.substr(1)
  return str
}

//获取随机字符串
function getNonceStr() {
  let time = parseInt(new Date().getTime() / 1000) + ''
  let str = Math.random().toString(36).substring(2, 6) + time
  return cryptoMO.createHash('md5').update(str).digest('hex')
}

//小程序签名
function paysignjs(appid, nonceStr, packages, signType, timeStamp) {
  let ret = {
    appId: appid,
    nonceStr: nonceStr,
    package: packages,
    signType: signType,
    timeStamp: timeStamp,
  }
  let str = raw1(ret)
  str = str + '&key=' + wxConfig.Mch_key
  return cryptoMO.createHash('md5').update(str).digest('hex')
}

function raw1(args) {
  let keys = Object.keys(args)
  keys = keys.sort()
  let newArgs = {}
  keys.forEach(function (key) {
    newArgs[key] = args[key]
  })

  let str = ''
  for (let k in newArgs) {
    str += '&' + k + '=' + newArgs[k]
  }
  str = str.substr(1)
  return str
}

//下订单
let addOrder = async (ctx, next) => {
  //接受的参数
  let crb = ctx.request.body
  //今日0点时间
  let time_s = moment().format('YYYY-MM-DD 00:00:00')
  //今日24点时间
  let time_l = moment().format('YYYY-MM-DD 23:59:59')

  //查询今日下单数
  let total = await sequelize.query(
    "select count(*) as total from `order` where `time` BETWEEN '" +
      time_s +
      "' AND '" +
      time_l +
      "'",
    {
      type: sequelize.QueryTypes.SELECT,
    }
  )
  // 生成下单号
  console.log(total)
  let totaySum = total[0].total + 1
  let cathNumber = 'C'
  if (totaySum < 9) {
    cathNumber = 'C00' + totaySum
  }
  if (totaySum < 99 && totaySum >= 9) {
    cathNumber = 'C0' + totaySum
  }
  if (totaySum < 999 && totaySum >= 99) {
    cathNumber = 'C' + totaySum
  }
  if (totaySum > 999) {
    cathNumber = totaySum
  }
  let time = moment().format('YYYY-MM-DD HH:mm:ss')
  let times = moment().format('YYYY-MM-DD HH:mm')
  let res = await sequelize.query(
    'INSERT INTO `order` (`openId`,`sumMoney`,`cupNumber`,`cartList`,`time`,`orderId`,' +
      '`cathNumber`,`model`,`appointTime`,`status`,`cutMonney`,`packages`,`cutText`,`note`) ' +
      "VALUES ('" +
      ctx.query.openid +
      "'," +
      crb.sumMonney +
      ",'" +
      crb.cupNumber +
      "','" +
      JSON.stringify(crb.cartList) +
      "','" +
      time +
      "','" +
      crb.out_trade_no +
      "','" +
      cathNumber +
      "','" +
      crb.model +
      "','" +
      crb.appointTime +
      "'," +
      "1,'" +
      crb.cutMonney +
      "','" +
      crb.packages +
      "','" +
      crb.cutText +
      "','" +
      crb.note +
      "')",
    {
      type: sequelize.QueryTypes.INSERT,
    }
  )

  for (let i = 0; i < crb.cartList.length; i++) {
    await print(
      crb.cartList[i].name,
      crb.cartList[i].enName,
      i + 1,
      crb.cartList.length,
      crb.cartList[i].detail,
      cathNumber,
      times,
      crb.cartList[i].desc
    )
  }

  //更改用户在本店的消费金额
  await sequelize.query(
    'UPDATE  `user` SET `resum`=resum+' +
      crb.sumMonney +
      " where openId='" +
      ctx.query.openid +
      "'",
    {
      type: sequelize.QueryTypes.UPDATE,
    }
  )
  setTimeout(() => {
    notify(ctx.query.openid, crb.packages, cathNumber, crb.model, 0)
  }, 1000)
  return (ctx.response.body = {
    code: 0,
    msg: {
      cathNumber: cathNumber,
      cartList: crb.cartList,
      time: time,
      orderId: crb.out_trade_no,
      sumMoney: crb.sumMonney,
    },
  })
}
//下单通知
async function notify(openid, formid, cath, type, other) {
  let tid = ''
  let data = {}
  if (other == 0) {
    tid = 'GOU79E7WZB-Hm0oQniorglJ_kMx5uFJSAnQOgpy99V8'
    data = {
      keyword1: {
        value: cath,
        color: '#173177',
      },
      keyword2: {
        value: type == 0 ? '现场点单' : '预约点单',
        color: '#173177',
      },
      keyword3: {
        value: '奈茶水峰潮饮店',
        color: '#173177',
      },
      keyword4: {
        value:
          type == 0 ? '饮品正在制作中，请稍后' : '请在预约的时间点 到店 取餐哦',
        color: '#173177',
      },
    }
  }
  if (other == 1) {
    tid = 'rPdVjLl6aaC8x8xcBuhXm2Ivh2ZDYEAtZiYfogMb9zM'
    data = {
      keyword1: {
        value: cath,
        color: '#173177',
      },
      keyword2: {
        value: '奈茶水峰潮饮店',
        color: '#173177',
      },
      keyword3: {
        value: type == 0 ? '现场点单' : '预约点单',
        color: '#173177',
      },
      keyword4: {
        value:
          type == 0
            ? '饮品已经完成，请取餐'
            : '预约的时间已超出 请及时到店取餐哦',
        color: '#173177',
      },
    }
  }

  let result = await rp(
    'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential' +
      '&appid=' +
      wxConfig.AppID +
      '&secret=' +
      wxConfig.Secret
  )
  console.log(tid)
  let access_token = JSON.parse(result).access_token
  console.log('id====', formid)
  let option = {
    method: 'POST',
    uri:
      'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' +
      access_token,
    body: JSON.stringify({
      touser: openid,
      template_id: tid,
      form_id: formid,
      data: data,
    }),
  }

  let x = await rp(option)
  console.log(x)
}

//支付
let wxPay = async (ctx, next) => {
  let param = ctx.query || ctx.params
  let openid = param.openid
  let out_trade_no = wxConfig.getWxPayOrdrID() // 商户订单号
  let timestamp = Math.round(new Date().getTime() / 1000) // 当前时间
  let returnValue = {}
  returnValue.msg = '操作成功'
  returnValue.status = '100'
  returnValue.out_trade_no = out_trade_no // 商户订单号
  // 小程序 客户端支付需要 nonceStr,timestamp,package,paySign  这四个参数
  returnValue.nonceStr = 'result.xml.nonce_str[0]' // 随机字符串
  returnValue.timestamp = timestamp.toString() // 时间戳
  returnValue.package = 'prepay_id=' // 统一下单接口返回的 prepay_id 参数值
  returnValue.paySign = paysignjs(
    wxConfig.AppID,
    returnValue.nonceStr,
    returnValue.package,
    'MD5',
    timestamp
  ) // 签名
  return (ctx.response.body = {
    code: 0,
    msg: returnValue,
  })
}

//获取我的订单 或者 预约列表

let getMyOrderList = async (ctx, next) => {
  let openid = ctx.query.openid
  let type = ctx.query.model //0 到店订单 1 预约订单

  let OrderList = await sequelize.query(
    'select `orderId`,`sumMoney`,`cupNumber`,`cartList`,`appointTime`,`time` from `order` where' +
      " model='" +
      type +
      "' and openId='" +
      openid +
      "' order by id desc",
    {
      type: sequelize.QueryTypes.SELECT,
    }
  )

  for (let i = 0; i < OrderList.length; i++) {
    OrderList[i].cartList = JSON.parse(OrderList[i].cartList)

    OrderList[i].appointTime =
      moment(OrderList[i].time).format('YYYY-MM-DD') +
      ' ' +
      OrderList[i].appointTime
  }
  return (ctx.response.body = {
    code: 0,
    data: OrderList,
  })
}

//获取订单详情
let getMyOrderDetail = async (ctx, next) => {
  let openid = ctx.query.openid
  let orderId = ctx.query.orderId //0 到店订单 1 预约订单

  let OrderDetail = await sequelize.query(
    'select * from `order` where' +
      " orderId='" +
      orderId +
      "' and openId='" +
      openid +
      "'",
    {
      type: sequelize.QueryTypes.SELECT,
    }
  )
  OrderDetail[0].time = moment(OrderDetail[0].time).format(
    'YYYY-MM-DD HH:mm:ss'
  )
  if (OrderDetail.length > 0) {
    return (ctx.response.body = {
      code: 0,
      data: OrderDetail[0],
    })
  } else {
    return (ctx.response.body = {
      code: -2,
      data: '未找到',
    })
  }
}

//打印
let printfOrder = async (ctx, next) => {
  let crb = ctx.request.body
  console.log(crb)
  for (let i = 0; i < crb.cartList.length; i++) {
    await print(
      crb.cartList[i].name,
      crb.cartList[i].enName,
      i + 1,
      crb.cartList.length,
      crb.cartList[i].detail,
      crb.cathNumber,
      crb.time
    )
  }
  return (ctx.response.body = {
    code: 0,
  })
}

function refundOrderSign(
  appid,
  mch_id,
  nonce_str,
  op_user_id,
  out_refund_no,
  out_trade_no,
  refund_fee,
  total_fee
) {
  let ret = {
    appid: appid,
    mch_id: mch_id,
    nonce_str: nonce_str,
    op_user_id: op_user_id,
    out_refund_no: out_refund_no,
    out_trade_no: out_trade_no,
    refund_fee: refund_fee,
    total_fee: total_fee,
  }
  let str = raw(ret)
  str = str + '&key=' + wxConfig.Mch_key
  let md5Str = cryptoMO.createHash('md5').update(str).digest('hex')
  md5Str = md5Str.toUpperCase()
  return md5Str
}

//退款
let backMoney = async (ctx, next) => {
  let param = ctx.query || ctx.params
  let openid = param.openid
  let out_trade_no = param.orderId

  let returnValue = {}
  returnValue.msg = '操作成功'
  returnValue.status = '100'
  returnValue.out_trade_no = out_trade_no // 商户订单号
  // 小程序 客户端支付需要 nonceStr,timestamp,package,paySign  这四个参数
  returnValue.nonceStr = result.xml.nonce_str[0] // 随机字符串
  returnValue.timestamp = timestamp.toString() // 时间戳
  returnValue.package = 'prepay_id=' // 统一下单接口返回的 prepay_id 参数值
  returnValue.paySign = paysignjs(
    wxConfig.AppID,
    returnValue.nonceStr,
    returnValue.package,
    'MD5',
    timestamp
  ) // 签名
  return (ctx.response.body = {
    code: 0,
    msg: returnValue,
  })
}

// 打印
async function print(name, enName, index, sum, detail, cathNumber, time, desc) {
  let content = ''
  if (desc) {
    content =
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '@@2<FH2><center>' +
      enName +
      '</center></FH2>' +
      '@@2<FH2><center>' +
      name +
      '(' +
      index +
      '/' +
      sum +
      ')</center></FH2>' +
      '\r' +
      '@@2<FH2><center>Order Number  ' +
      cathNumber +
      '</center></FH2>' +
      '\r' +
      '@@2<FH2><center>' +
      detail +
      '</center></FH2>' +
      '\r' +
      '@@2<center>' +
      desc +
      '</center>' +
      '@@2<center>Time Ordered: ' +
      time +
      '</center>'
  } else {
    content =
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '\r' +
      '@@2<FH2><center>' +
      enName +
      '</center></FH2>' +
      '@@2<FH2><center>' +
      name +
      '(' +
      index +
      '/' +
      sum +
      ')</center></FH2>' +
      '\r' +
      '@@2<FH2><center>Order Number  ' +
      cathNumber +
      '</center></FH2>' +
      '\r' +
      '@@2<FH2><center>' +
      detail +
      '</center></FH2>' +
      '\r' +
      '@@2<center>Time Ordered: ' +
      time +
      '</center>'
  }

  let option = {
    method: 'POST',
    uri: 'https://open-api.10ss.net/print/index',
    formData: {
      client_id: '1046493438',
      access_token: 'dd2a129ebd1f4ff2855a321ad2b210cc',
      sign: 'c38037c0b3951e95f01f815944b43e36',
      content: content,
      timestamp: '1526124538',
      id: '3F2504E0-4F89-11D3-9A0C-0305E82C3312',
      machine_code: '4004559796',
      origin_id: '2018050920444247',
    },
    json: true,
  }
  let result = await rp(option)
  console.log(result)
  return result
}

//向用户发送取餐消息通知
let catchMsg = async (ctx, next) => {
  let res = await sequelize.query(
    'select * from `order` where' + " orderId='" + ctx.query.orderId + "'",
    {
      type: sequelize.QueryTypes.SELECT,
    }
  )
  setTimeout(() => {
    notify(res[0].openId, res[0].packages, res[0].cathNumber, res[0].model, 1)
  }, 1000)
  return (ctx.response.body = {
    code: 0,
  })
}

module.exports = {
  'POST /wxPay': wxPay,
  'POST /addOrder': addOrder, //下单
  'GET /getMyOrderList': getMyOrderList, //获取我的订单
  'GET /getMyOrderDetail': getMyOrderDetail, //获取订单详情
  'POST /printfOrder': printfOrder, //打印
  'POST /backMoney': backMoney, //退款
  'GET /catchMsg': catchMsg,
}
