//云开发实现支付
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
//1，引入支付的三方依赖
const tenpay = require('tenpay')
//2，配置支付信息
const config = {
  appid: 'wx7b6bd14cc7590862', //
  mchid: '1568229981', //
  partnerKey: 'wangkui0wechatdadafastruncom2019', //
  notify_url: 'https://mp.weixin.qq.com', //支付回调网址,这里可以先随意填一个网址
  spbill_create_ip: '127.0.0.1',
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let { orderid, money, des } = event
  //3，初始化支付
  const api = tenpay.init(config)

  console.log(config, orderid, 'result')

  const curTime = Date.now()
  const tradeNo = `${event.userInfo.openId.substr(-5)}-${curTime}`

  let result = await api.getPayParams({
    out_trade_no: tradeNo,
    body: des || '商品简单描述',
    total_fee: money * 100, //订单金额(分),
    openid: wxContext.OPENID, //付款用户的openid
  })

  let orderData = {
    out_trade_no: tradeNo,
    time_stamp: result.timeStamp,
    nonce_str: result.nonceStr,
    sign: result.paySign,
    sign_type: result.signType,
    body: des || '商品简单描述',
    total_fee: money * 100,
    prepay_id: result.package,
    status: 0, // 订单文档的status 0 未支付 1 已支付 2 已关闭
    _openid: wxContext.OPENID,
  }

  await db.collection('order').add({ data: orderData })

  console.log(result, 'result')

  return result
}
