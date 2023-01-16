import {
  getDistinctArray
} from '../../share/index'
import {
  roleCollection,
  permissionCollection
} from './config'

var cloud = require('@lafjs/cloud')
const db = cloud.database()
const dbCmd = db.command

async function getPermissionListByRoleList (roleList) {
  if (!Array.isArray(roleList)) {
    return []
  }
  if (roleList.length === 0) {
    return []
  }
  if (roleList.includes('admin')) {
    const permissionRecord = await permissionCollection.limit(500).get()
    return permissionRecord.data.map(item => item.permission_id)
  }
  const roleRecord = await roleCollection.where({
    role_id: dbCmd.in(roleList)
  }).get()
  const permission = []
  roleRecord.data.forEach(item => {
    Array.prototype.push.apply(permission, item.permission)
  })
  return getDistinctArray(permission)
}

function getWeixinPlatform ({
  clientPlatform,
  userAgent
} = {}) {
  switch (clientPlatform) {
    case 'app':
    case 'app-plus':
      return 'app'
    case 'mp-weixin':
      return 'mp'
    case 'h5':
    case 'web':
      return userAgent.indexOf('MicroMessenger') > -1 ? 'h5' : 'web'
    default:
      throw new Error('Unsupported weixin platform')
  }
}

function getQQPlatform ({
  clientPlatform
} = {}) {
  switch (clientPlatform) {
    case 'app':
    case 'app-plus':
      return 'app'
    case 'mp-qq':
      return 'mp'
    default:
      throw new Error('Unsupported qq platform')
  }
}

export {
  getWeixinPlatform,
  getQQPlatform,
  getPermissionListByRoleList
}
