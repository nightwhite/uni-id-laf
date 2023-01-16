import getUserInfo from './get-user-info'
import getUserInfoByToken from './get-user-info-by-token'
import resetPwd from './reset-pwd'
import resetPwdBySms from './reset-pwd-by-sms'
import setAvatar from './set-avatar'
import updatePwd from './update-pwd'
import updateUser from './update-user'
import addUser from './add-user'
import {
  banAccount,
  unbanAccount,
  closeAccount,
  openAccount
} from './user-status'

export {
  addUser,
  getUserInfo,
  getUserInfoByToken,
  resetPwd,
  resetPwdBySms,
  setAvatar,
  updatePwd,
  updateUser,
  banAccount,
  unbanAccount,
  closeAccount,
  openAccount
}
