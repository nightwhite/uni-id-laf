import crypto from 'crypto'
import {
  PublicErrorCode
} from '../utils/config'

/**
 * 详情查看：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html#%E5%8A%A0%E5%AF%86%E6%95%B0%E6%8D%AE%E8%A7%A3%E5%AF%86%E7%AE%97%E6%B3%95
 * @param {String} code           微信登录成功临时登录凭证code
 * @param {String} sessionKey     微信code2session返回的会话密钥
 * @param {String} encryptedData  包括敏感数据在内的完整用户信息的加密数据
 * @param {String} iv             加密算法的初始向量
 */
export default async function wxBizDataCrypt ({
  code,
  sessionKey,
  encryptedData,
  iv
}) {
  if (!encryptedData) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: 'encryptedData'
      }
    }
  }

  if (!iv) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: 'iv'
      }
    }
  }

  if (!code && !sessionKey) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: 'sessionKey'
      }
    }
  }

  const WeiXinApi = this._getWeixinApi()

  if (!sessionKey) {
    const res = await WeiXinApi.code2Session(code)

    if (!res.sessionKey) {
      return {
        code: 80801
      }
    }

    sessionKey = res.sessionKey
  }

  sessionKey = Buffer.from(sessionKey, 'base64')
  encryptedData = Buffer.from(encryptedData, 'base64')
  iv = Buffer.from(iv, 'base64')

  try {
    // 解密
    var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true)
    var decoded = decipher.update(encryptedData, 'binary', 'utf8')
    decoded += decipher.final('utf8')

    decoded = JSON.parse(decoded)
  } catch (err) {
    console.error(err)
    return {
      code: 80802
    }
  }

  if (decoded.watermark.appid !== WeiXinApi.options.appId) {
    return {
      code: 80803
    }
  }

  return {
    code: 0,
    msg: '',
    ...decoded
  }
}
