import { BLANK, CS_RES } from 'utils/config'
import Auth from 'utils/auth'
import datetime from 'nd-datetime'

const SAVE_MENU_ID = `SAVE_MENU_ID_${Date.now()}`
const SAVE_EVENT_ID = `EVENT_${SAVE_MENU_ID}`
let registedButton = false

let UC
let appFactory

if (window.Bridge) {
  UC = window.Bridge.require('sdp.uc')
  appFactory = window.Bridge.require('sdp.appfactory')
}

/**
 * register save button to menu
 * @method registerSaveButton
 * @param  {Object}           option options
 * @param  {Function}         cb     callback
 * @return {null}                  No return
 */
export const registerSaveButton = (option, cb) => {
  if (!appFactory) {
    cb(false)
    return
  }
  const { event: handler } = option
  option.id = SAVE_MENU_ID
  option.click_event_name = SAVE_EVENT_ID

  appFactory && appFactory.registerWebviewMenu(option, {
    success: (...args) => {
      registedButton = true
      if (cb && typeof cb === 'function') {
        cb(args)
      }
      console.log('register menu success')
      window.Bridge && window.Bridge.addListener(option.click_event_name, (...args) => {
        handler(args)
      })
    },
    fail: (...args) => {
      if (cb && typeof cb === 'function') {
        cb(args)
      }
      console.log('register menu fail')
    }
  })
}

/**
 * remove save button from menu
 * @method unRegisterSaveButton
 * @param  {Function}           cb callback
 * @return {[type]}                [description]
 */
export const unRegisterSaveButton = cb => {
  if (registedButton && appFactory) {
    appFactory.unRegisterWebviewMenu({
      id: SAVE_MENU_ID
    }, {
      success: (...args) => {
        registedButton = false
        window.Bridge.removeListener(SAVE_EVENT_ID)
        if (cb && typeof cb === 'function') {
          cb(args)
        }
      },
      fail: (...args) => {
        if (cb && typeof cb === 'function') {
          cb(args)
        }
      }
    })
  }
}

export const setMenuVisible = option => {
  appFactory && appFactory.setMenuVisible(option)
}
/**
 * isEmpty
 * @method isEmpty
 * @param  {Any}  val any varibale
 * @return {Boolean}     is empty
 */
export const isEmpty = val => {
  if (!val) {
    return true
  }
  if (Array.isArray(val)) {
    return !val.length
  }

  if (typeof val === 'object' && val.toLocaleString && (/Set|Map/.test(val.toLocaleString()))) {
    return !val.size
  }

  if (typeof val === 'object') {
    return !Object.keys(val).length
  }

  return false
}

/**
 * handle Image Error
 * @method handleImgError
 * @param  {Event}       e 事件对象
 * @return
 */
export const handleImgError = e => {
  if (e.target.src !== BLANK) {
    e.target.src = BLANK
  }
}

/**
 * 关闭当前 webView
 * @method closePage
 * @return {[type]}  [description]
 */
export const closePage = () => {
  if (appFactory) {
    appFactory.finishCurrentPage()
  }
}

/**
 * 获取当前登录用户的 userId
 * @method getCurrentUserId
 * @return {Number}         UID
 */
export const getCurrentUserId = () => {
  if (UC) {
    return UC.getCurrentUserId() + ''
  } else if (__DEV__) {
    const token = localStorage.getItem('token')
    return token ? JSON.parse(token).user_id : '2107161302'
  }
}

/**
 * 头像地址
 * @method avatar
 * @param  {Number | String} uid       userId
 * @param  {Number} [size=80] 尺寸大小
 * @return {String}           头像地址
 */
export const avatar = (uid, size = 80) => {
  const CS_API_ORIGIN = CS_RES.base
  if (CS_API_ORIGIN.indexOf('beta') === -1) {
    return `${CS_API_ORIGIN}/static/cscommon/avatar/${uid}/${uid}.jpg?size=${size}&_=${Date.now()}`
  } else {
    return `${CS_API_ORIGIN}/static/preproduction_content_cscommon/avatar/${uid}/${uid}.jpg?size=${size}&_=${Date.now()}`
  }
}

/**
 * 获取当前网络状态
 * @method getNetStatus
 * @return {Boolean}     网络状态。离线：false，在线：true
 */
export const getNetStatus = () => {
  if (window.Bridge) {
    const network = window.Bridge.require('sdp.network')
    return network && network.getStatus({}).toLowerCase() !== 'unknown'
  } else {
    return navigator.onLine
  }
}

/**
 * 获取 url params
 * @method getParams
 * @return object  params object
 */
export const getParams = () => {
  const paramsArr = window.location.href.match(/[^?#&]+=[^?#&]+/g)
  const paramsObj = {}
  if (paramsArr) {
    paramsArr.forEach(item => {
      const arr = item.split('=')
      paramsObj[arr[0]] = arr[1]
    })
  }
  paramsObj['user_id'] = paramsObj.uid = paramsObj.uid || paramsObj['user_id'] || getCurrentUserId()
  return paramsObj
}

/**
 * 获取应用内语言
 * @method getLang
 * @return string 语言类型（如：zh-CN,zh-HK,en,id,th...）
 */
export const getLang = () => {
  // const appfactory = window.Bridge && window.Bridge.require('sdp.appfactory')
  let lang = appFactory && appFactory.getLanguageType()
  if (!lang || lang === 'default') {
    const language = navigator.language
    lang = language.split('-')[0].toLowerCase()
    // 细分中文，其它不细分
    lang = lang === 'zh' ? language : lang
  }
  return lang
}

/**
 * 获取鉴权头部
 * @method getMACContent
 * @param  string      url    'http://....'
 * @param  string      method get/post
 * @return string            authorization
 */
export const getMACContent = (url, method) => {
  return UC ? UC.getMACContent({
    url,
    method
  }).returnMessage.replace(/\\"/g, '"') : Auth.getAuthorization({
    url,
    method
  })
}

/**
 * 对数据库进行解析并返回
 * @param {*} source
 * @param {*} uid
 */
export const getSourceObj = (source, uid) => {
  const {
    api,
    write_method,
    write_api
  } = source
  let url = write_api || api

  const vars = url.match(/\${.+}/img)
  vars && vars.forEach(val => {
    if (val === '${uid}' || val === '${user_id}') {
      url = url.replace(val, uid)
    }
  })
  return {
    url,
    method: write_method
  }
}

/**
 * go page
 * @method goPage
 * @param  {String} url url
 */
export const goPage = url => {
  if (window.Bridge) {
    const webContainer = window.Bridge.require('webcontainer')
    webContainer.goPage({
      page: url
    })
  } else {
    window.open(url)
  }
}

/**
 * 控件类型
 * @type {Object}
 */
export const TYPE = {
  'TEXT': 'x-textfield',
  'TEXTAREA': 'x-textarea',
  'TOGGLE': '',
  'DATE': 'x-date',
  'SINGLE': 'single',
  'MULTIPLE': 'multiple',
  'LINK': 'link',
  'BIRTHDAY': 'birthday',
  'CASCADE': 'cascade',
  'CUSTOM': 'custom'
}

/**
 * 得到标准时区的时间的函数
 * @param {*} zone
 *  console.log("*******************东区时间************************************");
    console.log("零时区-伦敦时间：" + getLocalTime(0));
    console.log("东一区-柏林时间：" + getLocalTime(1));
    console.log("东二区-雅典时间：" + getLocalTime(2));
    console.log("东三区-莫斯科时间：" + getLocalTime(3));
    console.log("东四区-时间：" + getLocalTime(4));
    console.log("东五区-伊斯兰堡时间：" + getLocalTime(5));
    console.log("东六区-科伦坡时间：" + getLocalTime(6));
    console.log("东七区-曼谷时间：" + getLocalTime(7));
    console.log("东八区-北京时间：" + getLocalTime(8));
    console.log("东九区-东京时间：" + getLocalTime(9));
    console.log("东十区-悉尼时间：" + getLocalTime(10));
    console.log("东十二区-斐济时间：" + getLocalTime(12));
    console.log("*******************西区时间************************************");
    console.log("西十区-斐济时间：" + getLocalTime(-10));
    console.log("西九区-阿拉斯加时间：" + getLocalTime(-9));
    console.log("西八区-太平洋时间（美国和加拿大）：" + getLocalTime(-8));
    console.log("西七区-山地时间（美国和加拿大）：" + getLocalTime(-7));
    console.log("西六区-中部时间（美国和加拿大）：" + getLocalTime(-6));
    console.log("西五区-东部时间（美国和加拿大）：" + getLocalTime(-5));
    console.log("西四区-大西洋时间（加拿大）：" + getLocalTime(-4));
    console.log("西三区-巴西利亚时间：" + getLocalTime(-3));
 */
export const getLocalTime = zone => {
  // 参数i为时区值数字，比如北京为东八区则输进8,西5输入-5
  if (typeof i !== 'number') return datetime().toNumber()
  const date = datetime()
  // 得到1970年一月一日到现在的秒数
  const timeStamp = date.toNumber()
  // 本地时间与GMT时间的时间偏移差
  const offset = date.zone * 60000
  // 得到现在的格林尼治时间
  const utc = timeStamp + offset
  return datetime(utc + 3600000 * zone)
}

export const getMyTime = () => {
  return this.getLocalTime(8)
}
