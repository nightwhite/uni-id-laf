// import uniToken from './uniToken.js'
import {
  userCollection
} from '../utils/config'

async function setAvatar (params) {
  await userCollection.doc(params.uid).update({
    avatar: params.avatar
  })

  return {
    code: 0,
    msg: ''
  }
}

export default setAvatar
