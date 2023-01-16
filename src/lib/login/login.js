import {
  userCollection,
  PublicErrorCode
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()
async function login ({
  username,
  password,
  queryField = [],
  needPermission
}) {
  const dbCmd = db.command
  const query = []
  if (!queryField || !queryField.length) {
    queryField = ['username']
  }

  if (queryField.length > 1) {
    console.warn(this.t('query-field-warning'))
  }

  const {
    usernameToLowerCase,
    emailToLowerCase,
    passwordErrorLimit,
    passwordErrorRetryTime
  } = this._getConfig()

  const extraCond = {
    email: {
      email_confirmed: 1
    },
    mobile: {
      mobile_confirmed: 1
    }
  }
  const usernameParsed = {}
  const usernameTrim = username && username.trim()
  if (!usernameTrim) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('username')
      }
    }
  }
  if (usernameToLowerCase) {
    usernameParsed.username = usernameTrim.toLowerCase()
  }
  if (emailToLowerCase) {
    usernameParsed.email = usernameTrim.toLowerCase()
  }
  const filterList = []
  queryField.forEach(item => {
    // 用于查询数据库
    query.push({
      [item]: username,
      ...extraCond[item]
    })
    // 用于对最终结果进行筛选
    const tempFilter = {
      field: item,
      value: username
    }
    // 同时兼容已处理、未处理的username、email
    if (item === 'username' && usernameParsed.username !== username) {
      query.push({
        [item]: usernameParsed.username,
        ...extraCond[item]
      })
      tempFilter.fallbackValue = usernameParsed.username
    } else if (item === 'email' && usernameParsed.email !== username) {
      query.push({
        [item]: usernameParsed.email,
        ...extraCond[item]
      })
      tempFilter.fallbackValue = usernameParsed.email
    }
    filterList.push(tempFilter)
  })
  let userList = await userCollection.where(dbCmd.or(...query)).get()
  userList = this._getCurrentAppUser(userList.data)
  const clientIP = this.context.CLIENTIP

  const getMatchedUserRes = this._getMatchedUser(userList, filterList)
  if (getMatchedUserRes.code) {
    return getMatchedUserRes
  }

  const {
    userMatched
    // fieldMatched,
    // isFallbackValueMatched
  } = getMatchedUserRes

  // const shouldTransformUsername = fieldMatched && !isFallbackValueMatched

  // 根据ip地址，密码错误次数过多，锁定登录
  let loginIPLimit = userMatched.login_ip_limit || []
  // 清理无用记录
  loginIPLimit = loginIPLimit.filter(item => item.last_error_time > Date.now() - passwordErrorRetryTime * 1000)
  let currentIPLimit = loginIPLimit.find(item => item.ip === clientIP)
  if (currentIPLimit && currentIPLimit.error_times >= passwordErrorLimit) {
    return {
      code: 10103
    }
  }
  const orginPassword = password && password.trim()
  if (!orginPassword) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '密码'
      }
    }
  }
  const checkPwdRes = this._checkPwd(userMatched, orginPassword)
  if (checkPwdRes.code === 0) {
    // 更新ip限制
    // 注意arr.splice(-1,1)也会删除第一个！！！
    const currentIPLimitIndex = loginIPLimit.indexOf(currentIPLimit)
    if (currentIPLimitIndex > -1) {
      loginIPLimit.splice(currentIPLimitIndex, 1)
    }
    const extraData = {
      login_ip_limit: loginIPLimit
    }

    // 迁移用户密码
    const {
      passwordHash,
      passwordVersion
    } = checkPwdRes
    if (passwordHash && passwordVersion) {
      extraData.password = passwordHash
      extraData.password_secret_version = passwordVersion
    }

    const loginExecRes = await this._loginExec(userMatched, {
      needPermission,
      extraData
    })
    if (loginExecRes.code !== 0) {
      return loginExecRes
    }

    return loginExecRes
  } else {
    if (!currentIPLimit) {
      currentIPLimit = {
        ip: clientIP,
        error_times: 1,
        last_error_time: Date.now()
      }
      loginIPLimit.push(currentIPLimit)
    } else {
      currentIPLimit.error_times++
      currentIPLimit.last_error_time = Date.now()
    }
    await userCollection.doc(userMatched._id).update({
      login_ip_limit: loginIPLimit
    })
    return {
      code: 10102,
      msg: '密码错误'
    }
  }
}

export default login
