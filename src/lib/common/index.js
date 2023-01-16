import _getWeixinApi from './weixin-api'
import _getQQApi from './qq-api'
import _getAlipayApi from './alipay-api'
import _loginExec from './login-exec'
import { addUser as _addUser, registerExec as _registerExec } from './register-exec'
import {
  getValidInviteCode as _getValidInviteCode,
  getMatchedUser as _getMatchedUser,
  getCurrentAppUser as _getCurrentAppUser,
  checkLoginUserList as _checkLoginUserList
} from './utils'

import {
  setAuthorizedAppLogin,
  authorizeAppLogin,
  forbidAppLogin
} from './multi-end'

export {
  _getAlipayApi,
  _getValidInviteCode,
  _addUser,
  _loginExec,
  _registerExec,
  _getWeixinApi,
  _getQQApi,
  _getMatchedUser,
  _getCurrentAppUser,
  _checkLoginUserList,
  setAuthorizedAppLogin,
  authorizeAppLogin,
  forbidAppLogin
}
