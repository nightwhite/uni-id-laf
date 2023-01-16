const _toString = Object.prototype.toString
const hasOwnProperty = Object.prototype.hasOwnProperty

// copy from lodash
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g
var reHasRegExpChar = RegExp(reRegExpChar.source)

/**
 * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
 * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
export function escapeRegExp (string) {
  return (string && reHasRegExpChar.test(string))
    ? string.replace(reRegExpChar, '\\$&')
    : string
}

export function replaceAll (str, substr, newSubstr) {
  return str.replace(new RegExp(escapeRegExp(substr), 'g'), newSubstr)
}

export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

export function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

export function isFn (fn) {
  return typeof fn === 'function'
}

export function isPromise (obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

export function getType (val) {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase()
}

export function deepClone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

// 简单实现，忽略数组等情况
export function getObjectValue (obj, keyPath) {
  const keyPathArr = keyPath.split('.')
  return keyPathArr.reduce((value, key) => {
    return value && value[key]
  }, obj)
}

// 获取文件后缀，只添加几种图片类型供客服消息接口使用
export const mime2ext = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/webp': 'webp'
}

export function getExtension (contentType) {
  return mime2ext[contentType]
}

const isSnakeCase = /_(\w)/g
const isCamelCase = /[A-Z]/g

export function snake2camel (value) {
  return value.replace(isSnakeCase, (_, c) => (c ? c.toUpperCase() : ''))
}

export function camel2snake (value) {
  return value.replace(isCamelCase, str => '_' + str.toLowerCase())
}

function parseObjectKeys (obj, type) {
  let parserReg, parser
  switch (type) {
    case 'snake2camel':
      parser = snake2camel
      parserReg = isSnakeCase
      break
    case 'camel2snake':
      parser = camel2snake
      parserReg = isCamelCase
      break
  }
  for (const key in obj) {
    if (hasOwn(obj, key)) {
      if (parserReg.test(key)) {
        const keyCopy = parser(key)
        obj[keyCopy] = obj[key]
        delete obj[key]
        if (isPlainObject(obj[keyCopy])) {
          obj[keyCopy] = parseObjectKeys(obj[keyCopy], type)
        } else if (Array.isArray(obj[keyCopy])) {
          obj[keyCopy] = obj[keyCopy].map((item) => {
            return parseObjectKeys(item, type)
          })
        }
      }
    }
  }
  return obj
}

export function snake2camelJson (obj) {
  return parseObjectKeys(obj, 'snake2camel')
}

export function camel2snakeJson (obj) {
  return parseObjectKeys(obj, 'camel2snake')
}

export function getOffsetDate (offset) {
  return new Date(
    Date.now() + (new Date().getTimezoneOffset() + (offset || 0) * 60) * 60000
  )
}

export function getDateStr (date, separator = '-') {
  date = date || new Date()
  const dateArr = []
  dateArr.push(date.getFullYear())
  dateArr.push(('00' + (date.getMonth() + 1)).substr(-2))
  dateArr.push(('00' + date.getDate()).substr(-2))
  return dateArr.join(separator)
}

export function getTimeStr (date, separator = ':') {
  date = date || new Date()
  const timeArr = []
  timeArr.push(('00' + date.getHours()).substr(-2))
  timeArr.push(('00' + date.getMinutes()).substr(-2))
  timeArr.push(('00' + date.getSeconds()).substr(-2))
  return timeArr.join(separator)
}

export function getFullTimeStr (date) {
  date = date || new Date()
  return getDateStr(date) + ' ' + getTimeStr(date)
}

export function log () {
  if (process.env.NODE_ENV === 'development') {
    console.log(...arguments)
  }
}

export function getSmsCode (len = 6) {
  let code = ''
  for (let i = 0; i < len; i++) {
    code += Math.floor(Math.random() * 10)
  }
  return code
}

export function getDistinctArray (arr) {
  return Array.from(new Set(arr))
}

// 暂时实现到这种程度，后续有需求时再调整
export function resolveUrl (base, path) {
  if (/^https?:/.test(path)) {
    return path
  }
  return base + path
}

export function mergeLanguage (lang1, lang2) {
  const localeList = Object.keys(lang1)
  localeList.push(...Object.keys(lang2))
  const result = {}
  for (let i = 0; i < localeList.length; i++) {
    const locale = localeList[i]
    result[locale] = Object.assign({}, lang1[locale], lang2[locale])
  }
  return result
}
