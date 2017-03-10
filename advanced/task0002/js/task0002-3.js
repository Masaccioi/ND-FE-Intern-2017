(function () {
  const oLeftBlock = $('.left-block')
  const oRightBlock = $('.right-block')
  const rightBlockX = oRightBlock.offsetLeft
  let z = 1
// 初始渲染
  draw(oLeftBlock)
  draw(oRightBlock)
// 添加拖拽事件
  $.delegate('.left-block', 'div', 'mousedown', drag)
  $.delegate('.right-block', 'div', 'mousedown', drag)

  function draw (block) {
    for (let i = 0; i < block.children.length; i++) {
      block.children[i].style.top = 60 * i + 1 + 'px'
    }
  }

  function drag (e) {
    const target = e.target || e.srcElement
    if (target.className.toLowerCase() !== 'move') {
      return
    }
    // 记录鼠标位置
    const disX = e.clientX
    const disY = e.clientY

    // 当前方块的位置
    const divLeft = target.offsetLeft
    const divTop = target.offsetTop

    target.style.border = '1px solid #333'
    target.style.opacity = 0.5
    // 利用zIndex 可以让鼠标移动后target就是点击的target
    target.style.zIndex = z++
    const parent = target.parentNode
    let flag = true

    // 鼠标移动
    document.onmousemove = function (e) {
      // 利用flag 第一次移动时候 parent移除它
      if (flag) {
        parent.removeChild(target)
        $('.drag-block').appendChild(target)
      }
      flag = false

      if (outOfSreen(e.clientX, e.clientY, e)) {
        target.parentNode.removeChild(target)
        parent.appendChild(target)
        if (parent.className.search('left-block') !== -1) {
          target.style.left = 1 + 'px'
        } else if (parent.className.search('right-block') !== -1) {
          target.style.left = rightBlockX + 1 + 'px'
        }
        document.onmousemove = null
      } else {
        target.style.left = divLeft + e.clientX - disX + 'px'
        target.style.top = divTop + e.clientY - disY + 'px'
      }
      draw(parent)
    }
    document.onmouseup = function (e) {
      document.onmousemove = null
      document.onmouseup = null
      target.style.border = 'none'
      target.style.borderBottom = '1px solid #333'
      target.style.opacity = 1
      const ev = e || window.event
      target.parentNode.removeChild(target)
      // 规则是把鼠标松掉的位置在框框里面，就会添加到框框里
      if (isInBlock(ev.clientX, ev.clientY, oLeftBlock)) {
        oLeftBlock.appendChild(target)
        target.style.left = 1 + 'px'
        draw(oLeftBlock)
      } else if (isInBlock(ev.clientX, ev.clientY, oRightBlock)) {
        oRightBlock.appendChild(target)
        target.style.left = rightBlockX + 1 + 'px'
        draw(oRightBlock)
      } else {
        parent.appendChild(target)
        if (parent.className.search('left-block') !== -1) {
          target.style.left = 1 + 'px'
        } else if (parent.className.search('right-block') !== -1) {
          target.style.left = rightBlockX + 1 + 'px'
        }
        draw(parent)
      }
    }
    return false
  }
  function outOfSreen (x, y, e) {
    const maxW = document.documentElement.clientWidth
    const maxH = document.documentElement.clientHeight
    return e.clientX <= 0 || e.clientX >= maxW || e.clientY <= 0 || e.clientY >= maxH
  }
  function isInBlock (x, y, block) {
    const x0 = getPosition(block).x
    const x1 = x0 + block.offsetWidth
    const y0 = getPosition(block).y
    const y1 = y0 + block.offsetHeight
    return x > x0 && x < x1 && y > y0 && y < y1
  }
})()
