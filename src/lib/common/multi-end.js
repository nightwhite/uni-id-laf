import {
  db,
  userCollection,
  PublicErrorCode,
  uniqueUserParam
} from '../utils/config'

import {
  getObjectValue,
  getType
} from '../../share/index'

const dbCmd = db.command

async function checkCanAuthorize ({
  uid,
  dcloudAppidList
} = {}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('user-id')
      }
    }
  }
  if (!dcloudAppidList || dcloudAppidList.length === 0 || dcloudAppidList.some(item => item === undefined)) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('dcloud-appid')
      }
    }
  }
  const userRecord = await userCollection.doc(uid).get()
  const userInfo = userRecord && userRecord.data && userRecord.data[0]
  if (!userInfo) {
    return {
      code: 10002
    }
  }
  const uniqueUserParamList = Object.keys(uniqueUserParam)
  const userQuery = uniqueUserParamList.reduce((prev, keyPath) => {
    const key = keyPath
    const value = getObjectValue(userInfo, keyPath)
    if (value) {
      prev.push({
        [key]: value
      })
    }
    return prev
  }, [])

  let query

  // 与其他存在dcloud_appid的用户冲突时，不可设置
  const appidQuery = {
    dcloud_appid: dbCmd.in(dcloudAppidList),
    _id: dbCmd.neq(userInfo._id)
  }

  // 与其他不存在dcloud_appid的用户冲突时，不可设置
  const appidNotExistQuery = {
    dcloud_appid: dbCmd.exists(false),
    _id: dbCmd.neq(userInfo._id)
  }

  switch (userQuery.length) {
    case 0:
      return {
        code: 10004
      }
    case 1:
      query = dbCmd.or([
        dbCmd.and([
          userQuery[0],
          appidQuery
        ]),
        dbCmd.and([
          userQuery[0],
          appidNotExistQuery
        ])
      ])
      break
    default:
      query = dbCmd.or([
        dbCmd.and([
          dbCmd.or(userQuery),
          appidQuery
        ]),
        dbCmd.and([
          dbCmd.or(userQuery),
          appidNotExistQuery
        ])
      ])
      break
  }
  const checkUserRecord = await userCollection.where(query).limit(1).get()
  const checkUserInfo = checkUserRecord && checkUserRecord.data && checkUserRecord.data[0]
  if (!checkUserInfo) {
    return {
      code: 0
    }
  }
  // const conflictKey = uniqueUserParamList.find(key => userInfo[key] === checkUserInfo[key])
  return {
    code: 10005
    // msg: `此用户的${this.t(uniqueUserParam[conflictKey])}已被授权登录，不可再次授权`
  }
}

async function setAuthorizedAppLogin ({
  uid,
  dcloudAppidList
} = {}) {
  if (getType(dcloudAppidList) !== 'array') {
    return {
      code: PublicErrorCode.PARAM_ERROR,
      messageValues: {
        param: 'dcloudAppidList',
        reason: this.t('type-array-required', {
          param: this.t('dcloud-appid-list')
        })
      }
    }
  }
  if (dcloudAppidList && dcloudAppidList.length !== 0) {
    const checkCanAuthorizeRes = await checkCanAuthorize.bind(this)({
      uid,
      dcloudAppidList
    })
    if (checkCanAuthorizeRes.code) {
      return checkCanAuthorizeRes
    }
  }
  await userCollection.doc(uid).update({
    dcloud_appid: dbCmd.set(dcloudAppidList)
  })
  return {
    code: 0
  }
}

async function authorizeAppLogin ({
  uid,
  dcloudAppid
} = {}) {
  const checkCanAuthorizeRes = await checkCanAuthorize.bind(this)({
    uid,
    dcloudAppidList: [dcloudAppid]
  })
  if (checkCanAuthorizeRes.code) {
    return checkCanAuthorizeRes
  }
  await userCollection.doc(uid).update({
    dcloud_appid: dbCmd.push(dcloudAppid)
  })
  return {
    code: 0
  }
}

async function forbidAppLogin ({
  uid,
  dcloudAppid
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
    dcloud_appid: dbCmd.pull(dcloudAppid)
  })
  return {
    code: 0
  }
}

export {
  setAuthorizedAppLogin,
  authorizeAppLogin,
  forbidAppLogin
}
