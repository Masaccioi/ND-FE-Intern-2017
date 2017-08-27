import { createAction, handleAction } from 'vuex-actions'
import rnd from 'utils/rnd'

export default () => {
  const STAGE_DATA = rnd('STAGE_DATA')
  const state = {
    staged: {}
  }

  const getters = {
    staged: state => state.staged
  }

  const actions = {
    stageData: createAction(STAGE_DATA, data => data)
  }

  const mutations = {
    [STAGE_DATA]: handleAction((state, mutation = {}) => {
      state.staged = { ...mutation }
    })
  }

  return {
    state,
    getters,
    actions,
    mutations
  }
}
