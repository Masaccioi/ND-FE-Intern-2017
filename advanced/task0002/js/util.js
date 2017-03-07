function isArray (arr) {
  return Array.isArray(arr)
}
function isFunction (fn) {
  return Object.prototype.toString.call(fn) === '[object Function]'
}
/*
* var str='string' // string
* var str=new String('str') // object
* 所以用instanceof不好
*/
function cloneObject (source) {
  let result = source
  let i, len
  const sourceType = Object.prototype.toString.call(source)
  if (!sourceType || sourceType === '[object Number]' ||
  sourceType === '[object String]' || sourceType === '[object Boolean]') {
    return result
  } else if (sourceType === '[object Array]') {
    result = []
    let resultLen = 0
    for (i = 0, len = source.length; i < len; i++) {
      result[resultLen++] = cloneObject(source[i])
    }
  } else if (sourceType === '[object Object]') {
    result = {}
    for (i in source) {
      if (source.hasOwnProperty(i)) {
        result[i] = cloneObject(source[i])
      }
    }
  }
  return result
}
/*
* obj为对象数组，arr的值为key
* obj = {1：true,3:true,5:true} key相等时不会新增一个
* 返回对象的key则为去重的数组
*
*/
function uniqArray (arr) {
  const obj = {}
  let i
  for (i = 0; i < arr.length; i++) {
    obj[arr[i]] = true
  }
  return Object.keys(obj)
}
/*
* 在非特殊字符之前的反斜杠表示下一个字符是特殊的
* ^ 匹配输入的开始
* \s 匹配一个空白字符，包括空格、制表符、换页符和换行符
* \t 匹配一个水平制表符 (U+0009)。
* \xa0 Unicode编码里面空格不换行
*/
function trim (str) {
  const trimer = new RegExp('(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)', 'g')
  return String(str).replace(trimer, '')
}

function each (arr, fn) {
  let i
  for (i = 0; i < arr.length; i++) {
    fn(arr[i], i)
  }
}

function getObjectLength (obj) {
  return Object.keys(obj).length
}

function isEmail (emailStr) {
  return /^([\w_\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/.test(emailStr)
}
function isMobilePhone (phone) {
  return /^1\d{10}$/.test(phone)
}
function hasClass (obj, cls) {
  return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}
function addClass (obj, cls) {
  if (!this.hasClass(obj, cls)) obj.className += ' ' + cls
}
function removeClass (obj, cls) {
  if (hasClass(obj, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    obj.className = obj.className.replace(reg, ' ')
  }
}
function isSiblingNode (element, siblingNode) {
  return element.parentNode === siblingNode.parentNode
}
function getPosition (element) {
  const box = element.getBoundingClientRect()
  return box
}
/*
* 未能匹配 tagName.className
*
*/
function $ (selector) {
  const idReg = /^#([\w_\-]+)/
  const classReg = /^\.([\w_\-]+)/
  const tagReg = /^\w+$/i
  const attrReg = /(\w+)?\[([^=\]]+)(?:=(["'])?([^\]"']+)\3?)?\]/

  function find (parts) {
    const part = parts.pop()
    const actions = {
      id (id) {
        return [document.getElementById(id)]
      },
      className (className) {
        let result
        if (document.getElementsByClassName) {
          result = document.getElementsByClassName(className)
        } else {
          const temp = document.getElementsByTagName('*')
          for (let i = 0; i < temp.length; i++) {
            const node = temp[i]
            if (hasClass(node, className)) {
              result.push(node)
            }
          }
        }
        return result
      },
      tag (tag) {
        return document.getElementsByTagName(tag)
      },
      attrName (tag, key, value) {
        const result = []
        let i
        const temp = document.getElementsByTagName(tag || '*')
        for (i = 0; i < temp.length; i++) {
          const node = temp[i]
          if (value) {
            const v = node.getAttribute(key)
            v === value && result.push(node)
          } else if (node.hasAttribute(key)) {
            result.push(node)
          }
        }
        return result
      }
    }
    let ret = query(part, actions)
    ret = [].slice.call(ret)
    return parts[0] && ret[0] ? filterParent(parts, ret) : ret
  }

  function filterParent (parts, ret) {
    const parentPart = parts.pop()
    const result = []
    let matchParent = false
    let i
    for (i = 0; i < ret.length; i++) {
      const node = ret[i]
      let p = node
      while (p.tagName) {
        p = p.parentNode
        if (p.tagName === undefined) break
        const actions = {
          id (el, id) {
            return (el.id === id)
          },
          className (el, className) {
            return hasClass(el, className)
          },
          tag (el, tag) {
            return (el.tagName.toLowerCase() === tag)
          },
          attrName (el, tag, key, value) {
            let valid = true
            if (tag) {
              valid = actions.tag(el, tag)
            }
            valid = valid && el.hasAttribute(key)
            if (value) {
              valid = valid && (value === el.getAttribute(key))
            }
            return valid
          }
        }
        matchParent = query(parentPart, actions, p)
        if (matchParent) {
          break
        }
      }
      if (matchParent) {
        result.push(node)
      }
    }
    return parts[0] && result[0] ? filterParent(parts, result) : result
  }

  function query (part, actions) {
    let fn
    let result = []
    // 转数组 扩充参数个数
    const params = [].slice.call(arguments, 2)
    if (result = part.match(idReg)) {
      fn = 'id'
      params.push(result[1])
    } else if (result = part.match(classReg)) {
      fn = 'className'
      params.push(result[1])
    } else if (result = part.match(tagReg)) {
      fn = 'tag'
      params.push(result[0])
    } else if (result = part.match(attrReg)) {
      fn = 'attrName'
      const tag = result[1]
      const key = result[2]
      const value = result[4]
      params.push(tag, key, value)
    }
    return actions[fn].apply(null, params)
  }

  const result = find(selector.split(/\s+/))
  return result[0]
}
function addEvent (element, event, listener) {
  if (element.addEventListener) {
    element.addEventListener(event, listener)
  } else if (element.attachEvent) {
    element.attachEvent('on' + event, listener)
  }
}
function removeEvent (element, event, listener) {
  if (element.removeEventListenr) {
    element.removeEventListenr(event, listener)
  } else if (element.detachEvent) {
    element.detachEvent('on' + event, listener)
  }
}
function addClickEvent (element, listener) {
  addEvent(element, 'click', listener)
}
function addEnterEvent (element, listener) {
  addEvent(element, 'keydown', function (event) {
    if (event.keyCode === 13) {
      listener()
    }
  })
}
function delegateEvent (element, tag, eventName, listener) {
  addEvent(element, eventName, function (event) {
    const target = event.target || event.srcElement
    if (target.tagName.toLowerCase() === tag.toLowerCase()) {
      listener.call(target, event)
    }
  })
}
$.on = function (selector, event, listener) {
  return addEvent($(selector), event, listener)
}

$.un = function (selector, event, listener) {
  return removeEvent($(selector), event, listener)
}
$.click = function (selector, listener) {
  return addClickEvent($(selector), listener)
}
$.enter = function (selector, listener) {
  return addEnterEvent($(selector), listener)
}
$.delegate = function (selector, tag, eventName, listener) {
  return delegateEvent($(selector), tag, event, listener)
}
function isIE() {
  // ie10的信息：
  // mozilla/5.0 (compatible; msie 10.0; windows nt 6.2; trident/6.0)
  // ie11的信息：
  // mozilla/5.0 (windows nt 6.1; trident/7.0; slcc2; .net clr 2.0.50727; .net clr 3.5.30729; .net clr 3.0.30729; media center pc 6.0; .net4.0c; .net4.0e; infopath.2; rv:11.0) like gecko
  const s = navigator.userAgent.toLowerCase()
  const ie = s.match(/rv:([\d.]+)/) || s.match(/msie ([\d.]+)/)
  if (ie) {
    return ie[1]
  } else {
    return -1
  }
}
function setCookie (cookieName, cookieValue, expiredays) {
  let expires
  if (expiredays != null) {
    expires = new Date()
    expires.setTime(expires.getTime() + expiredays * 24 * 60 * 60 * 1000)
  }
  document.cookie = cookieName + '=' + encodeURIComponent(cookieValue) + (expires ? '; expires=' + expires.toGMTString() : '')
}

function getCookie(cookieName) {
  const cookie = {}
  const all = document.cookie
  if (all === '') {
    return cookie
  }
  const list = all.split('; ')
  for (let i = 0; i < list.length; i++) {
    const p = list[i].indexOf('=')
    const name = list[i].substr(0, p)
    let value = list[i].substr(p + 1)
    value = decodeURIComponent(value)
    cookie[name] = value
  }
  return cookie
}
function ajax(url, options) {
  let dataResult
  if (typeof (options.data) === 'object') {
    let str = ''
    for (const c in options.data) {
      str = str + c + '=' + options.data[c] + '&'
    }
    dataResult = str.substring(0, str.length - 1)
  }
  options.type = options.type || 'GET'
  // 获取XMLHttpRequest对象
  const xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP')
  // 发送请求
  xhr.open(options.type, url, true)
  if (options.type === 'GET') {
    xhr.send(null)
  } else {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send(dataResult)
  }

  // 状态
  xhr.onreadystatechange = function () {
    // 4 响应完成
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (options.onsuccess) {
          options.onsuccess(xhr.responseText, xhr.responseXML)
        }
      } else {
        if (options.onfail) {
          options.onfail()
        }
      }
    }
  }
}



