/* eslint-disable camelcase */
import {
  userCollection,
  PublicErrorCode
} from '../utils/config'
import platformApi from '../../platforms/index'

/**
 * Apple登录
 * @param {String} nickName   // 用户自定义昵称，若无，则为fullName拼接，若fullName无，则为email
 * @param {String} fullName   // 用户自定义名称
 * @param {String} email   // 用户邮箱，如果有则是私密邮箱，发邮件需通过Apple的服务器
 * @param {String} authorizationCode   // 用户标识码
 * @param {String} identityToken   // 身份令牌是JSON Web令牌（JWT），用于账户验证解析
 * @param {Number} realUserStatus   // 真实用户状态，0 Unsupported  1 Unknown  2  LikelyReal 真人
 */
export default async function loginByApple ({
  nickName,
  fullName,
  identityToken,
  myInviteCode,
  type,
  needPermission,
  role
}) {
  const config = this._getConfig()

  const appleConfig = config && config.oauth && config.oauth.apple

  const bundleId = appleConfig && appleConfig.bundleId
  if (!bundleId) {
    throw new Error(this.t('config-param-require', {
      param: '(app || app-plus).apple.bundleId'
    }))
  }

  if (!identityToken) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: 'identityToken'
      }
    }
  }

  fullName = nickName || (fullName && Object.keys(fullName).length > 0 ? fullName.familyName + fullName.givenName : '')

  const { code, msg } = await platformApi.initApple().verifyIdentityToken(identityToken)

  if (code !== 0) {
    return {
      code,
      msg,
      messageValues: {
        account: this.t('apple-account')
      }
    }
  }

  const {
    iss,
    sub,
    aud,
    email: checkEmail
  } = msg

  // 签名都是苹果签发的，因此此项应恒为 https://appleid.apple.com
  if (iss !== 'https://appleid.apple.com') {
    return {
      code: 10706,
      messageValues: {
        account: this.t('apple-account')
      }
    }
  }

  if (!sub) {
    return {
      code: 10701,
      messageValues: {
        account: this.t('apple-account')
      }
    }
  }

  if (bundleId !== aud) {
    return {
      code: 10702,
      messageValues: {
        account: this.t('apple-account')
      }
    }
  }

  const nickname = fullName || `User-${checkEmail ? checkEmail.split('@')[0] : Math.random().toString(32).slice(2)}`
  let userList = await userCollection.where({
    apple_openid: sub
  }).get()
  userList = this._getCurrentAppUser(userList.data)
  // openId 已注册
  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10703,
        messageValues: {
          type: this.t('apple-account')
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
      openid: sub
    }
  }

  /**
     * 以下为注册
     */
  if (type === 'login') {
    return {
      code: 10704,
      messageValues: {
        type: this.t('apple-account')
      }
    }
  }

  const user = {
    nickname,
    apple_openid: sub,
    my_invite_code: myInviteCode,
    role
  }

  const registerExecResult = await this._registerExec(user, {
    needPermission
  })
  if (registerExecResult.code !== 0) {
    return registerExecResult
  }
  return {
    ...registerExecResult,
    openid: sub
  }
}
