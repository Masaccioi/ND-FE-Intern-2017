(function () {
  let time
  $.click('button', function () {
    clearInterval(time)
    const input = $('input').value
    const show = $('.show')
    const reg = /^\d{4}-((0[1-9])|(1[0-2]))-((0[1-9])|([1-2]\d)|(3[0-1]))$/
    if (reg.test(input)) {
      // YYYY-MM-DD这样格式的日期新的一天从8:00算
      const clock = new Date(input.replace('-', '/'))
      time = setInterval(count, 1000)
      function count () {
        const today = new Date()
        const gap = clock - today
        if (gap < 0) {
          clearInterval(time)
          show.innerHTML = '请输入未来某一天'
        } else if (gap === 0) {
          clearInterval(time)
          show.innerHTML = '0天'
        } else {
          const daySecond = 1000 * 3600 * 24
          const day = Math.floor(gap / daySecond)
          const hour = Math.floor(gap % daySecond / (3600 * 1000))
          const minute = Math.floor(gap % daySecond % (3600 * 1000) / (60 * 1000))
          const second = Math.floor(gap % daySecond % (3600 * 1000) % (60 * 1000) / 1000)
          show.innerHTML = '距离' + input + '还有' + day + '天' + hour + '小时' + minute + '分' + second + '秒'
        }
      }
    } else {
      show.innerHTML = '请输入正确的格式'
    }
  })
})()
