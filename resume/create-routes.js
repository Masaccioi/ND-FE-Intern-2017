export default () => {
  return [
    {
      path: '/',
      redirect: '/resume/home',
      component: () => System.import('./views/index'),
      children: [
        {
          path: 'home',
          meta: {
            auth: true,
            hidden: true,
            name: '个人履历'
          },
          component: () => System.import('./home/views/index')
        },
        {
          path: 'area',
          meta: {
            auth: true,
            hidden: true,
            name: '选择地区'
          },
          component: () => System.import('./area')
        },
        {
          path: 'area/:path',
          meta: {
            auth: true,
            hidden: true,
            name: '选择地区'
          },
          component: () => System.import('./area')
        },
        {
          path: 'basic/:groupId/:itemId',
          meta: {
            auth: true,
            hidden: true,
            name: '选择地区'
          },
          component: () => System.import('./home/components/basic')
        },
        {
          path: 'multi/:groupId',
          meta: {
            auth: true,
            hidden: true,
            name: 'multi group'
          },
          component: () => System.import('./multi')
        },
        {
          path: 'multi/:groupId/:itemId',
          meta: {
            auth: true,
            hidden: true,
            name: 'multi group'
          },
          component: () => System.import('./multi')
        }
      ]
    }
  ]
}
