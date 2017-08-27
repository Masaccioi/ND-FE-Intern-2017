export default () => {
  return [
    {
      path: '/privacy',
      redirect: '/privacy/list',
      meta: {
        icon: 'settings',
        auth: true,
        name: '隐私配置',
        level: '7',
        module: 'privacy'
      },
      component: () => System.import('./views/index'),
      children: [
        {
          path: 'list',
          meta: {
            icon: 'clipboard',
            auth: true,
            name: '隐私配置',
            level: '7'
          },
          component: () => System.import('./views/index')
        }
      ]
    }
  ]
}
