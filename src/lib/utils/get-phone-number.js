const provider = 'univerify'
/**
 * @param {Object} params
 *
 * 在config中配置
 * @param {String} appid        应用的appid
 * @param {String} apiKey       一键登录控制台的apiKey
 * @param {String} apiSecret    一键登录控制台的apiSecret
 * uni.login返回
 * @param {String} access_token  uni.login返回的access_token
 * @param {String} openid       uni.login返回的openid
 */
async function getPhoneNumber (params) {
  const paramRequired = ['apiKey', 'apiSecret']
  for (let i = 0, len = paramRequired.length; i < len; i++) {
    const paramName = paramRequired[i]
    if (!params[paramName]) {
      throw new Error(this.t('config-param-requred', {
        param: `service.univerify.${paramName}`
      }))
    }
  }
  if (!(params.openid && params.access_token)) {
    throw new Error(this.t('config-param-requred', {
      param: 'openid, access_token'
    }))
  }
  const res = await uniCloud.getPhoneNumber({
    provider,
    ...params
  })

  return getPhoneNumberError(res)
}

/**
   * getPhoneNumber错误处理
   */
function getPhoneNumberError (res, t) {
  const ErrorCollection = {
    0: '',
    4000: '缺失参数',
    4001: 'apiKey不存在',
    4002: 'sign校验不通过',
    4003: 'appid不存在',
    4004: '应用未开通一键登录服务',
    4005: '应用开通的一键登录服务正在审核中',
    4006: '服务空间不在白名单中',
    4100: '账户余额不足',
    5000: '获取手机号失败，请稍后重试(或其他未知错误)'
  }

  return {
    ...res,
    msg: ErrorCollection[res.code]
      ? `[getPhoneNumber] 获取手机号: ${ErrorCollection[res.code]}`
      : res.errMsg
  }
}

export {
  getPhoneNumber
}
