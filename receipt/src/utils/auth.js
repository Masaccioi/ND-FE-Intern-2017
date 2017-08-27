import context from 'system/index'
import Sha from 'jssha'
import datetime from 'nd-datetime'
import { getLang } from 'utils/sdk'

export const getNonce = diff => {
  function rnd (min, max) {
    const arr = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'a', 'b', 'c', 'd', 'e', 'f', 'g',
      'h', 'i', 'j', 'k', 'l', 'm', 'n',
      'o', 'p', 'q', 'r', 's', 't',
      'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G',
      'H', 'I', 'J', 'K', 'L', 'M', 'N',
      'O', 'P', 'Q', 'R', 'S', 'T',
      'U', 'V', 'W', 'X', 'Y', 'Z'
    ]

    const range = max ? max - min : min
    let str = ''
    let i
    const length = arr.length - 1

    for (i = 0; i < range; i++) {
      str += arr[Math.round(Math.random() * length)]
    }

    return str
  }

  return Date.now() + (diff || 0) + ':' + rnd(8)
}

export const getMac = (nonce, method, url, host, key) => {
  const sha = new Sha('SHA-256', 'TEXT')
  sha.setHMACKey(key, 'TEXT')
  sha.update([nonce, method, url, host, ''].join('\n'))
  return sha.getHMAC('B64')
}

const Auth = {

  __access_token: null,

  get accessToken () {
    return this.__access_token
  },

  set accessToken (val) {
    this.__access_token = val
  },

  __mac_key: null,

  get macKey () {
    return this.__mac_key
  },

  set macKey (val) {
    this.__mac_key = val
  },

  __vorg: null,

  get vorg () {
    return this.__vorg
  },

  set vorg (val) {
    this.__vorg = val
  },

  __diff: null,

  get diff () {
    return this.__diff
  },

  set diff (val) {
    this.__diff = val
  },

  __expire_at: null,

  get expiresAt () {
    return this.__expire_at
  },

  set expiresAt (val) {
    this.__expire_at = val
  },

  get hasAuthorization () {
    const { tokens } = context.store.getters

    if (tokens) {
      const { access_token, mac_key, diff = 0, expires_at } = tokens

      if (!expires_at) {
        return false
      }

      // cached timestamp
      if (expires_at === this.expiresAt) {
        return true
      }

      if (datetime(tokens.expires_at).toNumber() > Date.now() + diff) {
        this.configure(access_token, mac_key, diff, expires_at)
        return true
      }
    }

    return false
  },

  configure (accessToken, macKey, diff, expiresAt) {
    this.accessToken = accessToken
    this.macKey = macKey
    this.diff = diff
    this.expiresAt = expiresAt
  },

  configureVorg (name) {
    this.vorg = name
  },

  getAuthorization ({ url, method = 'GET' }) {
    const nonce = getNonce(this.diff)
    const host = url.match(/^(https?:\/\/)([^/]+)(.+)$/)[2]
    const uri = url.match(/^(https?:\/\/)([^/]+)(.+)$/)[3]
    if (!this.accessToken) {
      const { tokens } = context.store.getters
      const { access_token, mac_key, diff = 0, expires_at } = tokens
      this.configure(access_token, mac_key, diff, expires_at)
    }
    return ['MAC id="' + this.accessToken + '"',
      'nonce="' + nonce + '"',
      'mac="' + getMac(nonce, method, uri, host, this.macKey) + '"'
    ].join(',')
  }

}

export const authorize = async options => {
  if (__DEV__ && !window.Bridge && !Auth.hasAuthorization) {
    const macMock = require('./mock')
    const data = await macMock()
    Auth.configure(data.access_token, data.mac_key, data.diff, data.expires_at)
  }
  options.headers['Authorization'] = Auth.getAuthorization(options)
  if (Auth.vorg) {
    options.headers['vorg'] = Auth.vorg
  }

  // 设置 Accept-Language
  options.headers['Accept-Language'] = getLang()

  return Promise.resolve(options)
}

export default Auth
