import { createAction, handleAction } from 'vuex-actions'
import rnd from 'utils/rnd'

export default () => {
  const SET_AREA_NEXT = rnd('SET_AREA_NEXT')
  const SET_AREA = rnd('SET_AREA')

  const state = {
    area: {
      next: '',
      data: []
    }
  }

  const getters = {
    area: state => state.area
  }

  const actions = {
    setArea: createAction(SET_AREA, data => data),
    setAreaNext: createAction(SET_AREA_NEXT, next => next)
  }

  const mutations = {
    [SET_AREA]: handleAction((state, data) => {
      state.area = {
        ...state.area,
        data
      }
    }),
    [SET_AREA_NEXT]: handleAction((state, next) => {
      state.area = {
        ...state.area,
        next
      }
    })
  }

  return {
    state,
    getters,
    actions,
    mutations
  }
}
