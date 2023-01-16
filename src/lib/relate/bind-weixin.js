import {
  userCollection
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()
async function bindWeixin ({
  uid,
  code,
  platform
}) {
  const clientPlatform = platform || this.context.PLATFORM
  const isMpWeixin = clientPlatform === 'mp-weixin'
  const {
    openid,
    unionid,
    sessionKey,
    accessToken,
    refreshToken,
    expired: accessTokenExpired
  } = await this._getWeixinApi({
    platform: clientPlatform
  })[isMpWeixin ? 'code2Session' : 'getOauthAccessToken'](code)
  if (!openid) {
    return {
      code: 60301,
      messageValues: {
        account: '微信openid'
      }
    }
  }
  const dbCmd = db.command
  const queryUser = [{
    wx_openid: {
      [clientPlatform]: openid
    }
  }]
  if (unionid) {
    queryUser.push({
      wx_unionid: unionid
    })
  }
  let userList = await userCollection.where(dbCmd.or(...queryUser)).get()
  userList = this._getCurrentAppUser(userList.data)
  // openid 或 unionid已注册
  if (userList && userList.length > 0) {
    return {
      code: 60302,
      messageValues: {
        type: this.t('wechat-account')
      }
    }
  }
  const updateData = {
    wx_openid: {
      [clientPlatform]: openid
    }
  }
  if (unionid) {
    updateData.wx_unionid = unionid
  }
  await userCollection.doc(uid).update(updateData)

  let result
  if (isMpWeixin) {
    result = {
      sessionKey
    }
  } else {
    result = {
      accessToken,
      refreshToken,
      accessTokenExpired
    }
  }

  return {
    code: 0,
    msg: '',
    openid,
    unionid,
    ...result
  }
}

export default bindWeixin
