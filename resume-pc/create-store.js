const storeCreators = []

const moduleContext = require.context('./', true, /create-store\.js/)

moduleContext.keys().map(module => {
  if (!/\.\/create-store\.js/.test(module)) {
    storeCreators.push(moduleContext(module))
  }
})

const combineStore = (...args) => {
  const store = {
    state: {},
    actions: {},
    mutations: {},
    getters: {}
  }
  args.map(arg => {
    store.state = {
      ...store.state,
      ...arg.state
    }
    store.actions = {
      ...store.actions,
      ...arg.actions
    }
    store.mutations = {
      ...store.mutations,
      ...arg.mutations
    }
    store.getters = {
      ...store.getters,
      ...arg.getters
    }
  })
  return store
}

export default options => {
  const stores = storeCreators.map(createStore => createStore(options))
  return combineStore(...stores)
}
