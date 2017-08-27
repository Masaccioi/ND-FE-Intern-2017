export default () => {
  return [
    {
      path: '/',
      redirect: '/receipt/home',
      component: () => System.import('./views/index'),
      children: [
        {
          path: 'home',
          meta: {
            auth: true,
            hidden: true,
            name: '单据申请'
          },
          component: () => System.import('./home/views/index')
        },
        {
          path: 'mine',
          meta: {
            auth: true,
            hidden: true,
            name: '我的单据'
          },
          component: () => System.import('./mine/views/index')
        },
        {
          path: 'edit',
          meta: {
            auth: true,
            hidden: true,
            name: '单据编辑'
          },
          component: () => System.import('./home/views/edit/index')
        },
        {
          path: 'approve',
          meta: {
            auth: true,
            hidden: true,
            name: '单据审核'
          },
          component: () => System.import('./approve/views/index')
        }
      ]
    }
  ]
}
