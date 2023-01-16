import {
  userCollection
} from '../utils/config'

export async function addUser (user, {
  needPermission,
  autoSetDcloudAppid = true
} = {}) {
  const config = this._getConfig()
  const addData = {
    ...user,
    dcloud_appid: autoSetDcloudAppid ? [this.context.APPID] : [],
    register_date: Date.now()
    // register_ip: this.context.CLIENTIP
  }
  const addRes = await userCollection.add(addData)

  const uid = addRes.id

  let tokenInfo
  if (config.removePermissionAndRoleFromToken) {
    tokenInfo = await this.createToken({
      uid,
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
      uid,
      role,
      permission
    })
  }

  const {
    token,
    tokenExpired
  } = tokenInfo

  await userCollection.doc(uid).update({
    token: [token]
  })

  return {
    token,
    tokenExpired,
    uid,
    type: 'register',
    userInfo: Object.assign({}, addData, { token: [token] })
  }
}

export async function registerExec (user, {
  needPermission,
  autoSetDcloudAppid = true
} = {}) {
  const {
    my_invite_code: myInviteCode
  } = user
  const config = this._getConfig()

  if (config.autoSetInviteCode || myInviteCode) {
    const validResult = await this._getValidInviteCode({
      inviteCode: myInviteCode
    })
    if (validResult.code) {
      return validResult
    }
    user.my_invite_code = validResult.inviteCode
  }

  const {
    PLATFORM,
    appId,
    appid,
    APPID,
    uniPlatform,
    appName,
    appVersion,
    appVersionCode,
    channel,
    clientIP,
    CLIENTIP,
    OS,
    osName
  } = this.context

  user.register_env = {
    appid: appId || appid || APPID || '',
    uni_platform: uniPlatform || PLATFORM || '',
    os_name: osName || OS || '',
    app_name: appName || '',
    app_version: appVersion || '',
    app_version_code: appVersionCode || '',
    channel: channel ? channel + '' : '', // channel可能为数字，统一存为字符串
    client_ip: clientIP || CLIENTIP || ''
  }

  const registerResult = await this._addUser(user, {
    needPermission,
    autoSetDcloudAppid
  })

  return {
    code: 0,
    msg: '',
    ...registerResult
  }
}
