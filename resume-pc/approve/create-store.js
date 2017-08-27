import { createAction, handleAction } from 'vuex-actions'
import rnd from 'utils/rnd'
import request from 'utils/request'
import { MT_RES } from 'utils/config'

export default ({ scope }) => {
  const FETCH_RESUME_AUDIT_LIST = rnd('FETCH_RESUME_AUDIT_LIST')
  const BATCH_AUDIT_RESUME = rnd('BATCH_AUDIT_RESUME')
  const AUDIT_RESUME = rnd('AUDIT_RESUME')

  const state = {
    auditList: {},
    auditMsg: {},
    auditCount: {}
  }

  const getters = {
    auditList: state => state.auditList,
    auditMsg: state => state.auditMsg
  }

  const { base: mtBase } = MT_RES

  const actions = {
    fetchResumeAuditList: createAction(FETCH_RESUME_AUDIT_LIST, ({ query }) => {
      return request(`${mtBase}/resume/template/audit/datas`, {
        query
      })
    }),
    auditResume: createAction(AUDIT_RESUME, ({ id, payload, unique, count }) => {
      return request(`${mtBase}/resume/template/audit/datas/${id}`, {
        method: 'PATCH',
        body: payload
      }).then(data => {
        return {
          unique,
          count
        }
      })
    }),
    batchAuditResume: createAction(BATCH_AUDIT_RESUME, ({ payload }) => {
      return request(`${mtBase}/resume/template/audit/datas/details/actions/approve`, {
        method: 'PATCH',
        body: payload
      })
    })
  }

  const mutations = {
    [FETCH_RESUME_AUDIT_LIST]: handleAction((state, mutation) => {
      state.auditList = { ...mutation }
    }),
    [AUDIT_RESUME]: handleAction((state, mutation) => {
      if (mutation.unique) {
        if (!state.auditCount[mutation.unique]) {
          state.auditCount[mutation.unique] = 0
        }
        state.auditCount[mutation.unique]++
        if (state.auditCount[mutation.unique] === mutation.count) {
          state.auditMsg = { type: 'AUDITED' }
          delete state.auditCount[mutation.unique]
        }
      }
    }),
    [BATCH_AUDIT_RESUME]: handleAction((state, mutation) => {
      state.auditMsg = { type: 'AUDITED' }
    })
  }

  return {
    state,
    getters,
    actions,
    mutations
  }
}
