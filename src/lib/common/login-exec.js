import {
  userCollection,
  UserStatus
} from '../utils/config'

export default async function (user, options = {}) {
  if (user.status === UserStatus.banned) {
    return {
      code: 10001
    }
  }
  if (user.status === UserStatus.closed) {
    return {
      code: 10006
    }
  }

  const config = this._getConfig()
  // 过期token清理
  let tokenList = user.token || []
  // 兼容旧版逻辑
  if (typeof tokenList === 'string') {
    tokenList = [tokenList]
  }
  const expiredToken = this._getExpiredToken(tokenList)
  tokenList = tokenList.filter(item => {
    return expiredToken.indexOf(item) === -1
  })

  let tokenInfo
  if (config.removePermissionAndRoleFromToken) {
    const needPermission = options.needPermission
    tokenInfo = await this.createToken({
      uid: user._id,
      needPermission
    })
  } else {
    const role = user.role || []
    let permission
    if (role.length === 0 || role.includes('admin')) {
      permission = []
    } else {
      permission = await this._getPermissionListByRoleList(role)
    }
    tokenInfo = await this.createToken({
      uid: user._id,
      role,
      permission
    })
  }

  const {
    token,
    tokenExpired
  } = tokenInfo

  tokenList.push(token)
  user.token = tokenList

  const updateData = {
    last_login_date: Date.now(),
    last_login_ip: this.context.CLIENTIP,
    token: tokenList,
    ...options.extraData
  }

  // 更新不存在dcloud_appid的用户，设置上dcloud_appid。会导致不兼容，废弃此行为
  // if (!user.dcloud_appid) {
  //   updateData.dcloud_appid = [this.context.APPID]
  // }

  await userCollection.doc(user._id).update(updateData)

  const userInfo = Object.assign({}, user, updateData)

  return {
    code: 0,
    msg: '',
    token,
    uid: userInfo._id,
    username: userInfo.username,
    type: 'login',
    userInfo,
    tokenExpired
  }
}
