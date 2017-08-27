export default () => {
  return [
    {
      path: '/resume',
      redirect: '/resume/list',
      meta: {
        icon: 'clipboard',
        auth: true,
        name: '个人履历管理',
        level: '7',
        module: 'model'
      },
      component: () => System.import('./views/index'),
      children: [
        {
          path: 'list',
          meta: {
            icon: 'toggle',
            auth: true,
            name: '履历模板选择'
          },
          component: () => System.import('./list/views/index')
        }, {
          path: 'list/:id',
          meta: {
            icon: 'toggle',
            auth: true,
            hidden: true,
            name: '查看模板'
          },
          component: () => System.import('./list/views/detail/index')
        }, {
          path: 'data',
          meta: {
            icon: 'document-text',
            auth: true,
            name: '履历数据管理'
          },
          component: () => System.import('./datas/views/index')
        }, {
          path: 'data/:id',
          meta: {
            icon: 'edit',
            auth: true,
            hidden: true,
            name: '编辑履历'
          },
          component: () => System.import('./datas/views/edit/index')
        }, {
          path: 'approve',
          meta: {
            icon: 'checkmark-circled',
            auth: true,
            name: '履历审核管理'
          },
          component: () => System.import('./approve/views/index')
        }, {
          path: 'approve/:id',
          meta: {
            icon: 'checkmark-circled',
            auth: true,
            hidden: true,
            name: '查看内容'
          },
          component: () => System.import('./approve/views/check/index')
        }
      ]
    }
  ]
}
