import platformApi from '../../platforms/index'
export default function getAlipayApi () {
  const clientPlatform = this.context.PLATFORM
  const config = this._getConfig()
  if (!config.oauth || !config.oauth.alipay) {
    throw new Error(this.t('config-param-require', {
      param: `${clientPlatform}.alipay`
    }))
  }
  const argsRequired = ['appid', 'privateKey']
  argsRequired.forEach((item) => {
    if (!config.oauth.alipay[item]) {
      throw new Error(this.t('config-param-require', {
        param: `${clientPlatform}.alipay.${item}`
      }))
    }
  })
  const alipayApi = platformApi.initAlipay({ ...config.oauth.alipay })
  return alipayApi
}
