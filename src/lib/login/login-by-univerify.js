/* eslint-disable camelcase */
import {
  userCollection
} from '../utils/config'
import {
  getPhoneNumber
} from '../utils/get-phone-number'

/**
 *
 * @param {String} access_token      uni.login返回的access_token
 * @param {String} openid           uni.login返回的openid
 * @param {String} inviteCode       邀请人的邀请码，type为register时生效
 * @param {String} myInviteCode     设置当前注册用户自己的邀请码，type为register时生效
 * @param {String} type             指定操作类型，可选值为login、register，不传此参数时表现为手机号已注册则登录，手机号未注册则进行注册
 * @param {Boolean} needPermission  设置为true时会在checkToken时返回用户权限（permission），建议在管理控制台中使用
 */
export default async function loginByUniverify ({
  openid,
  access_token,
  password,
  inviteCode,
  myInviteCode,
  type,
  needPermission,
  role
}) {
  const config = this._getConfig()
  const univerifyConfig = config && config.service && config.service.univerify

  // univerifyConfig配置错误处理
  if (!univerifyConfig) {
    throw new Error(this.t('uni-verify-config-required'))
  }

  if (config.forceInviteCode && !type) {
    throw new Error(this.t('login-with-invite-type-required'))
  }

  // 换取手机号
  const phoneInfo = await getPhoneNumber.bind(this)({
    ...univerifyConfig,
    openid,
    access_token
  })
  if (phoneInfo.code !== 0) {
    return phoneInfo
  }

  const mobile = String(phoneInfo.phoneNumber)
  let userList = await userCollection.where({
    mobile,
    mobile_confirmed: 1
  }).get()
  userList = this._getCurrentAppUser(userList.data)

  /**
   * 以下为登录
   */
  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10601,
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
  }

  /**
   * 以下为注册
   */
  if (type === 'login') {
    return {
      code: 10602,
      messageValues: {
        type: this.t('mobile')
      }
    }
  }

  const now = Date.now()
  const user = {
    mobile,
    my_invite_code: myInviteCode,
    mobile_confirmed: 1,
    role
  }

  // 密码
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

  // 邀请码
  if (inviteCode) {
    let inviter = await userCollection.where({
      my_invite_code: inviteCode
    }).get()
    if (inviter.data.length !== 1) {
      return {
        code: 10203
      }
    }
    inviter = inviter.data[0]
    // 倒序排列全部邀请人
    user.inviter_uid = ([inviter._id]).concat(inviter.inviter_uid || [])
    user.invite_time = now
  } else if (config.forceInviteCode) {
    return {
      code: 10203
    }
  }
  user.my_invite_code = myInviteCode

  // 注册用户，返回信息
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
