import createStore from './create-store'

export default (context, options = {}, register) => {
  register({
    store: createStore(options)
  }, ({ store }) => {
    // store plugin
    // 实现进度条、错误提示
    store.subscribe(({ payload }) => {
      if (!payload || !payload.__status__) {
        return
      }
      switch (payload.__status__) {
        case 'pending':
          store.dispatch('setProgress', 60)
          break
        case 'success':
          store.dispatch('setProgress', 100)
          break
        case 'error':
          store.dispatch('setProgress', 100)
          store.dispatch('addToast', payload.__payload__)
          break
        default:
          // setProgress(0)
      }
    })
  })
}
