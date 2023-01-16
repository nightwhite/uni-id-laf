import {
  log
} from '../../share/index'
import {
  userCollection,
  PublicErrorCode
} from '../utils/config'

async function updateUser (params) {
  const uid = params.uid
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('user-id')
      }
    }
  }
  delete params.uid
  const {
    username,
    email
  } = params
  const {
    usernameToLowerCase,
    emailToLowerCase
  } = this._getConfig()
  let usernameParsed = username && username.trim()
  let emailParsed = email && email.trim()
  if (usernameParsed) {
    usernameToLowerCase && (usernameParsed = usernameParsed.toLowerCase())
    params.username = usernameParsed
  }
  if (emailParsed) {
    emailToLowerCase && (emailParsed = emailParsed.toLowerCase())
    params.email = emailParsed
  }
  const upRes = await userCollection.doc(uid).update(params)

  log('update -> upRes', upRes)

  return {
    code: 0,
    msg: ''
  }
}

export default updateUser
