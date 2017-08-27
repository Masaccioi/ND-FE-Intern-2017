import { createAction, handleAction } from 'vuex-actions'
import rnd from 'utils/rnd'
import { UC_RES } from 'utils/config'
import request from 'utils/request'

export default () => {
  const SET_USERINFO = rnd('SET_USERINFO')
  const CHECK_PASSWORD = rnd('CHECK_PASSWORD')

  const state = {
    userInfo: {},
    isValid: {
      value: false,
      date: 0
    }
  }

  const getters = {
    userInfo: state => state.userInfo,
    isValid: state => state.isValid
  }

  const { base: UC_BASE } = UC_RES

  const actions = {
    setUserInfo ({ state, commit }, payload) {
      commit(SET_USERINFO, payload)
    },
    checkPassword: createAction(CHECK_PASSWORD, ({ payload }) => {
      return request(`${UC_BASE}/tokens`, {
        method: 'POST',
        body: payload
      })
    })
  }

  const mutations = {
    [SET_USERINFO] (state, payload) {
      state.userInfo = payload
    },
    [CHECK_PASSWORD]: handleAction({
      success (state, mutation) {
        state.isValid = {
          value: true,
          date: new Date()
        }
      },
      error (state) {
        state.isValid = {
          value: false,
          date: new Date()
        }
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
