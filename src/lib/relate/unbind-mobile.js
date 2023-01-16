import {
  userCollection
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()
async function unbindMobile (params) {
  const {
    uid,
    mobile,
    // 不传递code时不进行验证码校验
    code
  } = params || {}
  if ('code' in params) {
    const verifyRes = await this.verifyCode({
      mobile,
      code,
      type: 'unbind'
    })
    if (verifyRes.code !== 0) {
      return verifyRes // 验证失败
    }
  }
  const dbCmd = db.command
  const upRes = await userCollection.where({
    _id: uid,
    mobile
  }).update({
    mobile: dbCmd.remove(),
    mobile_confirmed: dbCmd.remove()
  })
  if (upRes.updated === 1) {
    return {
      code: 0,
      msg: ''
    }
  } else {
    return {
      code: 70101
    }
  }
}

export default unbindMobile
