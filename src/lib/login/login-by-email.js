import {
  userCollection,
  PublicErrorCode
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()

async function loginByEmail (params) {
  let {
    email,
    code,
    password,
    myInviteCode,
    type,
    needPermission,
    role
  } = params || {}
  email = email && email.trim()
  if (!email) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '邮箱'
      }
    }
  }
  const {
    emailToLowerCase
  } = this._getConfig()
  let emailParsed = email
  if (emailToLowerCase) {
    emailParsed = email.toLowerCase()
  }
  const verifyRes = await this.verifyCode({
    email: emailParsed,
    code,
    type: type || 'login'
  })
  if (verifyRes.code !== 0) {
    return verifyRes // 验证失败
  }

  let query = {
    email,
    email_confirmed: 1
  }

  const filter = {
    field: 'email',
    value: email
  }

  const dbCmd = db.command
  if (emailParsed !== email) {
    query = dbCmd.or(query, {
      email: emailParsed,
      email_confirmed: 1
    })
    filter.fallbackValue = emailParsed
  }
  let userList = await userCollection.where(query).get()
  userList = this._getCurrentAppUser(userList.data)

  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10301,
        messageValues: {
          type: '邮箱'
        }
      }
    }

    const getMatchedUserRes = this._getMatchedUser(userList, [filter])
    if (getMatchedUserRes.code) {
      return getMatchedUserRes
    }

    const {
      userMatched
      // fieldMatched,
      // isFallbackValueMatched
    } = getMatchedUserRes

    const loginExecRes = await this._loginExec(userMatched, {
      needPermission
    })
    if (loginExecRes.code !== 0) {
      return loginExecRes
    }

    return {
      ...loginExecRes,
      email: emailParsed
    }
  } else {
    // 注册用户
    if (type === 'login') {
      return {
        code: 10302,
        messageValues: {
          type: '邮箱'
        }
      }
    }
    const user = {
      email: emailParsed,
      email_confirmed: 1
    }
    const originPassword = password && password.trim()
    if (originPassword) {
      const {
        passwordHash,
        version
      } = this.encryptPwd(originPassword)
      user.password = passwordHash
      if (version) {
        user.password_secret_version = version
      }
    }
    user.my_invite_code = myInviteCode
    user.role = role

    const registerExecResult = await this._registerExec(user, {
      needPermission
    })
    if (registerExecResult.code !== 0) {
      return registerExecResult
    }
    return {
      ...registerExecResult,
      email: emailParsed
    }
  }
}

export default loginByEmail
