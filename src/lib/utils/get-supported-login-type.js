function isMobileCodeSupported (config) {
  return !!(config.service && config.service.sms && config.service.sms.smsKey)
}

function isUniverifySupport (config) {
  return !!(config.service && config.service.univerify && config.service.univerify.apiKey)
}

function isWeixinSupported (config) {
  return !!(config.oauth && config.oauth.weixin && config.oauth.weixin.appsecret)
}

function isQQSupported (config) {
  return !!(config.oauth && config.oauth.qq && config.oauth.qq.appsecret)
}

function isAppleSupported (config) {
  return !!(config.oauth && config.oauth.apple && config.oauth.apple.bundleId)
}

function isAlipaySupported (config) {
  return !!(config.oauth && config.oauth.alipay && config.oauth.alipay.privateKey)
}

const loginTypeTester = {
  'mobile-code': isMobileCodeSupported,
  univerify: isUniverifySupport,
  weixin: isWeixinSupported,
  qq: isQQSupported,
  apple: isAppleSupported,
  alipay: isAlipaySupported
}

function getSupportedLoginType ({
  appid,
  platform
} = {}) {
  if (!appid || !platform) {
    throw new Error('Parameter appid and platform is required')
  }
  const config = this._getConfig({
    appid,
    platform
  })
  const supportedLoginType = [
    'username-password',
    'mobile-password',
    'email-password'
  ]
  for (const type in loginTypeTester) {
    if (loginTypeTester[type](config)) {
      supportedLoginType.push(type)
    }
  }
  return {
    supportedLoginType
  }
}

export default getSupportedLoginType
