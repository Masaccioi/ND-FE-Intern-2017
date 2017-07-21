//将数组转为对象
function arrToObj(arr){
  let jsonObj = {}
  jsonObj.result = []
  jsonObj.entities = {}
  //获取对象第一个属性的名称
  const identify = Object.keys(arr[0])[0]
  arr.forEach(function(item){
    jsonObj.result.push(item[identify])
    jsonObj.entities[item[identify]] = item
  })
}

// 支持按任意字段值的自定义排序
function mySort(arr, columnName, fn) {
  for(let i = 0;i < arr.length;i++){
    for(let j = i+1;j < arr.length;j++){
      if(arr[i][columnName] > arr[j][columnName]){
        let temp = {}
        temp = arr[j]
        arr[j] = arr[i]
        arr[i]= temp
      }
    }
  }
  // // 存在fn则直接用，不存fn在则用函数表达式的方式声明一个
  // fn = fn || function() {};
  // fn()
  return arr
}

// 根据任意字段值的过滤函数
function myFilter(arr, columnName, fn) {
  arr.forEach(function(item,i){
    if(!item.hasOwnProperty(columnName)){
      arr.splice(i,1)
    }
  })
  return arr
}
var arr = [
  {
    "id": 1,
    "name": "郑和下西洋",
    "datetime": 1499410888346
  },
  {
    "id": 2,
    "name": "郑和上西洋",
    "datetime": 1489410888327,
  }
]
arrToObj(arr)
myFilter(arr,'value')
