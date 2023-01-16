/* eslint-disable no-unused-vars */
import {
  wrapFn,
  mergeLanguage
} from './share/index'
import messages from './lang/index'

import * as methodList from './uni-id'
import VueI18n from 'vue-i18n/dist/vue-i18n.cjs'

// let createConfig
let pluginConfig
// try {
//   createConfig = require('uni-config-center')
// } catch (error) {
//   throw new Error('Plugin[uni-config-center] was not found')
// }

class UniID {
  constructor ({
    context,
    clientInfo,
    config
  } = {}) {
    // const pluginConfig = createConfig({
    //   pluginId: 'uni-id'
    // })
    this.pluginConfig = pluginConfig
    this.config = config
    this._configCache = {} // appid_platform : {}
    // 兼容旧uni-id逻辑（非开发者调用createInstance创建），防止__ctx__被缓存在uni-id内部
    // this.context = context
    Object.defineProperty(this, 'context', {
      get () {
        let realContext
        if (clientInfo) {
          realContext = {
            OS: clientInfo.os,
            CLIENTIP: clientInfo.clientIP,
            CLIENTUA: clientInfo.userAgent,
            PLATFORM: clientInfo.platform,
            APPID: clientInfo.appId,
            LOCALE: clientInfo.locale,
            DEVICEID: clientInfo.deviceId
          }
        } else {
          realContext = Object.assign({}, context || global.__ctx__ || {})
        }
        const required = ['CLIENTIP', 'PLATFORM', 'APPID', 'LOCALE']
        for (let i = 0; i < required.length; i++) {
          const key = required[i]
          if (realContext[key] === undefined) {
            console.warn(i18n.t('context-required', {
              key
            }))
          }
        }
        const appid = realContext.APPID
        const platform = realContext.PLATFORM

        // TODO 优化此处逻辑，现在都写在get context里面太混乱了，并且性能也不好
        // 允许开发者通过配置纠正app-plus、app平台配置
        const config = this._getAppConfig(this.config, appid)
        if (!config) {
          throw new Error(`Config for current app (${appid}) was not found, please check your config file or client appId`)
        }
        if (platform === 'app' || platform === 'app-plus') {
          // App平台
          realContext.PLATFORM = config.preferedAppPlatform || platform
        } else if (platform === 'web' || platform === 'h5') {
          // Web平台
          realContext.PLATFORM = config.preferedWebPlatform || platform
        }
        if (
          (realContext.PLATFORM === 'app' && config['app-plus']) ||
          (realContext.PLATFORM === 'app-plus' && config.app)) {
          throw new Error(`Client platform is ${realContext.PLATFORM}, but ${realContext.PLATFORM === 'app' ? 'app-plus' : 'app'} was found in config. Please refer to: https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=prefered-app-platform`)
        }
        if (
          (realContext.PLATFORM === 'web' && config.h5) ||
          (realContext.PLATFORM === 'h5' && config.web)) {
          throw new Error(`Client platform is ${realContext.PLATFORM}, but ${realContext.PLATFORM === 'web' ? 'h5' : 'web'} was found in config. Please refer to: https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=prefered-web-platform`)
        }
        return realContext
      }
    })
    // keys: customToken
    this.interceptorMap = new Map()
    if (pluginConfig && pluginConfig.hasFile('custom-token.js')) {
      this.setInterceptor('customToken', require(pluginConfig.resolve('custom-token.js')))
    }
    let i18nMessage = messages
    if (pluginConfig && pluginConfig.hasFile('lang/index.js')) {
      const langInConfig = pluginConfig.requireFile('lang/index.js')
      i18nMessage = mergeLanguage(messages, langInConfig)
    }
    // let i18n
    // if (uniCloud.initI18n) {
    //   i18n = uniCloud.initI18n({
    //     locale: 'en',
    //     fallbackLocale: 'zh-Hans',
    //     messages: i18nMessage
    //   })
    // } else {
    //   throw new Error('The HBuilderX version is too old, please upgrade to the latest version of HBuilderX')
    // }
    const i18n = new VueI18n({
      locale: 'en',
      fallbackLocale: 'zh-Hans',
      messages: i18nMessage
    })

    Object.defineProperty(this, 't', {
      get () {
        i18n.setLocale(this.context.LOCALE || 'zh-Hans')
        return i18n.t.bind(i18n)
      }
    })
  }

  get dev () {
    console.warn(this.t('dev-warning'))
    return {
      getConfig: this._getConfig.bind(this)
    }
  }

  _getAppConfig (config, appid) {
    if (!Array.isArray(config)) {
      return config
    }
    return config.find(item => item.dcloudAppid === appid) || config.find(item => item.isDefaultConfig)
  }

  _parseConfigContent (configContent) {
    // require [1,2] => {0:1,1:2}
    if (Array.isArray(configContent)) {
      return configContent
    }
    return configContent[0] ? Object.values(configContent) : configContent
  }

  /**
   * 获取config.json的内容
   * @returns {Object|Array}
   */
  _getConfigContent () {
    // 使用uni-config-center
    // 此处if条件务必判断config.json存在，用户可能通过其他方式传递config
    if (this.pluginConfig && this.pluginConfig.hasFile('config.json')) {
      let configContent
      try {
        configContent = this.pluginConfig.config()
      } catch (error) {
        throw new Error('Invalid uni-id config file\n' + error.message)
      }
      return this._parseConfigContent(configContent)
    } else {
      let configContent
      try {
        configContent = require('./config.json')
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND' || error.code === 'ENOENT') {
          throw new Error('uni-id config file[uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json] not found')
        }
        throw error
      }
      return this._parseConfigContent(configContent)
    }
  }

  init () {
    throw new Error('uniID.init has been deprecated, use uniID.createInstance instead')
  }

  setInterceptor (timing, handler) {
    this.interceptorMap.set(timing, handler)
  }

  _getConfig ({
    appid,
    platform
  } = {}) {
    appid = appid || this.context.APPID
    platform = platform || this.context.PLATFORM
    const configCacheKey = `${appid}_${platform}`
    if (this._configCache[configCacheKey]) {
      return this._configCache[configCacheKey]
    }
    // 每次都获取最新配置，不要修改此处逻辑
    const hasConfig = this.config && Object.keys(this.config).length !== 0
    if (!hasConfig) {
      throw new Error(this.t('config-file-not-found'))
    }
    const currentAppConfig = this._getAppConfig(this.config, appid)
    if (platform === 'app' || platform === 'app-plus') {
      platform = currentAppConfig.preferedAppPlatform || platform
    }
    if (platform === 'web' || platform === 'h5') {
      platform = currentAppConfig.preferedWebPlatform || platform
    }
    const platformConfig = Object.assign(currentAppConfig, currentAppConfig[platform]) || {}
    const defaultConfig = {
      bindTokenToDevice: false,
      tokenExpiresIn: 7200,
      tokenExpiresThreshold: 1200,
      passwordErrorLimit: 6,
      passwordErrorRetryTime: 3600,
      usernameToLowerCase: true,
      emailToLowerCase: true
    }
    const config = Object.assign(defaultConfig, platformConfig)
    const argsRequired = ['passwordSecret', 'tokenSecret', 'tokenExpiresIn', 'passwordErrorLimit', 'passwordErrorRetryTime']
    argsRequired.forEach((item) => {
      if (!config || !config[item]) {
        throw new Error(this.t('config-param-required', {
          param: item
        }))
      }
    })
    this._configCache[configCacheKey] = config
    return config
  }
}

for (const key in methodList) {
  UniID.prototype[key] = methodList[key]
}

// const deprecateMethodList = ['wxBizDataCrypt', 'verifyAppleIdentityToken', 'code2SessionWeixin', 'code2SessionAlipay']

function createInstance (params) {
  // {
  //   context,
  //   clientInfo,
  //   config
  // } = params
  const uniIDOrigin = new UniID(params)
  const uniID = new Proxy(uniIDOrigin, {
    get (target, prop) {
      if (prop in target && prop.indexOf('_') !== 0) {
        if (typeof target[prop] === 'function') {
          // if (deprecateMethodList.indexOf(prop) > -1) {
          //   console.warn(`uniID.${prop}方法即将废弃，后续版本将不再暴露此方法`)
          // }
          return wrapFn(target[prop]).bind(target)
        } else if (prop === 'context' || prop === 'config') {

        } else {
          return target[prop]
        }
      }
    }
  })
  console.log('uniID', uniID)
  return uniID
}

UniID.prototype.createInstance = createInstance

export default createInstance()
