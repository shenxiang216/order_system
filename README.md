# 点餐系统
## 效果图
![效果图](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/wuhanxicheng/202203291038955.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205070956953.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205070959715.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205070958064.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205070958508.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205070958248.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205070959965.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205071000705.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205071000233.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205071000590.png)

![](https://cdn.jsdelivr.net/gh/shenxiang216/blog-imgs/order_system/202205071000812.png)



> 全栈点餐小程序(单店版)
> 
> [inspire](https://github.com/lpbird/xcx-single-shop)
> 
> 后台管理正在开发,完成后会更新


## 技术栈

* 小程序
* node.js
* koa
* mongodb

## 项目目录结构

```
order_server  // 服务端
...           // 小程序前端
```
## 开发环境
* windows10
* vscode（推荐使用vscode进行代码开发，用微信开发者工具进行调试页面）
* 微信开发者工具
## 迭代记录
### 2022.05.06
* 修复了域名ssl过期问题
* 修复了点餐页面左右联动时滑到最后不能正确联动问题,原因为最后的列表项高度小于当前`scroll-view`高度,导致不能正确联动，解决方案为当最后的列表项高度小于当前`scroll-view`高度时,添加一个高度为`scroll-view`-最后的列表项高度 的空元素占位

## 功能

- [x] 即时点餐
- [x] 预约点餐
- [x] 营业时间调整
- [x] 优惠券营销
- [x] 订单查询
- [x] 首页广告轮播
- [ ] 支付（无权限做）
- [ ] 后台管理端（没想好做web端还是采用跨平台框架做app端）

## 如何使用
* 本地需要有mySQL环境
* 进入order_server执行`npm i`或者`yarn`
* 修改 `app.js文件下的apiHost`为node服务地址，例如默认为`http://localhost:7002`
* 修改`wxConfig(修改本文件内容，并删除本文件名多余内容).js`下的`appiID和`appSecret`,并去除文件名中的括号部分
* 在order_server根目录执行`node app.js`
* 数据库初始数据后期给出可恢复的备份文件