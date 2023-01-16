async function getWeixinUserInfo ({
  accessToken,
  openid
} = {}) {
  const clientPlatform = this.context.PLATFORM
  if (clientPlatform !== 'app' && clientPlatform !== 'app-plus') {
    throw new Error(this.t('limit-client-platform'))
  }
  try {
    const result = await this._getWeixinApi().getUserInfo({
      accessToken,
      openid
    })
    return {
      code: 0,
      msg: '',
      ...result
    }
  } catch (error) {
    console.error(error)
    return {
      code: 80901
    }
  }
}

export default getWeixinUserInfo
