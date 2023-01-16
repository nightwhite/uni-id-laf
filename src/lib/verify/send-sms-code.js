import {
  getSmsCode
} from '../../share/index'
import {
  PublicErrorCode
} from '../utils/config'

export default async function ({
  mobile,
  code,
  type,
  templateId
}) {
  if (!mobile) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('mobile')
      }
    }
  }
  if (!code) {
    code = getSmsCode()
  }
  if (!type) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('verify-code-type')
      }
    }
  }
  const config = this._getConfig()
  let smsConfig = config && config.service && config.service.sms
  if (!smsConfig) {
    throw new Error(this.t('config-param-required', {
      param: 'service.sms'
    }))
  }
  smsConfig = Object.assign({
    codeExpiresIn: 300
  }, smsConfig)
  const paramRequired = ['smsKey', 'smsSecret']
  for (let i = 0, len = paramRequired.length; i < len; i++) {
    const paramName = paramRequired[i]
    if (!smsConfig[paramName]) {
      throw new Error(this.t('config-param-required', {
        param: `service.sms.${paramName}`
      }))
    }
  }
  const {
    name,
    smsKey,
    smsSecret,
    codeExpiresIn
  } = smsConfig
  let action
  switch (type) {
    case 'login':
      action = this.t('login')
      break
    default:
      action = this.t('verify-mobile')
      break
  }
  try {
    const data = {
      name,
      code,
      action,
      expMinute: '' + Math.round(codeExpiresIn / 60)
    }
    if (name) {
      data.name = name
    }
    await uniCloud.sendSms({
      smsKey,
      smsSecret,
      phone: mobile,
      templateId: templateId || 'uniID_code',
      data
    })
    const setCodeRes = await this.setVerifyCode({
      mobile,
      code,
      expiresIn: codeExpiresIn,
      type
    })
    if (setCodeRes.code >= 0) {
      return setCodeRes
    }
    return {
      code: 0,
      msg: ''
    }
  } catch (e) {
    console.error(e)
    return {
      code: 50301
    }
  }
}
