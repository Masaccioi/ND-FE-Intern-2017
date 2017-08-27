import { createAction, handleAction } from 'vuex-actions'
import { MD_RES } from 'utils/config'
import request from 'utils/request'
import rnd from 'utils/rnd'

export default () => {
  const FETCH_TEMPLATE = rnd('FETCH_TEMPLATE')
  const FETCH_USER_RESUME = rnd('FETCH_USER_RESUME')
  const SAVE_BUTTON_CLICK = rnd('SAVE_BUTTON_CLICK')
  const ADD_RESUME = rnd('ADD_RESUME')
  const EDIT_RESUME = rnd('EDIT_RESUME')
  const DELETE_RESUME = rnd('DELETE_RESUME')
  const FETCH_AUDIT_LOG = rnd('FETCH_AUDIT_LOG')

  const state = {
    template: {
      pending: false
    },
    userResume: {
      pending: false
    },
    msg: {},
    saveBtn: {
      id: null
    },
    auditLog: {}
  }

  const getters = {
    template: state => state.template,
    userResume: state => state.userResume,
    msg: state => state.msg,
    saveBtn: state => state.saveBtn,
    auditLog: state => state.auditLog
  }
  const { base: MDBase } = MD_RES

  const actions = {
    clickSaveBtn: createAction(SAVE_BUTTON_CLICK, () => ({})),
    fetchTemplate: createAction(FETCH_TEMPLATE, () => {
      return request(`${MDBase}/client/resume/template`)
    }),
    fetchUserResume: createAction(FETCH_USER_RESUME, ({ payload }) => {
      return request(`${MDBase}/client/resume/template/users/datas`, { payload })
    }),
    addResume: createAction(ADD_RESUME, ({ id, payload }) => {
      return request(`${MDBase}/client/resume/template/${id}/users/datas`, {
        method: 'POST',
        body: payload
      })
    }),
    editResume: createAction(EDIT_RESUME, ({ id, payload }) => {
      return request(`${MDBase}/client/resume/template/users/datas/${id}`, {
        method: 'PUT',
        body: payload
      })
    }),
    deleteResume: createAction(DELETE_RESUME, ({ id }) => {
      return request(`${MDBase}/client/resume/template/users/datas/${id}`, {
        method: 'DELETE'
      })
    }),
    fetchAuditLog: createAction(FETCH_AUDIT_LOG, () => {
      return request(`${MDBase}/client/resume/template/users/datas/logs`)
    })
  }

  const mutations = {
    [SAVE_BUTTON_CLICK]: handleAction((state, mutation) => {
      state.saveBtn = {
        id: `${rnd('save-btn-click')}-${Date.now()}`
      }
    }),
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
    }),
    [FETCH_USER_RESUME]: handleAction({
      pending: (state, mutation) => {
        state.userResume = {
          ...state.userResume,
          pending: true
        }
      },
      success: (state, mutation) => {
        state.userResume = {
          ...mutation,
          pending: false
        }
      },
      error: state => {
        state.userResume = {
          ...state.userResume,
          error: true,
          pending: false
        }
      }
    }),
    [ADD_RESUME]: handleAction({
      pending: state => {
        state.userResume = {
          ...state.userResume,
          pending: true
        }
      },
      success: (state, mutation) => {
        state.userResume = {
          ...state.userResume,
          pending: false
        }
        state.msg = {
          type: 'ADDED'
        }
      },
      error: state => {
        state.userResume = {
          ...state.userResume,
          error: true,
          pending: false
        }
      }
    }),
    [EDIT_RESUME]: handleAction({
      pending: state => {
        state.userResume = {
          ...state.userResume,
          pending: true
        }
      },
      success: (state, mutation) => {
        state.userResume = {
          ...state.userResume,
          pending: false
        }
        state.msg = {
          type: 'EDITED'
        }
      },
      error: state => {
        state.userResume = {
          ...state.userResume,
          error: true,
          pending: false
        }
      }
    }),
    [DELETE_RESUME]: handleAction({
      pending: state => {
        state.userResume = {
          ...state.userResume,
          pending: true
        }
      },
      success: (state, mutation) => {
        state.userResume = {
          ...state.userResume,
          pending: false
        }
        state.msg = {
          type: 'DELETED'
        }
      },
      error: state => {
        state.userResume = {
          ...state.userResume,
          error: true,
          pending: false
        }
      }
    }),
    [FETCH_AUDIT_LOG]: handleAction({
      pending: state => ({}),
      success: (state, mutation) => {
        state.auditLog = { ...mutation }
      },
      error: state => ({})
    })
  }

  return {
    state,
    getters,
    actions,
    mutations
  }
}
