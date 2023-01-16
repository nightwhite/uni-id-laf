import {
  userCollection,
  PublicErrorCode
} from '../utils/config'

async function bindEmail (params) {
  let {
    uid,
    email,
    code
  } = params || {}
  email = email && email.trim()
  if (!email) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('email')
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
  const {
    emailToLowerCase
  } = this._getConfig()
  if (emailToLowerCase) {
    email = email.toLowerCase()
  }
  let userList = await userCollection.where({
    email,
    email_confirmed: 1
  }).get()
  userList = this._getCurrentAppUser(userList.data)
  if (userList && userList.length > 0) {
    return {
      code: 60201,
      messageValues: {
        type: this.t('email')
      }
    }
  }

  const verifyRes = await this.verifyCode({
    email,
    code,
    type: 'bind'
  })
  if (verifyRes.code !== 0) {
    return verifyRes // 验证失败
  }

  await userCollection.doc(uid).update({
    email,
    email_confirmed: 1
  })

  return {
    code: 0,
    msg: '',
    email
  }
}

export default bindEmail
