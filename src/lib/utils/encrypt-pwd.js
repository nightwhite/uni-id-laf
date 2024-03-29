import crypto from 'crypto'
import {
  getType
} from '../../share/index'

function encryptPwd (password, { value: secret, version } = {}) {
  password = password && password.trim()
  if (!password) {
    throw new Error(this.t('param-required', {
      param: this.t('password')
    }))
  }
  if (!secret) {
    const config = this._getConfig()
    const {
      passwordSecret
    } = config
    const passwordSecretType = getType(passwordSecret)
    if (passwordSecretType === 'array') {
      const secretList = passwordSecret.sort((a, b) => {
        return a.version - b.version
      })
      secret = secretList[secretList.length - 1].value
      version = secretList[secretList.length - 1].version
    } else {
      secret = passwordSecret
    }
  }
  if (!secret) {
    throw new Error(this.t('param-error', {
      param: 'passwordSecret',
      reason: 'invalid passwordSecret'
    }))
  }
  const hmac = crypto.createHmac('sha1', secret.toString('ascii'))
  hmac.update(password)
  return {
    passwordHash: hmac.digest('hex'),
    version
  }
}

export default encryptPwd
