/* eslint-disable camelcase */
import rsaPublicKeyPem from '../../../share/rsaPublicKeyPem'
import jwt from 'jsonwebtoken'

let authKeys = []

export default class Auth {
  constructor (options) {
    this.options = Object.assign({
      baseUrl: 'https://appleid.apple.com',
      timeout: 10000
    }, options)
  }

  async _fetch (url, options) {
    const { baseUrl } = this.options
    return uniCloud.httpclient.request(baseUrl + url, options)
  }

  async verifyIdentityToken (identityToken) {
    // 解密出kid，拿取key
    const jwtHeader = identityToken.split('.')[0]
    const { kid } = JSON.parse(Buffer.from(jwtHeader, 'base64').toString())

    if (!authKeys.length) {
      try {
        authKeys = await this.getAuthKeys()
      } catch (error) {
        return {
          code: 10705,
          msg: error.message
        }
      }
    }

    const usedKey = this.getUsedKey(authKeys, kid)

    if (!Object.keys(usedKey).length && !this.fetched) {
      try {
        authKeys = await this.getAuthKeys()
      } catch (error) {
        return {
          code: 10705,
          msg: error.message
        }
      }
    }

    /**
     * identityToken 格式
     *
     * {
     *   iss: 'https://appleid.apple.com',
     *   aud: 'io.dcloud.hellouniapp',
     *   exp: 1610626724,
     *   iat: 1610540324,
     *   sub: '000628.30119d332d9b45a3be4a297f9391fd5c.0403',
     *   c_hash: 'oFfgewoG36cJX00KUbj45A',
     *   email: 'x2awmap99s@privaterelay.appleid.com',
     *   email_verified: 'true',
     *   is_private_email: 'true',
     *   auth_time: 1610540324,
     *   nonce_supported: true
     * }
     */
    let jwtClaims = null
    try {
      jwtClaims = jwt.verify(identityToken, rsaPublicKeyPem(usedKey.n, usedKey.e), { algorithms: usedKey.alg })
    } catch (error) {
      return {
        code: 10705,
        msg: error.message
      }
    }

    return {
      code: 0,
      msg: jwtClaims
    }
  }

  async getAuthKeys () {
    const { status, data } = await this._fetch('/auth/keys', {
      method: 'GET',
      dataType: 'json',
      timeout: this.options.timeout
    })
    if (status !== 200) throw new Error('request https://appleid.apple.com/auth/keys fail')
    return data.keys
  }

  /**
   * 从这组密钥中，选择具有匹配密钥标识符（kid）的密钥，以验证Apple发行的任何JSON Web令牌（JWT）的签名
   */
  getUsedKey (authKeys, kid) {
    let usedKey = {}
    for (let index = 0; index < authKeys.length; index++) {
      const item = authKeys[index]
      if (item.kid === kid) {
        usedKey = item
        break
      }
    }
    return usedKey
  }
}
