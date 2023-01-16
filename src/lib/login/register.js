import {
  userCollection,
  PublicErrorCode,
  UserStatus
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()

// 初版历史遗留问题，此接口允许接收任意参数。看后续能不能在某个大版本改掉
async function register (user) {
  const query = []
  const uniqueParam = [{
    name: 'username',
    desc: this.t('username')
  }, {
    name: 'email',
    desc: this.t('email'),
    extraCond: {
      email_confirmed: 1
    }
  }, {
    name: 'mobile',
    desc: this.t('mobile'),
    extraCond: {
      mobile_confirmed: 1
    }
  }]

  const {
    usernameToLowerCase,
    emailToLowerCase
  } = this._getConfig()

  uniqueParam.forEach(item => {
    const paramName = item.name
    let paramValue = user[paramName] && user[paramName].trim()
    if (paramValue) {
      if ((item.name === 'username' && usernameToLowerCase) || (item.name === 'email' && emailToLowerCase)) {
        paramValue = paramValue.toLowerCase()
      }
      user[paramName] = paramValue
      query.push({
        [paramName]: paramValue,
        ...item.extraCond
      })
    } else {
      delete user[paramName]
    }
  })

  // 注意这里获取的username、email等信息均已处理过，转小写，去空格
  const {
    username,
    email,
    mobile,
    myInviteCode,
    needPermission,
    autoSetDcloudAppid = true
  } = user

  'needPermission' in user && delete user.needPermission
  'autoSetDcloudAppid' in user && delete user.autoSetDcloudAppid

  if (query.length === 0) {
    return {
      code: 20101,
      messageValues: {
        param: this.t('user-unique-param')
      }
    }
  }

  const dbCmd = db.command
  let userList = await userCollection.where(dbCmd.or(...query)).get()
  userList = this._getCurrentAppUser(userList.data)
  // 用户已存在
  if (userList && userList.length > 0) {
    const userToCheck = userList[0]
    if (userToCheck.status === UserStatus.closed) {
      return {
        code: 10006
      }
    }
    for (let i = 0; i < uniqueParam.length; i++) {
      const paramItem = uniqueParam[i]
      let extraCondMatched = true
      if (paramItem.extraCond) {
        extraCondMatched = Object.keys(paramItem.extraCond).every((key) => {
          return userToCheck[key] === paramItem.extraCond[key]
        })
      }
      if (userToCheck[paramItem.name] === user[paramItem.name] && extraCondMatched) {
        return {
          code: 20102,
          messageValues: {
            type: paramItem.desc
          }
        }
      }
    }
  }
  const orginPassword = user.password && user.password.trim()
  if (!orginPassword) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('password')
      }
    }
  }
  const {
    passwordHash,
    version
  } = this.encryptPwd(orginPassword)
  user.password = passwordHash
  if (version) {
    user.password_secret_version = version
  }
  user.my_invite_code = myInviteCode
  delete user.myInviteCode

  const registerExecResult = await this._registerExec(user, {
    needPermission,
    autoSetDcloudAppid
  })
  if (registerExecResult.code !== 0) {
    return registerExecResult
  }

  return {
    ...registerExecResult,
    username,
    email,
    mobile
  }
}

export default register
