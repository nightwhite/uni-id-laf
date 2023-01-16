import {
  userCollection,
  PublicErrorCode
} from '../utils/config'

export default async function ({
  uid,
  field
}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('user-id')
      }
    }
  }
  let res
  if (field && field.length) {
    const fieldObj = {}
    for (let i = 0; i < field.length; i++) {
      fieldObj[field[i]] = true
    }
    res = await userCollection.doc(uid).field(fieldObj).get()
  } else {
    res = await userCollection.doc(uid).get()
  }
  if (res.data.length === 0) {
    return {
      code: 80301
    }
  }
  return {
    code: 0,
    msg: '',
    userInfo: res.data[0]
  }
}
