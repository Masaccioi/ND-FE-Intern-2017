// export default () => {
//   return [
//     {
//       path: '/',
//       meta: {
//         icon: 'eye'
//       },
//       component: () => System.import('./views/index'),
//       children: [{
//         path: ':component',
//         meta: {
//           hidden: true
//         },
//         component: () => System.import('./verify/views/index')
//       }]
//     }
//   ]
// }

export default () => {
  return [
    {
      path: '/',
      redirect: '/source/verify',
      meta: {
        icon: 'person',
        name: '本地数据源查询'
      },
      component: () => System.import('./views/index'),
      children: [
        {
          path: 'verify',
          meta: {
            name: '密码验证'
          },
          component: () => System.import('./verify/views/index')
        }, {
          path: 'base',
          meta: {
            auth: true,
            hidden: true,
            name: '数据查询'
          },
          component: () => System.import('./base/views/index')
        }, {
          path: 'result',
          meta: {
            auth: true,
            hidden: true,
            name: '查询结果'
          },
          component: () => System.import('./base/views/result')
        }, {
          path: 'detail/:id',
          meta: {
            icon: 'question',
            auth: true,
            hidden: true,
            name: '明细'
          },
          component: () => System.import('./base/views/detail')
        }, {
          path: 'tip',
          meta: {
            icon: 'document',
            auth: true,
            name: '提示'
          },
          component: () => System.import('./base/views/tip')
        }
      ]
    }
  ]
}
