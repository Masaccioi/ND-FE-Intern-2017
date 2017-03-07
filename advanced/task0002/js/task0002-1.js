(function () {
  function filterArray (arr) {
    const result = []
    each(arr, function (item) {
      if (item) {
        result.push(item)
      }
    })
    return result
  }
  function show1 () {
    const hobby = $('.step-1 input').value
    trim(hobby)
    let arr =  hobby.split(/\，|\,/)
    arr = uniqArray(arr)
    arr = filterArray(arr)
    const output = arr.join(',')
    $('.step-1 .show').innerHTML = output
  }
  $.click('.step-1 button', show1)

  function show2 () {
    const hobby = $('.step-2 textarea').value
    trim(hobby)
    let arr =  hobby.split(/\n|\s|\ |\，|\,|\、|;/)
    arr = uniqArray(arr)
    arr = filterArray(arr)
    const output = arr.join(',')
    $('.step-2 .show').innerHTML = output
  }
  $.click('.step-2 button', show2)

  function show3 () {
    showMsg('')
    const hobby = $('.step-3 textarea').value
    trim(hobby)
    if (!hobby) showMsg('请输入至少一个爱好')
    let arr =  hobby.split(/\n|\s|\ |\，|\,|\、|;/)
    arr = uniqArray(arr)
    arr = filterArray(arr)
    if(arr.length > 10) showMsg('请不要输入超过10个爱好')
    $('.step-3 .show').innerHTML = ''
    for (let i = 0; i < arr.length; i++) {
      const check = document.createElement('input')
      check.setAttribute('type', 'checkbox')
      $('.step-3 .show').appendChild(check)
      const checklabel = document.createElement('label')
      checklabel.innerHTML = arr[i]
      $('.step-3 .show').appendChild(checklabel)
    }
  }
  $.click('.step-3 button', show3)
  function showMsg (msg) {
    $('.warn').innerHTML = msg
  }
})()
