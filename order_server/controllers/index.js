/*
 * @Author: 赵亚鑫Deep Lane
 * @Date: 2022-01-14 22:08:05
 * @LastEditors: 赵亚鑫Deep Lane
 * @LastEditTime: 2022-05-06 20:10:33
 * @Description: 
 */
import { sequelize } from '../sql.js'
var qn = require('qn')
var rp = require('request-promise')

var moment = require('moment')
//七牛云服务器配置
var client = qn.create({
  accessKey: 'YOUR_ACCESSKEY',
  secretKey: 'YOUR_SECRETKEY',
  bucket: 'YOUR_BUCKET',
})

//获取上传图片的token
let getUpLoadToken = async (ctx, next) => {
  let token = client.uploadToken()
  return (ctx.response.body = {
    uptoken: token,
  })
}

module.exports = {
  'GET /getUpLoadToken': getUpLoadToken,
}
