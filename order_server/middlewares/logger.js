/*
 * @Author: 赵亚鑫Deep Lane
 * @Date: 2022-05-09 21:49:13
 * @LastEditors: 赵亚鑫Deep Lane
 * @LastEditTime: 2022-05-09 21:52:56
 * @Description: 
 */
import dayjs from 'dayjs'
import * as crypto from 'crypto'

/**
 * 日志中间件
 * @param ctx
 * @param next
 */
export default async function (ctx, next) {
  const start = Date.now()
  await next()
  const requestId = crypto.randomBytes(6).toString('hex')
  ctx.set('X-Request-Id', requestId)
  const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const info = {
    time,
    method: ctx.method,
    url: ctx.url,
    requestId,
    ip: ctx.request.ip,
    response: Date.now() - start,
    status: ctx.status,
  }
  console.log(JSON.stringify(info))
}
