const PublicError = {
  PARAM_ERROR: {
    errCode: 'param-error'
  },
  PARAM_REQUIRED: {
    errCode: 'param-required'
  },
  USER_NOT_EXIST: {
    errCode: 'user-not-exist'
  },
  ROLE_NOT_EXIST: {
    errCode: 'role-not-exist'
  },
  PERMISSION_NOT_EXIST: {
    errCode: 'permission-not-exist'
  },
  MULTI_USER_MATCHED: {
    errCode: 'multi-user-matched'
  },
  USER_INFO_ERROR: {
    errCode: 'user-info-error'
  },
  USER_ACCOUNT_CONFLICT: {
    errCode: 'user-account-conflict'
  },
  USER_ACCOUNT_CLOSED: {
    errCode: 'user-account-closed'
  },
  ACCOUNT_EXISTS: {
    errCode: 'account-exists'
  },
  ACCOUNT_NOT_EXISTS: {
    errCode: 'account-not-exists'
  },
  ACCOUNT_BOUND: {
    errCode: 'account-bound'
  },
  UNBIND_FAILED: {
    errCode: 'unbind-failed'
  },
  INVALID_INVITE_CODE: {
    errCode: 'invalid-invite-code'
  },
  SET_INVITE_CODE_FAILED: {
    errCode: 'set-invite-code-failed'
  },
  GET_THIRD_PARTY_ACCOUNT_FAILED: {
    errCode: 'get-third-party-account-failed'
  },
  GET_THIRD_PARTY_USER_INFO_FAILED: {
    errCode: 'get-third-party-user-info-failed'
  }
}

const ErrorCode = {
  0: {
    errCode: 0,
    errMsg: ''
  },
  10001: {
    errCode: 'account-banned'
  },
  10002: PublicError.USER_NOT_EXIST,
  10003: PublicError.MULTI_USER_MATCHED,
  10004: PublicError.USER_INFO_ERROR,
  10005: PublicError.USER_ACCOUNT_CONFLICT,
  10006: PublicError.USER_ACCOUNT_CLOSED,
  10102: {
    errCode: 'password-error'
  },
  10103: {
    errCode: 'password-error-exceed-limit'
  },
  10201: PublicError.ACCOUNT_EXISTS,
  10202: PublicError.ACCOUNT_NOT_EXISTS,
  10203: PublicError.INVALID_INVITE_CODE,
  10301: PublicError.ACCOUNT_EXISTS,
  10302: PublicError.ACCOUNT_NOT_EXISTS,
  10401: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10402: PublicError.ACCOUNT_EXISTS,
  10403: PublicError.ACCOUNT_NOT_EXISTS,
  10501: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10502: PublicError.ACCOUNT_EXISTS,
  10503: PublicError.ACCOUNT_NOT_EXISTS,
  10601: PublicError.ACCOUNT_EXISTS,
  10602: PublicError.ACCOUNT_NOT_EXISTS,
  10701: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10702: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10703: PublicError.ACCOUNT_EXISTS,
  10704: PublicError.ACCOUNT_NOT_EXISTS,
  10705: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10706: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10801: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10802: PublicError.ACCOUNT_EXISTS,
  10803: PublicError.ACCOUNT_NOT_EXISTS,
  20101: PublicError.PARAM_REQUIRED,
  20102: PublicError.ACCOUNT_EXISTS,
  30101: PublicError.PARAM_REQUIRED,
  30201: {
    errCode: 'check-device-feature-failed'
  },
  30202: {
    errCode: 'token-not-exist'
  },
  30203: {
    errCode: 'token-expired'
  },
  30204: {
    errCode: 'check-token-failed'
  },
  40201: PublicError.USER_NOT_EXIST,
  40202: {
    errCode: 'invalid-old-password'
  },
  50101: PublicError.PARAM_REQUIRED,
  50102: PublicError.PARAM_ERROR,
  50201: PublicError.PARAM_REQUIRED,
  50203: PublicError.PARAM_ERROR,
  50202: {
    errCode: 'invalid-verify-code'
  },
  50301: {
    errCode: 'send-sms-code-failed'
  },
  60101: PublicError.ACCOUNT_BOUND,
  60201: PublicError.ACCOUNT_BOUND,
  60301: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  60302: PublicError.ACCOUNT_BOUND,
  60401: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  60402: PublicError.ACCOUNT_BOUND,
  60501: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  60502: PublicError.ACCOUNT_BOUND,
  70101: PublicError.UNBIND_FAILED,
  70201: PublicError.UNBIND_FAILED,
  70301: PublicError.UNBIND_FAILED,
  70401: PublicError.UNBIND_FAILED,
  70501: PublicError.UNBIND_FAILED,
  80301: PublicError.USER_NOT_EXIST,
  80401: PublicError.SET_INVITE_CODE_FAILED,
  80402: PublicError.SET_INVITE_CODE_FAILED,
  80501: PublicError.INVALID_INVITE_CODE,
  80502: PublicError.USER_NOT_EXIST,
  80503: {
    errCode: 'modify-invite-code-is-not-allowed'
  },
  80601: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80602: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80701: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80702: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80801: {
    errCode: 'decrypt-weixin-data-failed'
  },
  80802: {
    errCode: 'decrypt-weixin-data-failed'
  },
  80803: {
    errCode: 'invalid-weixin-appid'
  },
  80804: PublicError.PARAM_REQUIRED,
  80805: PublicError.PARAM_REQUIRED,
  80806: PublicError.PARAM_REQUIRED,
  80901: PublicError.GET_THIRD_PARTY_USER_INFO_FAILED,
  90001: {
    errCode: 'database-operation-failed'
  },
  90002: PublicError.PARAM_REQUIRED,
  90003: PublicError.PARAM_ERROR,
  90004: PublicError.USER_NOT_EXIST,
  90005: PublicError.ROLE_NOT_EXIST,
  90006: PublicError.PERMISSION_NOT_EXIST
}

class UniCloudError extends Error {
  constructor (options) {
    super(options.message)
    this.errMsg = options.message || ''
    Object.defineProperties(this, {
      message: {
        get () {
          return `errCode: ${options.code || ''} | errMsg: ` + this.errMsg
        },
        set (msg) {
          this.errMsg = msg
        }
      }
    })
  }
}

export {
  ErrorCode,
  UniCloudError
}
