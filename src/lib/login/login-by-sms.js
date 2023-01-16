import {
  userCollection,
  PublicErrorCode
} from '../utils/config'

async function loginBySms ({
  mobile,
  code,
  password,
  inviteCode,
  myInviteCode,
  type,
  needPermission,
  role
}) {
  mobile = mobile && mobile.trim()
  if (!mobile) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('mobile')
      }
    }
  }
  const config = this._getConfig()
  if (config.forceInviteCode && !type) {
    throw new Error(this.t('login-with-invite-type-required'))
  }
  const verifyRes = await this.verifyCode({
    mobile,
    code,
    type: type || 'login'
  })
  if (verifyRes.code !== 0) {
    return verifyRes // 验证失败
  }
  const query = {
    mobile,
    mobile_confirmed: 1
  }
  let userList = await userCollection.where(query).get()
  userList = this._getCurrentAppUser(userList.data)

  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10201,
        messageValues: {
          type: this.t('mobile')
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

    return {
      ...loginExecRes,
      mobile
    }
  } else {
    // 注册用户
    const now = Date.now()
    if (type === 'login') {
      return {
        code: 10202,
        messageValues: {
          type: this.t('mobile')
        }
      }
    }
    const user = {
      mobile: mobile,
      mobile_confirmed: 1,
      register_ip: this.context.CLIENTIP,
      register_date: now
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
    if (inviteCode) {
      const inviter = await userCollection.where({
        my_invite_code: inviteCode
      }).get()
      if (inviter.data.length !== 1) {
        return {
          code: 10203
        }
      }
      // 倒序排列全部邀请人
      user.inviter_uid = ([inviter.data[0]._id]).concat(inviter.data[0].inviter_uid || [])
      user.invite_time = now
    } else if (config.forceInviteCode) {
      return {
        code: 10203
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
      mobile
    }
  }
}

export default loginBySms
