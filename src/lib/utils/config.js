import cloud from '@lafjs/cloud'
const db = cloud.database()
const userCollectionName = 'uni-id-users'
const userCollection = db.collection(userCollectionName)
const verifyCollectionName = 'opendb-verify-codes'
const verifyCollection = db.collection(verifyCollectionName)
const roleCollectionName = 'uni-id-roles'
const roleCollection = db.collection(roleCollectionName)
const permissionCollectionName = 'uni-id-permissions'
const permissionCollection = db.collection(permissionCollectionName)

// 单端用户唯一字段，注意有些字段是对象类型
// 返回国际化的key
const uniqueUserParam = {
  username: 'username',
  mobile: 'mobile',
  email: 'email',
  wx_unionid: 'wechat-account',
  'wx_openid.app-plus': 'wechat-account',
  'wx_openid.app': 'wechat-account',
  'wx_openid.mp-weixin': 'wechat-account',
  qq_unionid: 'qq-account',
  'qq_openid.app-plus': 'qq-account',
  'qq_openid.app': 'qq-account',
  'qq_openid.mp-weixin': 'qq-account',
  ali_openid: 'alipay-account',
  apple_openid: 'alipay-account'
}

// 公用错误码
const PublicErrorCode = {
  DB_ERROR: 90001,
  PARAM_REQUIRED: 90002,
  PARAM_ERROR: 90003,
  USER_NOT_EXIST: 90004,
  ROLE_NOT_EXIST: 90005,
  PERMISSION_NOT_EXIST: 90006
}

const UserStatus = {
  normal: 0,
  banned: 1,
  audit: 2,
  auditFailed: 3,
  closed: 4
}

export {
  db,
  PublicErrorCode,
  userCollection,
  verifyCollection,
  roleCollection,
  permissionCollection,
  userCollectionName,
  verifyCollectionName,
  roleCollectionName,
  permissionCollectionName,
  uniqueUserParam,
  UserStatus
}
