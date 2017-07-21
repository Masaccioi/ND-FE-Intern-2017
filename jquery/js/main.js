window.onload = function() { 
  //tab实现
  $('.tab li').click(function(){
    $('.tab li').eq($(this).index()).addClass('current-tab').siblings().removeClass('current-tab')
    $('.works').hide().eq($(this).index()).show()
  })

//弹出 模态框1
  $('#add-work-btn').click(function(){
    $('.mask1').addClass('on')
    $('#add-work').addClass('on')
  })
//关闭 模态框1
  $('.close-modal1').click(function(){
    $('.mask1').removeClass('on')
    $('#add-work').removeClass('on')
  })
  //弹出 模态框1
  $('.icon-add-user').click(function(){
    $('.mask2').addClass('on')
    $('#class-users').addClass('on')
  })
//关闭 模态框1
  $('.close-modal2').click(function(){
    $('.mask2').removeClass('on')
    $('#class-users').removeClass('on')
  })

//每次只能添加一个用户,选中则增加class
  $('.username-list ul li').click(function(){
    $('.username-list ul li').eq($(this).index()).addClass('current-name').siblings().removeClass('current-name')
  })

  let usernameArr = []
   $('#add-username-btn').click(function(){
     const username = $(".current-name").text()
     usernameArr.push(username)
     const li = document.createElement('li')
     li.innerHTML = username
     $('#username-add-list ul').append(li)
   })
}