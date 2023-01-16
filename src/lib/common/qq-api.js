import platformApi from '../../platforms/index'
export default function getQQApi () {
  const clientPlatform = this.context.PLATFORM
  const config = this._getConfig()
  if (!config.oauth || !config.oauth.qq) {
    throw new Error(this.t('config-param-require', {
      param: `${clientPlatform}.qq`
    }))
  }
  const argsRequired = ['appid', 'appsecret']
  argsRequired.forEach((item) => {
    if (!config.oauth.qq[item]) {
      throw new Error(this.t('config-param-require', {
        param: `${clientPlatform}.qq.${item}`
      }))
    }
  })
  const qqApi = platformApi.initQQ({ ...config.oauth.qq })
  return qqApi
}
