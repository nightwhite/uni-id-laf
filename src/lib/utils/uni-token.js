import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import {
  getType
} from '../../share'
import {
  userCollection,
  UserStatus
} from './config'

function getClientUaHash () {
  const hash = crypto.createHash('md5')
  const hashContent = /MicroMessenger/i.test(this.context.CLIENTUA) ? this.context.CLIENTUA.replace(/(MicroMessenger\S+).*/i, '$1') : this.context.CLIENTUA
  hash.update(hashContent)
  return hash.digest('hex')
}

function createTokenInternal ({
  signContent,
  config
}) {
  if (config.tokenExpiresIn && config.tokenExpiresThreshold && config.tokenExpiresIn <= config.tokenExpiresThreshold) {
    throw new Error(this.t('token-expires-config-warning'))
  }
  if (getType(signContent) !== 'object' || !signContent.uid) {
    return {
      code: 30101,
      messageValues: {
        param: this.t('user-id')
      }
    }
  }
  if (config.bindTokenToDevice) {
    signContent.clientId = this._getClientUaHash()
  }
  const token = jwt.sign(signContent, config.tokenSecret, {
    expiresIn: config.tokenExpiresIn
  })

  return {
    token,
    tokenExpired: Date.now() + config.tokenExpiresIn * 1000
  }
}

function createToken ({
  uid,
  needPermission,
  role,
  permission
}) {
  if (!uid) {
    return {
      code: 30101,
      messageValues: {
        param: this.t('user-id')
      }
    }
  }
  const originSignContent = {
    uid,
    needPermission,
    role,
    permission
  }
  const config = this._getConfig()
  if (!this.interceptorMap.has('customToken')) {
    const signContent = { ...originSignContent }
    return this._createTokenInternal({
      signContent,
      config
    })
  }
  const customToken = this.interceptorMap.get('customToken')
  if (typeof customToken !== 'function') {
    throw new Error(this.t('type-function-required', 'customToken'))
  }
  const customTokenRes = customToken(originSignContent)
  if (!(customTokenRes instanceof Promise)) {
    return this._createTokenInternal({
      signContent: customTokenRes,
      config
    })
  }
  return customTokenRes.then(customTokenRes => {
    return this._createTokenInternal({
      signContent: customTokenRes,
      config
    })
  })
}

function verifyToken (token) {
  const config = this._getConfig()
  let payload
  try {
    payload = jwt.verify(token, config.tokenSecret)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        code: 30203,
        err: error
      }
    }
    return {
      code: 30204,
      err: error
    }
  }
  if (config.bindTokenToDevice && payload.clientId && payload.clientId !== this._getClientUaHash()) {
    return {
      code: 30201
    }
  }
  return {
    code: 0,
    message: '',
    ...payload
  }
}

async function checkToken (token, {
  needPermission,
  needUserInfo = true
} = {}) {
  const config = this._getConfig()
  const payload = this._verifyToken(token)
  if (payload.code) {
    return payload
  }

  const {
    uid,
    needPermission: needPermissionInToken,
    role,
    permission,
    exp,
    iat,
    ...restPayload
  } = payload

  // token内包含role、permission暂记为isV2Token
  const isV2Token = role && permission

  needPermission = needPermission === undefined ? needPermissionInToken : needPermission

  // admin不需要缓存role、permission在token内，判断是否有权限时推荐使用是否包含admin进行判断
  // 仅查询数据库，不验证token内的permission是否和库里的一致
  const needDBQuery = config.removePermissionAndRoleFromToken || !isV2Token || needUserInfo // 新token且不需要用户信息的情况下不查库

  // 是否需要刷新token
  const needRefreshToken = (!config.removePermissionAndRoleFromToken && !isV2Token) || // 旧token新配置
    (config.removePermissionAndRoleFromToken && isV2Token) || // 新token旧配置
    (config.tokenExpiresThreshold && exp - Date.now() / 1000 < config.tokenExpiresThreshold) // token即将过期

  let userMatched = {}
  if (needDBQuery || needRefreshToken) {
    const userInDB = await userCollection.doc(uid).get()
    if (!userInDB.data || userInDB.data.length === 0 || !userInDB.data[0].token) {
      return {
        code: 30202
      }
    }
    userMatched = userInDB.data[0]
    if (userMatched.status === UserStatus.banned) {
      return {
        code: 10001
      }
    }
    if (userMatched.status === UserStatus.closed) {
      return {
        code: 10006
      }
    }
    let tokenList = userMatched.token
    if (!tokenList) {
      tokenList = []
    } else if (typeof tokenList === 'string') {
      tokenList = [tokenList]
    }
    if (tokenList.indexOf(token) === -1) {
      return {
        code: 30202
      }
    }
  }
  const result = {
    code: 0,
    uid,
    ...restPayload
  }

  // 新token直接返回token内的role、permission
  if (isV2Token) {
    result.role = role
    result.permission = permission
  }

  if (needUserInfo) {
    result.userInfo = userMatched
  }

  // 旧token且需要返回permission的情况
  let currentRole
  let currentPermission
  if ((!isV2Token && needPermission) || needRefreshToken) {
    currentRole = result.role = userMatched.role || []
    if (currentRole.length === 0 || currentRole.includes('admin')) {
      currentPermission = result.permission = []
    } else {
      currentPermission = result.permission = await this._getPermissionListByRoleList(result.role)
    }
    // 尽量保持角色权限为最新且配套
    if (needPermission) {
      result.role = currentRole
      result.permission = currentPermission
    }
  }
  // 达到设置的token过期阈值或云端配置改变，需要重新下发一个token
  if (needRefreshToken) {
    let newTokeninfo
    if (config.removePermissionAndRoleFromToken) {
      newTokeninfo = await this.createToken({
        uid,
        needPermission: needPermissionInToken
      })
    } else {
      newTokeninfo = await this.createToken({
        uid,
        role: currentRole,
        permission: currentPermission
      })
    }

    // 去除过期token防止文档过大
    const tokenList = userMatched.token
    await this._updateToken({
      uid,
      tokenList,
      addToken: [newTokeninfo.token]
    })
    return {
      ...result,
      ...newTokeninfo
    }
  }

  return result
}

async function updateToken ({
  uid,
  tokenList,
  removeToken = [],
  addToken = []
} = {}) {
  if (!tokenList) {
    const userInDB = await userCollection.doc(uid).get()
    const userRecord = userInDB.data && userInDB.data[0]
    tokenList = (userRecord && userRecord.token) || []
  }
  if (typeof tokenList === 'string') {
    tokenList = [tokenList]
  }
  const expiredToken = this._getExpiredToken(tokenList)
  tokenList = tokenList.filter(item => {
    return expiredToken.indexOf(item) === -1
  })
  tokenList.push(...addToken)
  for (let i = 0; i < removeToken.length; i++) {
    const tokenIndex = tokenList.indexOf(removeToken[i])
    tokenList.splice(tokenIndex, 1)
  }
  await userCollection.doc(uid).update({
    token: tokenList,
    last_login_date: Date.now(),
    last_login_ip: this.context.CLIENTIP
  })
}

function getExpiredToken (tokenList) {
  const config = this._getConfig()
  const tokenExpired = []
  tokenList.forEach(token => {
    try {
      jwt.verify(token, config.tokenSecret)
    } catch (error) {
      tokenExpired.push(token)
    }
  })
  return tokenExpired
}

async function refreshToken ({
  token
} = {}) {
  const config = this._getConfig()
  const payload = this._verifyToken(token)
  if (payload.code) {
    return payload
  }
  const {
    uid,
    needPermission: needPermissionInToken
  } = payload
  // 直观感受是应该删除旧token，但是实际操作中删除旧token会导致开发者更难写业务逻辑，目前实现为删除旧token
  let newTokeninfo
  if (config.removePermissionAndRoleFromToken) {
    newTokeninfo = await this.createToken({
      uid,
      needPermission: needPermissionInToken
    })
  } else {
    const {
      role,
      permission
    } = await this.getPermissionByUid({
      uid
    })
    newTokeninfo = await this.createToken({
      uid,
      role,
      permission
    })
  }
  await this._updateToken({
    uid,
    addToken: [newTokeninfo.token],
    removeToken: [token]
  })
  return newTokeninfo
}

export {
  updateToken,
  verifyToken,
  createToken,
  checkToken,
  refreshToken,
  getExpiredToken,
  getClientUaHash,
  createTokenInternal
}
