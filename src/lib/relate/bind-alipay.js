import {
  userCollection
} from '../utils/config'

async function bindAlipay ({
  uid,
  code,
  platform
}) {
  const clientPlatform = platform || this.context.PLATFORM
  const {
    openid
  } = await this._getAlipayApi({
    platform: clientPlatform
  }).code2Session(code)
  if (!openid) {
    return {
      code: 60401,
      messageValues: {
        account: this.t('alipay-account')
      }
    }
  }
  let userList = await userCollection.where({
    ali_openid: openid
  }).get()
  userList = this._getCurrentAppUser(userList.data)
  // openid已注册
  if (userList && userList.length > 0) {
    return {
      code: 60402,
      messageValues: {
        type: this.t('alipay-account')
      }
    }
  }
  await userCollection.doc(uid).update({
    ali_openid: openid
  })
  return {
    code: 0,
    openid,
    msg: ''
  }
}

export default bindAlipay
