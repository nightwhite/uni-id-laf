import WxAccount from './weixin/account/index'
import QQAccount from './qq/account/index'
import AliAccount from './alipay/account/index'
import AppleAccount from './apple/account/index'

import { createApi } from '../share/index'

export default {
  initWeixin: function (options = {}) {
    options.appId = options.appid
    options.secret = options.appsecret
    return createApi(WxAccount, options)
  },
  initQQ: function (options = {}) {
    options.appId = options.appid
    options.secret = options.appsecret
    return createApi(QQAccount, options)
  },
  initAlipay: function (options = {}) {
    options.appId = options.appid
    return createApi(AliAccount, options)
  },
  initApple: function (options = {}) {
    return createApi(AppleAccount, options)
  }
}
