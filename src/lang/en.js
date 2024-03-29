const word = {
  alipay: 'alipay',
  wechat: 'wechat',
  user: 'user',
  'user-id': 'user id',
  'dcloud-appid': 'DCloud appid',
  'dcloud-appid-list': 'DCloud appid list',
  account: 'account',
  username: 'username',
  email: 'email',
  mobile: 'phone number',
  sms: 'sms',
  'wechat-openid': 'wechat openid',
  'wechat-account': 'wechat account',
  'alipay-account': 'alipay account',
  'qq-openid': 'QQ openid',
  'qq-account': 'QQ account',
  'apple-account': 'apple account',
  password: 'password',
  'verify-code': 'verify code',
  'verify-code-type': 'verify code type',
  'user-unique-param': 'username, email or mobile phone number',
  'role-id': 'role id',
  'permission-id': 'permission id',
  login: 'login',
  'verify-mobile': 'verify mobile phone number'
}

const sentence = {
  // dev
  'context-param-required': 'You should pass {param} in context using uniID.createInstance',
  'config-param-require': '{param} is required in uni-id\'s config',
  'uni-verify-config-required': 'Univerify config required: service.univerify',
  'login-with-invite-type-required': 'Parameter type is required when forceInviteCode set to true',
  'type-array-required': 'Type of {param} must be array',
  'query-field-warning': 'You are using multi query field to login, be aware that uni-id will not check username\'s fromat, eg: abc@xx.com is a valid username for uni-id. You should check username in your code.',
  'add-role-admin-is-not-allowed': 'Add role with an id of "admin" is not allowed',
  'password-secret-type-error': '"passwordSecret" in config must be string or array',
  'token-expires-config-warning': '"tokenExpiresIn" must be greater than "tokenExpiresThreshold"',
  'type-function-required': '{param} must be a function',
  'dev-warning': 'warning: uniID.dev is only for development',
  'config-file-invalid': 'Invalid config file (common/uni-config-center/uni-id/config.json), please note that comment is not allowed',
  'config-file-not-found': 'Config file (common/uni-config-center/uni-id/config.json) not found',
  'hx-version-warning': 'The HBuilderX you are using is too old, please upgrade to the latest version of HBuilderX',
  // end user message
  'account-banned': 'Account is banned',
  'user-not-exist': 'User does not exist',
  'multi-user-matched': 'Multiple users are matched',
  'user-info-error': 'User info error',
  'user-account-conflict': 'User account conflict',
  'user-account-closed': 'User account has been closed',
  'password-error': 'The password is incorrect',
  'password-error-exceed-limit': 'The number of password errors exceeded the limit',
  'account-exists': 'Account exists',
  'account-not-exists': 'Account does not exists',
  'invalid-invite-code': 'Invalid invite code',
  'get-third-party-account-failed': 'Get {account} failed',
  'get-third-party-user-info-failed': 'Get user info failed',
  'param-required': '{param} is required',
  'check-device-feature-failed': 'Check device feature failed',
  'token-not-exist': 'The login status is invalid, token does not exist',
  'token-expired': 'The login status is invalid, token has expired',
  'check-token-failed': 'Check token failed',
  'invalid-old-password': 'Invalid old password',
  'param-error': '{param} error, {reason}',
  'invalid-verify-code': 'Invalid {type} verify code',
  'send-sms-code-failed': 'Send sms code failed',
  'account-bound': 'Account has been bound',
  'unbind-failed': 'Unbind failed',
  'set-invite-code-failed': 'Set invite code failed',
  'modify-invite-code-is-not-allowed': 'Modifying the invitation code is prohibited',
  'decrypt-weixin-data-failed': 'Decrypt weixin data failed',
  'invalid-weixin-appid': 'Invalid weixin appid',
  'database-operation-failed': 'Database operation failed',
  'role-not-exist': 'Role does not exist',
  'permission-not-exist': 'Permission does not exist',
  'context-required': '"context.{key}" is required, you should pass context using uniID.createInstance',
  'limit-client-platform': 'Unsupported client platform'
}

export default {
  ...word,
  ...sentence
}
