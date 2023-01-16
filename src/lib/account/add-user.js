import {
  db,
  userCollection
} from '../utils/config'
async function addUser ({
  username,
  nickname,
  password,
  mobile,
  email,
  role = [],
  authorizedApp = []
} = {}) {
  const dbCmd = db.command
  const userAccountQuery = []

  if (!username && !mobile && !email) {
    throw new Error('username, mobile or email required')
  }

  username && userAccountQuery.push({ username })
  mobile && userAccountQuery.push({
    mobile,
    mobile_confirmed: 1
  })
  email && userAccountQuery.push({
    email,
    email_confirmed: 1
  })
  let userQuery
  if (authorizedApp.length > 0) {
    userQuery = dbCmd.and(
      dbCmd.or(userAccountQuery),
      dbCmd.or(
        {
          dcloud_appid: dbCmd.in(authorizedApp)
        },
        {
          dcloud_appid: dbCmd.exists(false)
        }
      )
    )
    const userRecord = await userCollection.where(userQuery)
      .limit(1)
      .get()
    if (userRecord.data.length > 0) {
      return {
        code: 10201,
        messageValues: {
          type: this.t('username')
        }
      }
    }
  }

  const userInfo = {
    role,
    nickname,
    dcloud_appid: authorizedApp,
    register_date: Date.now()
  }
  username && (userInfo.username = username)
  if (password) {
    const {
      passwordHash,
      version
    } = this.encryptPwd(password)
    userInfo.password = passwordHash
    if (version) {
      userInfo.password_secret_version = version
    }
  }
  if (mobile) {
    userInfo.mobile = mobile
    userInfo.mobile_confirmed = 1
  }
  if (email) {
    userInfo.email = email
    userInfo.email_confirmed = 1
  }
  const addUserRes = await userCollection.add(userInfo)
  return {
    code: 0,
    uid: addUserRes.id
  }
}

export default addUser
