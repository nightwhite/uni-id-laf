import {
  userCollection,
  PublicErrorCode
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()
async function unbindEmail (params) {
  let {
    uid,
    email,
    // 不传递code时不进行验证码校验
    code
  } = params || {}
  email = email && email.trim()
  if (!uid || !email) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: !uid ? this.t('user-id') : this.t('email')
      }
    }
  }
  const {
    emailToLowerCase
  } = this._getConfig()
  if ('code' in params) {
    const verifyRes = await this.verifyCode({
      email,
      code,
      type: 'unbind'
    })
    if (verifyRes.code !== 0) {
      return verifyRes // 验证失败
    }
  }
  const dbCmd = db.command
  let query = {
    _id: uid,
    email
  }
  if (emailToLowerCase) {
    const emailParsed = email.toLowerCase()
    if (emailParsed !== email) {
      query = dbCmd.or(query, {
        _id: uid,
        email: emailParsed
      })
    }
  }
  const upRes = await userCollection.where(query).update({
    email: dbCmd.remove(),
    email_confirmed: dbCmd.remove()
  })
  if (upRes.updated === 1) {
    return {
      code: 0,
      msg: ''
    }
  } else {
    return {
      code: 70201
    }
  }
}

export default unbindEmail
