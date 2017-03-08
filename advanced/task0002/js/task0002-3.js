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
    target.style.zIndex = z++
    const parent = target.parentNode
    let firstMove = true

    // 鼠标移动
    document.onmousemove = function (e) {
      if (firstMove) {
        parent.removeChild(target)
        $('.drag-block').appendChild(target)
      }
      firstMove = false

      if (outOfSreen(e.clientX, e.clientY, e)) {
        target.parentNode.removeChild(target)
        parent.appendChild(target)
        if (parent.className.search('left-block') !== -1) {
          target.style.left = 1 + 'px'
        } else if (parent.className.search('right-block') !== -1) {
          target.style.left = rightBlockX + 1 + 'px'
        }
        draw(parent)
        document.onmousemove = null
      } else {
        target.style.left = divLeft + e.clientX - disX + 'px'
        target.style.top = divTop + e.clientY - disY + 'px'
        draw(parent)
      }
    }
    document.onmouseup = function (e) {
      document.onmousemove = null
      document.onmouseup = null
      target.style.border = 'none'
      target.style.borderBottom = '1px solid #333'
      target.style.opacity = 1
      const ev = e || window.event
      target.parentNode.removeChild(target)
      if (judgeInBlock(ev.clientX, ev.clientY, oLeftBlock)) {
        oLeftBlock.appendChild(target)
        target.style.left = 1 + 'px'
        draw(oLeftBlock)
      } else if (judgeInBlock(ev.clientX, ev.clientY, oRightBlock)) {
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
  function judgeInBlock (x, y, block) {
    const x0 = getPosition(block).x
    const x1 = getPosition(block).x + block.offsetWidth
    const y0 = getPosition(block).y
    const y1 = getPosition(block).y + block.offsetHeight
    return x > x0 && x < x1 && y > y0 && y < y1
  }
})()
