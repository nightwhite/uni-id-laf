import {
  log
} from '../../share/index'
import {
  userCollection
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()
async function unbindWeixin (uid) {
  const dbCmd = db.command
  const upRes = await userCollection.doc(uid).update({
    wx_openid: dbCmd.remove(),
    wx_unionid: dbCmd.remove()
  })
  log('upRes:', upRes)
  if (upRes.updated === 1) {
    return {
      code: 0,
      msg: ''
    }
  } else {
    return {
      code: 70301
    }
  }
}

export default unbindWeixin
