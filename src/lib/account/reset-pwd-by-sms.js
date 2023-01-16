import {
  userCollection
} from '../utils/config'

async function resetPwdBySms ({
  mobile,
  code,
  password
}) {
  const verifyRes = await this.verifyCode({
    mobile,
    code,
    type: 'reset-pwd'
  })
  if (verifyRes.code !== 0) {
    return verifyRes // 验证失败
  }
  const userRecord = await userCollection.where({
    mobile
  }).get()
  const userList = userRecord.data.filter(item => {
    return item.dcloud_appid === undefined || item.dcloud_appid.includes(this.context.APPID)
  })
  if (userList.length === 0) {
    return {
      code: 10002
    }
  } else if (userList.length > 1) {
    return {
      code: 10005
    }
  }
  const uid = userList[0]._id
  return this.resetPwd({
    uid,
    password
  })
}

export default resetPwdBySms
