import {
  userCollection,
  PublicErrorCode
} from '../utils/config'
import {
  getPhoneNumber
} from '../utils/get-phone-number'

/**
 *
 * @param {string} uid user id
 * @param {string} mobile 手机号
 * @param {string} code 手机验证码
 * @param {string} openid client openid
 * @param {string} access_token client access_token
 * @returns
 */
async function bindMobile (params) {
  let {
    uid,
    mobile,
    code,
    openid,
    // eslint-disable-next-line camelcase
    access_token,
    type = 'sms'
  } = params || {}
  if (type === 'univerify') {
    const config = this._getConfig()
    const univerifyConfig = config && config.service && config.service.univerify

    // univerifyConfig配置错误处理
    if (!univerifyConfig) {
      throw new Error('请在config.json中配置service.univerify下一键登录相关参数')
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
    mobile = '' + phoneInfo.phoneNumber
  }
  let userList = await userCollection.where({
    mobile: mobile,
    mobile_confirmed: 1
  }).get()
  userList = this._getCurrentAppUser(userList.data)
  if (userList && userList.length > 0) {
    return {
      code: 60101,
      messageValues: {
        type: '手机号'
      }
    }
  }
  if (type === 'sms' && 'code' in params) {
    if (!mobile) {
      return {
        code: PublicErrorCode.PARAM_REQUIRED,
        messageValues: {
          param: this.t('mobile')
        }
      }
    }
    if (!code) {
      return {
        code: PublicErrorCode.PARAM_REQUIRED,
        messageValues: {
          param: this.t('verify-code')
        }
      }
    }
    const verifyRes = await this.verifyCode({
      mobile,
      code,
      type: 'bind'
    })
    if (verifyRes.code !== 0) {
      return verifyRes // 验证失败
    }
  }
  await userCollection.doc(uid).update({
    mobile: mobile,
    mobile_confirmed: 1
  })

  return {
    code: 0,
    msg: '',
    mobile
  }
}

export default bindMobile
