import {
  UserStatus,
  userCollection
} from '../utils/config'

export function checkLoginUserList (userList) {
  if (!userList || userList.length === 1) {
    return
  }
  if (userList[0].status === UserStatus.closed) {
    return {
      code: 10006
    }
  }
  return {
    code: 10005
  }
}

/**
 * 根据用户列表获取当前客户端应用匹配的用户
 * @param {Array} userList 数据库内查询到的用户列表
 * @returns {Object} 返回值，包含错误信息或被筛选出的用户
 */

export function getCurrentAppUser (userList) {
  const dcloudAppid = this.context.APPID
  return userList.filter(item => {
    // 空数组不允许登录
    // 防止开发者漏传appid导致用户重复注册，item.dcloud_appid.indexOf(null) > -1
    return item.dcloud_appid === undefined || item.dcloud_appid === null || item.dcloud_appid.indexOf(dcloudAppid) > -1 || item.dcloud_appid.indexOf(null) > -1
  })
}

/**
 * 根据用户列表获取匹配的用户，登录用接口
 * @param {Array} userList 数据库内查询到的用户列表
 * @param {Object[]} filterList 匹配规则
 * @param {string} filterList[].field 需要匹配的字段
 * @param {string} filterList[].value 需要匹配的字段值
 * @param {string} filterList[].fallbackValue 需要匹配的字段值
 * @returns {Object} 返回值，包含错误信息或被筛选出的用户
 */
export function getMatchedUser (userList, filterList) {
  if (userList.length === 0) {
    return {
      code: 10002
    }
  }
  let userMatched
  const userClassified = {}
  const fallbackValueMatchedMap = {}
  for (let i = userList.length - 1; i >= 0; i--) {
    const user = userList[i]
    for (let j = 0; j < filterList.length; j++) {
      const {
        field,
        value,
        fallbackValue
      } = filterList[j]
      if (value && user[field] === value) {
        userClassified[field] = user
        userList.splice(i, 1)
      } else if (fallbackValue && user[field] === fallbackValue) {
        if (!userClassified[field]) {
          userClassified[field] = user
        }
        fallbackValueMatchedMap[field] = true
        userList.splice(i, 1)
      }
    }
  }
  const userClassifiedKeys = Object.keys(userClassified)
  let fieldMatched
  switch (userClassifiedKeys.length) {
    case 0:
      userMatched = userList[0]
      userList.splice(0, 1)
      break
    case 1:
      fieldMatched = userClassifiedKeys[0]
      userMatched = userClassified[fieldMatched]
      break
    default:
      return {
        code: 10003,
        messageValues: {
          target: '用户'
        }
      }
  }
  if (userList.length > 0) {
    return {
      code: 10003,
      messageValues: {
        target: '用户'
      }
    }
  }
  return {
    code: 0,
    msg: '',
    userMatched,
    fieldMatched,
    isFallbackValueMatched: fieldMatched ? fallbackValueMatchedMap[fieldMatched] : false
  }
}

// 邀请码由大写字母加数字组成，由于存在手动输入邀请码的场景，从可选字符中去除 0、1、I、O
function getRandomInviteCode (len = 6) {
  const charArr = ['2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  let code = ''
  for (let i = 0; i < len; i++) {
    code += charArr[Math.floor(Math.random() * charArr.length)]
  }
  return code
}

export async function getValidInviteCode ({
  inviteCode
}) {
  let retry = 10
  let code
  if (inviteCode) {
    retry = 1
    code = inviteCode
  } else {
    code = getRandomInviteCode()
  }
  let codeValid = false
  try {
    while (retry > 0 && !codeValid) {
      retry--
      const codeInDb = await userCollection.where({
        my_invite_code: code
      }).get()
      if (codeInDb.data.length === 0) {
        codeValid = true
        break
      }
      code = getRandomInviteCode()
    }
    code = getRandomInviteCode()
  } catch (e) {}
  if (!codeValid) {
    if (inviteCode) {
      return {
        code: 80401
      }
    } else {
      return {
        code: 80402
      }
    }
  }
  return {
    code: 0,
    inviteCode: code
  }
}
