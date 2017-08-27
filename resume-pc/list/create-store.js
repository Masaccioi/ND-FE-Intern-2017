import { createAction, handleAction } from 'vuex-actions'
import rnd from 'utils/rnd'
import request from 'utils/request'
import { MT_RES } from 'utils/config'

export default ({ scope }) => {
  const FETCH_RESUME_TEMPLATE = rnd('FETCH_RESUME_TEMPLATE')
  const SELECT_RESUME_TEMPLATE = rnd('SELECT_RESUME_TEMPLATE')
  const ACTIVATE_RESUME_TEMPLATE = rnd('ACTIVATE_RESUME_TEMPLATE')

  const state = {
    resumeTemplate: {},
    msg: {}
  }

  const getters = {
    resumeTemplate: state => state.resumeTemplate,
    msg: state => state.msg
  }

  const { base: mtBase } = MT_RES

  const actions = {
    fetchResumeTemplate: createAction(FETCH_RESUME_TEMPLATE, () => {
      return request(`${mtBase}/resume/template?need_model_info=true`)
    }),
    selectResumeTemplate: createAction(SELECT_RESUME_TEMPLATE, id => {
      return request(`${mtBase}/resume/template/actions/select`, {
        method: 'PUT',
        body: {
          selected_model_id: id
        }
      })
    }),
    activateResumeTemplate: createAction(ACTIVATE_RESUME_TEMPLATE, id => {
      return request(`${mtBase}/resume/template/actions/activate`)
    })
  }

  const mutations = {
    [FETCH_RESUME_TEMPLATE]: handleAction((state, mutation) => {
      state.resumeTemplate = { ...mutation }
    }),
    [SELECT_RESUME_TEMPLATE]: handleAction((state, mutation) => {
      state.msg = { type: 'SELECTED' }
      state.resumeTemplate = { ...mutation }
    }),
    [ACTIVATE_RESUME_TEMPLATE]: handleAction((state, mutation) => {
      state.msg = { type: 'ACTIVATED' }
      state.resumeTemplate = { ...mutation }
    })
  }

  return {
    state,
    getters,
    actions,
    mutations
  }
}
