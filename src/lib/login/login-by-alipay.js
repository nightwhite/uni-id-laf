import {
  userCollection
} from '../utils/config'

async function loginByAlipay (params) {
  if (typeof params === 'string') {
    params = {
      code: params
    }
  }

  const {
    needPermission,
    code,
    myInviteCode,
    role,
    type
  } = params

  const {
    openid
  } = await this._getAlipayApi().code2Session(code)
  if (!openid) {
    return {
      code: 10501,
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
    if (type === 'register') {
      return {
        code: 10502,
        messageValues: {
          type: this.t('alipay-account')
        }
      }
    }
    if (userList.length !== 1) {
      return {
        code: 10005
      }
    }
    const userMatched = userList[0]

    const loginExecRes = await this._loginExec(userMatched, {
      needPermission
    })
    if (loginExecRes.code !== 0) {
      return loginExecRes
    }
    const {
      userInfo
    } = loginExecRes

    return {
      ...loginExecRes,
      openid,
      mobileConfirmed: userInfo.mobile_confirmed === 1,
      emailConfirmed: userInfo.email_confirmed === 1
    }
  } else {
    if (type === 'login') {
      return {
        code: 10503,
        messageValues: {
          type: this.t('alipay-account')
        }
      }
    }
    const user = {
      ali_openid: openid
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
      openid,
      mobileConfirmed: false,
      emailConfirmed: false
    }
  }
}

export default loginByAlipay
