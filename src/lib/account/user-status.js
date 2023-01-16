import {
  userCollection,
  PublicErrorCode,
  UserStatus
} from '../utils/config'

async function updateStatus ({
  uid,
  status
} = {}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('user-id')
      }
    }
  }
  await userCollection.doc(uid).update({
    status,
    status_update_date: Date.now()
  })
  return {
    code: 0
  }
}

// 以下接口后续可能增加参数，暂时以对象形式传参
async function banAccount ({ uid } = {}) {
  return updateStatus.call(this, {
    uid,
    status: UserStatus.banned
  })
}

async function unbanAccount ({ uid } = {}) {
  return updateStatus.call(this, {
    uid,
    status: UserStatus.normal
  })
}

async function closeAccount ({ uid } = {}) {
  return updateStatus.call(this, {
    uid,
    status: UserStatus.closed
  })
}

async function openAccount ({ uid } = {}) {
  return updateStatus.call(this, {
    uid,
    status: UserStatus.normal
  })
}

export {
  banAccount,
  unbanAccount,
  closeAccount,
  openAccount
}
