window.onload = function () {
  const collapse = document.getElementsByClassName('collapse')
  const toggle = document.getElementsByClassName('navbar-toggle')
  toggle[0].onclick = function () {
    for (let i = 0; i < collapse.length; i++) {
      toggleClass(collapse[i], 'in')
    }
  }
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
function toggleClass (obj, cls) {
  if (hasClass(obj, cls)) {
    removeClass(obj, cls)
  } else {
    addClass(obj, cls)
  }
}
