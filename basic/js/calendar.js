function createCal() {
	var cal=document.getElementById('calendar');
	var title=document.getElementById('time_today');
	var currentDate=new Date;
	var currentYear=currentDate.getFullYear();
	var currentMonth=currentDate.getMonth();
	var TodayDay=currentDate.getDate();
	var TodayMonth=currentDate.getMonth();
	var oUl=document.createElement('ul');
	var prev=document.getElementById('prev');
	var next=document.getElementById('next');
	prev.onclick=function(){active(--currentMonth);}
	next.onclick=function(){active(++currentMonth);}
	active(currentMonth);
	//闭包方法  可以用上面定义的变量
	function active(M) {
		oUl.innerHTML="";//要加载新的先清空 
		var activeDate=new Date(currentYear,M,1);
		//当前月的表现
		//activeDate.setDate(1);
		var month=activeDate.getMonth();
		title.innerHTML=activeDate.getFullYear()+"年"+(month+1)+"月";
		
		var diff=1-activeDate.getDay();
		if (diff==1) {diff=-6;}
		activeDate.setDate(diff);//算日历的起始
		for(var i=0;i<42;i++){
			var oLi=document.createElement('li');
			var date=activeDate.getDate();
			oLi.innerHTML=date;
			if (activeDate.getMonth()!=month) {
				// 非当月的日期设置为白色，则不显示
				oLi.style.color="#eee";
			}
			// 今天显示为具体颜色
			if (activeDate.getDate()==TodayDay 
				&& activeDate.getMonth()==TodayMonth) {
				oLi.style.backgroundColor="#522A5C";
				oLi.style.color="#fff";
			}
		activeDate.setDate(date+1);//往后走一天
		oUl.appendChild(oLi);
		}
		cal.appendChild(oUl);
	}

}
createCal();