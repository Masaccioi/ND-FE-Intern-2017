import createRoutes from './create-routes'
import createStore from './create-store'

export default (context, options = {}, register) => {
  options = { scope: 'privacy', ...options }
  register({
    routes: createRoutes(options),
    store: createStore(options),
    ...options
  })
}
