import {
  isPromise,
  isPlainObject,
  hasOwn
} from './utils'
import {
  ErrorCode
} from './error'

function parseResult (res) {
  if (isPlainObject(res)) {
    if (res.code === 0) {
      // 注意errCode 0的处理，不添加uni-id前缀，错误信息不处理
      res.errCode = res.code
      res.message = res.errMsg = res.msg
      delete res.messageValues
    } else if (hasOwn(ErrorCode, res.code)) {
      const errCodeDetail = ErrorCode[res.code]
      res.errCode = 'uni-id-' + errCodeDetail.errCode
      // res.errDetail = `${res.code}, ${res.msg}`
      res.errMsg = this.t(errCodeDetail.errCode, res.messageValues || {}) || res.msg
      res.message = res.msg = res.errMsg
      delete res.messageValues
    } else if (res.code) {
      console.warn(`error code not found, error code: ${res.code}, please contact us`)
    }
  }
}

export function wrapFn (fn) {
  return function () {
    const res = fn.apply(this, arguments)
    if (isPromise(res)) {
      return res.then((res) => {
        parseResult.bind(this)(res)
        return res
      })
    } else {
      parseResult.bind(this)(res)
    }
    return res
  }
}
