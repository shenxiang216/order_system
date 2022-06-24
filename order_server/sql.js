/*
 * @Author: 赵亚鑫Deep Lane
 * @Date: 2022-01-14 22:08:05
 * @LastEditors: 赵亚鑫Deep Lane
 * @LastEditTime: 2022-05-09 22:01:57
 * @Description: 
 */
var Sequelize = require("sequelize");
process.env.TZ = 'Asia/Shanghai';
var sequelize = new Sequelize('order_miniapp', 'order_miniapp', 'n8dCfwnswzcnZjyd',{
	host: 'localhost',
	port: '3306',
    dialect: "mysql",
    dialectOptions: {
        charset: 'utf8mb4'
    },
	pool: {
		max: 500,
		min: 0,
		idle: 10000
	},
    timezone: process.env.TZ
});


export {
	sequelize
};