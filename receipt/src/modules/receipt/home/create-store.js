import { createAction, handleAction } from 'vuex-actions'
import request from 'utils/request'
import rnd from 'utils/rnd'

export default () => {
  const FETCH_TEMPLATE = rnd('FETCH_TEMPLATE')

  const state = {
    template: [
      {
        "label": "电脑维修单",
        "id": 1
      },
      {
        "label": "年假申请",
        "id": 2
      },
      {
        "label": "不关机权限申请表",
        "id": 3
      }
    ]
  }

  const getters = {
    template: state => state.template
  }

  const actions = {
    fetchTemplate: createAction(FETCH_TEMPLATE, () => {
      return request('https://localhost:3003/template')
    })
  }

  const mutations = {
    [FETCH_TEMPLATE]: handleAction({
      pending: state => {
        state.template = {
          pending: true
        }
      },
      success: (state, mutation) => {
        state.template = { ...mutation }
      },
      error: state => {
        state.template = {
          ...state.template,
          error: true,
          pending: false
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
