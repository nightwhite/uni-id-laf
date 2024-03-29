import {
  getType
} from '../../share/index'
// user对象
function checkPwd (user, password) {
  if (!password) {
    return {
      code: 1
      // message: '密码不能为空'
    }
  }
  const {
    password: pwdInDB,
    password_secret_version: passwordVersion
  } = user
  const config = this._getConfig()
  const {
    passwordSecret
  } = config
  const passwordSecretType = getType(passwordSecret)
  // 未配置passwordSecretList
  if (passwordSecretType === 'string') {
    const {
      passwordHash
    } = this.encryptPwd(password, { value: passwordSecret })
    if (passwordHash === pwdInDB) {
      return {
        code: 0,
        message: ''
      }
    }
    return {
      code: 2
      // message: '密码不正确'
    }
  }
  if (passwordSecretType !== 'array') {
    throw new Error(this.t('password-secret-type-error'))
  }
  const passwordSecretList = passwordSecret
  const secretList = passwordSecretList.sort((a, b) => {
    return a.version - b.version
  })
  let previousSecret
  if (!passwordVersion) {
    previousSecret = secretList[0]
  } else {
    previousSecret = secretList.find(item => item.version === passwordVersion)
  }
  if (!previousSecret) {
    return {
      code: 3
      // message: 'secretVersion不正确'
    }
  }
  const currentSecret = secretList[secretList.length - 1]
  const {
    passwordHash: previousPasswordHash
  } = this.encryptPwd(password, previousSecret)
  if (previousPasswordHash === pwdInDB) {
    const result = {
      code: 0
    }
    // 需要更新密码
    if (previousSecret !== currentSecret) {
      const {
        passwordHash: currentPasswordHash,
        version: currentVersion
      } = this.encryptPwd(password, currentSecret)
      result.passwordHash = currentPasswordHash
      result.passwordVersion = currentVersion
    }
    return result
  } else {
    return {
      code: 4,
      message: ''
    }
  }
}

export default checkPwd
