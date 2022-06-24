import { sequelize } from '../sql.js'
import moment from 'moment'
import WXBizDataCrypt from '../config/WXBizDataCrypt'
let wxConfig = require('../config/wxConfig')
let rp = require('request-promise')
//注册
let register = async (ctx, next) => {
  //接受的参数
  let crb = ctx.request.body
  //查重
  let isExist = await sequelize.query(
    "select `openId` from user where openId='" + crb.openId + "'",
    {
      type: sequelize.QueryTypes.SELECT,
    }
  )
  // 用户初次登录注册信息
  if (isExist.length === 0) {
    if (!crb.avatarUrl) {
      crb.avatarUrl = crb.avatarUrl
    }
    if (!crb.city) {
      crb.city = '未知'
    }
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    let res = await sequelize.query(
      'INSERT INTO `user` (`nickName`,`openId`,`avatarUrl`,`province`,`city`,`gender`,`role`,`root`,`resum`,`create_time`,`last_loginTime`) ' +
        'VALUES (' +
        "'" +
        'crb.nickName' +
        "','" +
        crb.openId +
        "','" +
        'crb.avatarUrl' +
        "','" +
        'crb.province' +
        "','" +
        'crb.city' +
        "','" +
        0 +
        "','" +
        0 +
        "','" +
        0 +
        "','" +
        0 +
        "','" +
        time +
        "','" +
        time +
        "')",
      {
        type: sequelize.QueryTypes.INSERT,
      }
    )
    return (ctx.response.body = {
      code: 0,
      msg: '注册成功',
    })
  } else {
    return (ctx.response.body = {
      code: -2,
      msg: '该用户已注册',
    })
  }
}

//登录
let login = async (ctx, next) => {
  let time = moment().format('YYYY-MM-DD HH:mm:ss')
  let res = await sequelize.query(
    "select `id` from user where openId='" + ctx.query.openId + "'",
    {
      type: sequelize.QueryTypes.SELECT,
    }
  )

  if (res.length > 0) {
    await sequelize.query(
      "UPDATE  `user` SET `last_loginTime`='" +
        time +
        "' where openId='" +
        ctx.query.openId +
        "'",
      {
        type: sequelize.QueryTypes.UPDATE,
      }
    )
    return (ctx.response.body = {
      code: 0,
      msg: '登录成功',
    })
  }
  return (ctx.response.body = {
    code: 1,
    msg: '登录失败',
  })
}

//获取openid
let getUserOpenId = async (ctx, next) => {
  //接受的参数
  if (!ctx.query.code)
    return (ctx.response.body = {
      code: -2,
      msg: '参数不完整',
    })

  let crb = ctx.request.body
  let userUniInfo = await rp(
    'https://api.weixin.qq.com/sns/jscode2session?' +
      'appid=' +
      wxConfig.AppID +
      '&secret=' +
      wxConfig.Secret +
      '&' +
      'js_code=' +
      ctx.query.code +
      '&grant_type=authorization_code',
    {
      dataType: 'json',
    }
  )
  return (ctx.response.body = {
    code: 0,
    msg: JSON.parse(userUniInfo),
  })
}
//获取用户信息
let getMyInfo = async (ctx, next) => {
  let isExist = await sequelize.query(
    "select `openId`,`phone` from user where openId='" + ctx.query.openId + "'",
    {
      type: sequelize.QueryTypes.SELECT,
    }
  )
  return (ctx.response.body = {
    code: 0,
    data: isExist,
  })
}

module.exports = {
  'POST /register': register, //新用户注册
  'GET /login': login, //用户登录
  'GET /getUserOpenId': getUserOpenId, //获取用户openid
  // "POST /bindPhone": bindPhone, //用户绑定手机号,
  'GET /getMyInfo': getMyInfo, //获取用户信息
}
