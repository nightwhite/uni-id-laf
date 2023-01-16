async function code2SessionAlipay (code) {
  let params = code
  if (typeof code === 'string') {
    params = {
      code
    }
  }
  try {
    const clientPlatform = params.platform || this.context.PLATFORM
    const result = await this._getAlipayApi({
      platform: clientPlatform
    }).code2Session(params.code)
    if (!result.openid) {
      return {
        code: 80701,
        messageValues: {
          account: this.t('alipay-account')
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
      code: 80702,
      messageValues: {
        account: this.t('alipay-account')
      }
    }
  }
}

export default code2SessionAlipay
