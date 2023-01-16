import {
  userCollection
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()
async function bindQQ ({
  uid,
  code,
  accessToken,
  platform
} = {}) {
  const clientPlatform = platform || this.context.PLATFORM
  const isMpQQ = clientPlatform === 'mp-qq'
  const {
    openid,
    unionid,
    sessionKey
  } = await this._getQQApi()[isMpQQ ? 'code2Session' : 'getOpenidByToken']({
    code,
    accessToken
  })
  if (!openid) {
    return {
      code: 60501,
      messageValues: {
        account: 'qq openid'
      }
    }
  }
  const dbCmd = db.command
  const queryUser = [{
    qq_openid: {
      [clientPlatform]: openid
    }
  }]
  if (unionid) {
    queryUser.push({
      qq_unionid: unionid
    })
  }
  let userList = await userCollection.where(dbCmd.or(...queryUser)).get()
  userList = this._getCurrentAppUser(userList.data)
  // openid 或 unionid已注册
  if (userList && userList.length > 0) {
    return {
      code: 60502,
      messageValues: {
        type: this.t('qq-account')
      }
    }
  }
  const updateData = {
    qq_openid: {
      [clientPlatform]: openid
    }
  }
  if (unionid) {
    updateData.qq_unionid = unionid
  }
  await userCollection.doc(uid).update(updateData)

  const result = {
    accessToken,
    sessionKey
  }

  return {
    code: 0,
    msg: '',
    openid,
    unionid,
    ...result
  }
}

export default bindQQ
