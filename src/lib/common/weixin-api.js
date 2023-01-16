import platformApi from '../../platforms/index'
export default function getWeixinApi () {
  const clientPlatform = this.context.PLATFORM
  const config = this._getConfig()
  if (!config.oauth || !config.oauth.weixin) {
    throw new Error(this.t('config-param-require', {
      param: `${clientPlatform}.weixin`
    }))
  }
  const argsRequired = ['appid', 'appsecret']
  argsRequired.forEach((item) => {
    if (!config.oauth.weixin[item]) {
      throw new Error(this.t('config-param-require', {
        param: `${clientPlatform}.weixin.${item}`
      }))
    }
  })
  const weixinApi = platformApi.initWeixin({ ...config.oauth.weixin })
  return weixinApi
}
