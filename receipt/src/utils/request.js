import Promise from 'nuo'
import request from 'utils/plato-request'
import { authorize } from 'utils/auth'
import { getNetStatus } from 'utils/sdk'
// import { context } from 'system/index'

let restDao
let cacheDao

if (window.Bridge) {
  restDao = window.Bridge.require('sdp.restDao')
  cacheDao = window.Bridge.require('sdp.cacheDao')
}

export default (url, options = {}) => {
  if (!getNetStatus()) {
    // context.store.dispatch('addToast', {
    //   type: 'info',
    //   message: '网络异常'
    // })
    return new Promise((resolve, reject) => {
      reject({
        code: 'NETWORK_ERROR'
      })
    })
  }

  if (!window.Bridge) {
    delete options.cache
    if (typeof options.mutate === 'undefined' && !__TEST__) {
      options.mutate = authorize
    }
    return request(url, options)
  }

  if (url && typeof url === 'object') {
    options = { ...url, ...options }
    url = options.url
  }
  if (!url) {
    throw new TypeError('url is required')
  }
  if (!/^(https?:\/\/)([^/]+)(.+)$/.test(url)) {
    if (url[0] === '.') {
      url = url.replace('.', '')
    }
    url = location.origin + url
  }
  if (!options.method) {
    options.method = 'GET'
  }

  if (!options.cache) {
    options.cache = false
  }

  const promisify = (uri, { body, params, query, noAuth }, res) => {
    const opt = {}
    // 暂时不知 SDK 中 GET 请求对 body 作何处理
    if (body) {
      if (typeof body === 'object') {
        if (/^(POST|PUT|PATCH)$/i.test(options.method)) {
          // SDK 中为 data
          opt.data = body
        } else {
          Object.keys(body).map(key => {
            uri += ((uri.indexOf('?') !== -1) ? '&' : '?') + key + '=' + body[key]
          })

          body = null
        }
      }
    }

    // SDK 中为 param
    if (params) {
      const param = {}
      Object.keys(params).map(key => {
        param[`$${key}`] = params[key]
      })
      opt.param = param
    }

    // SDK 的宏变量形式为 ${xyz} 需要对 uri 处理
    uri = uri.replace(/{(\w+)}/g, substr => {
      return `$${substr}`
    })
    // 处理 query
    if (query) {
      if (typeof query === 'object') {
        Object.keys(query).map(key => {
          uri += ((uri.indexOf('?') !== -1) ? '&' : '?') + key + '=' + query[key]
        })
      }
    }
    opt.uri = uri
    if (noAuth) {
      opt.options = {
        '_maf_no_authorization': true
      }
    }
    return new Promise((resolve, reject) => {
      res[options.method.toLowerCase()](opt, {
        success: ({ code, data }) => {
          resolve(data)
        },
        fail: ({ code, data }) => {
          if (!data) {
            data = {}
          }
          if (!data.code) {
            data.code = code
          }
          reject(data)
        }
      })
    })
  }
  if (options.method === 'GET' && options.cache) {
    return promisify(url, options, cacheDao)
  }

  return promisify(url, options, restDao)
}
