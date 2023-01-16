async function code2SessionWeixin (code) {
  let params = code
  if (typeof code === 'string') {
    params = {
      code
    }
  }
  try {
    const clientPlatform = params.platform || this.context.PLATFORM
    const result = await this._getWeixinApi({
      platform: clientPlatform
    })[clientPlatform === 'mp-weixin' ? 'code2Session' : 'getOauthAccessToken'](params.code)
    if (!result.openid) {
      return {
        code: 80601,
        messageValues: {
          account: '微信openid'
        }
      }
    }
    return {
      code: 0,
      msg: '',
      ...result
    }
  } catch (error) {
    console.error(error)
    return {
      code: 80602,
      messageValues: {
        account: '微信openid'
      }
    }
  }
}

export default code2SessionWeixin
