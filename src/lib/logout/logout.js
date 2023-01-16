import {
  userCollection
} from '../utils/config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()
async function logout (token) {
  const payload = await this.checkToken(token)

  if (payload.code) {
    return payload
  }
  const dbCmd = db.command
  await userCollection.doc(payload.uid).update({
    token: dbCmd.pull(token)
  })
  return {
    code: 0,
    msg: ''
  }
}

export default logout
