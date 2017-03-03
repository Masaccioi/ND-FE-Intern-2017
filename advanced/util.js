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

function $ (selector) {
  const idReg = /^#([\w_\-]+)/
  const classReg = /^\.([\w_\-]+)/
  const tagReg = /^\w+$/i
  const attrReg = /(\w+)?\[([^=\]]+)(?:=(["'])?([^\]"']+)\3?)?\]/


  function find (parts) {
    const part = parts.pop()
    const actions = {
      id: function (id) {
        return [document.getElementById(id)]
      },
      className: function (className) {
        let result
        if (document.getElementsByClassName) {
          result = document.getElementsByClassName(className)
        }
        return result
      },
      tagName: function (tagName) {
        return document.getElementsByTagName(tagName)
      },
      attrName: function (tag, key, value) {

      }

    }
    let ret = query(part, actions)
    ret = [].slice.call(ret)
    return ret
  }
  function filerParent (parts, ret) {
    let parentPart = parts.pop()
    let result, i
    for (i = 0; i < ret.length; i++) {
      
    }

  }
  function query (part, actions) {
    let fn, result
    // 转数组 扩充参数个数
    let params = [].slice.call(arguments, 2)
    if (result = part.match(idReg)) {
      fn = 'id'
      params.push(result[1])
    } else if (result = part.match(classReg)) {
      fn = 'className'
      params.push(result[1])
    } else if (result = part.match(tagReg)) {
      fn = 'tagName'
      params.push(result[0])
    } else if (result = part.match(attrReg)) {

    }
    return actions[fn].apply(null, params)
  }
  const result = find(selector.split(/\s+/))
  return result
}


