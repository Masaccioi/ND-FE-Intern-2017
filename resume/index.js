import createRoutes from './create-routes'
import createStore from './create-store'

export default (context, options = {}, register) => {
  options = { scope: 'resume', ...options }
  register({
    routes: createRoutes(options),
    store: createStore(options),
    ...options
  })
}
