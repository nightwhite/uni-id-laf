import {
  getSmsCode
} from '../../share/index'
import {
  verifyCollection
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()

export async function setVerifyCode ({
  mobile,
  email,
  code,
  expiresIn,
  type
}) {
  email = email && email.trim()
  mobile = mobile && mobile.trim()
  if (email) {
    const {
      emailToLowerCase
    } = this._getConfig()
    if (emailToLowerCase) {
      email = email.toLowerCase()
    }
  }
  if (!mobile && !email) {
    return {
      code: 50101,
      messageValues: {
        param: '手机号或邮箱'
      }
    }
  }
  if (mobile && email) {
    return {
      code: 50102,
      messageValues: {
        param: '参数',
        reason: '手机号和邮箱不可同时存在'
      }
    }
  }
  if (!code) {
    code = getSmsCode()
  }
  if (!expiresIn) {
    expiresIn = 180 // 默认180s过期时间
  }
  const now = Date.now()
  const record = {
    mobile,
    email,
    type,
    code,
    state: 0,
    ip: this.context.CLIENTIP,
    created_at: now,
    expired_at: now + expiresIn * 1000
  }

  await verifyCollection.add(record)
  return {
    code: 0,
    mobile,
    email
  }
}

export async function verifyCode ({
  mobile,
  email,
  code,
  type
}) {
  email = email && email.trim()
  mobile = mobile && mobile.trim()
  if (email) {
    const {
      emailToLowerCase
    } = this._getConfig()
    if (emailToLowerCase) {
      email = email.toLowerCase()
    }
  }
  if (!mobile && !email) {
    return {
      code: 50201,
      messageValues: {
        param: '手机号或邮箱'
      }
    }
  }
  if (mobile && email) {
    return {
      code: 50203,
      messageValues: {
        param: '参数',
        reason: '手机号和邮箱不可同时存在'
      }
    }
  }
  if (!code) {
    return {
      code: 50202,
      messageValues: {
        type: this.t(mobile ? 'sms' : 'email')
      }
    }
  }
  const dbCmd = db.command
  const now = Date.now()
  const query = {
    mobile,
    email,
    type,
    code,
    state: 0,
    expired_at: dbCmd.gt(now)
  }
  const record = await verifyCollection.where(query).orderBy('created_at', 'desc').limit(1).get()

  if (record && record.data && record.data.length > 0) {
    // 验证通过
    const matched = record.data[0]
    // 状态改为已验证
    await verifyCollection.doc(matched._id).update({
      state: 1
    })
    return {
      code: 0,
      msg: '验证通过'
    }
  } else {
    return {
      code: 50202,
      messageValues: {
        type: this.t(mobile ? 'sms' : 'email')
      }
    }
  }
}
