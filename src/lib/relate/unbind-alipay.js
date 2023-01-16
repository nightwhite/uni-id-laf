import {
  log
} from '../../share/index'
import {
  userCollection
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()
async function unbindAlipay (uid) {
  const dbCmd = db.command
  const upRes = await userCollection.doc(uid).update({
    ali_openid: dbCmd.remove()
  })
  log('upRes:', upRes)
  if (upRes.updated === 1) {
    return {
      code: 0,
      msg: ''
    }
  } else {
    return {
      code: 70401
    }
  }
}

export default unbindAlipay
