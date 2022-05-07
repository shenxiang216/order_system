/*
 * @Author: 赵亚鑫Deep Lane
 * @Date: 2022-01-14 22:08:05
 * @LastEditors: 赵亚鑫Deep Lane
 * @LastEditTime: 2022-05-06 20:12:40
 * @Description: 
 */
let current_path = process.cwd()
console.log(current_path)
require('runkoa')(__dirname + '/entry.js')
