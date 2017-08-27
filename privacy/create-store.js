import { createAction, handleAction } from 'vuex-actions'
import rnd from 'utils/rnd'
import request from 'utils/request'

import { PR_RES } from 'utils/config'

export default ({ scope }) => {
  const FETCH_PRIVACY_LIST = rnd('FETCH_PRIVACY_LIST')
  const ADD_PRIVACY = rnd('ADD_PRIVACY')
  const EDIT_PRIVACY = rnd('EDIT_PRIVACY')
  const FETCH_PRIVACY_DETAIL = rnd('FETCH_PRIVACY_DETAIL')
  const DEL_PRIVACY = rnd('DEL_PRIVACY')

  const state = {
    privacyList: {},
    privacyDetail: {},
    msg: {},
    delCount: {}
  }
  const getters = {
    privacyList: state => state.privacyList,
    privacyDetail: state => state.privacyDetail,
    msg: state => state.msg,
    delCount: state => state.delCount
  }

  const { base: prBase } = PR_RES

  const actions = {
    fetchPrivacyList: createAction(FETCH_PRIVACY_LIST, ({ query }) => {
      return request(`${prBase}/privacies`, { query })
    }),
    addPrivacy: createAction(ADD_PRIVACY, ({ payload }) => {
      return request(`${prBase}/privacies`, {
        method: 'POST',
        body: payload
      })
    }),
    editPrivacy: createAction(EDIT_PRIVACY, ({ id, payload, index }) => {
      return request(`${prBase}/privacies/${id}`, {
        method: 'PUT',
        body: payload
      }).then(data => {
        return {
          index,
          data
        }
      })
    }),
    fetchPrivacyDetail: createAction(FETCH_PRIVACY_DETAIL, id => {
      return request(`${prBase}/privacies/${id}`)
    }),
    deletePrivacy: createAction(DEL_PRIVACY, ({ id, multi, index }) => {
      return request(`${prBase}/privacies/${id}`, {
        method: 'DELETE'
      }).then(data => {
        return { multi, index }
      })
    })
  }
  const mutations = {
    [FETCH_PRIVACY_LIST]: handleAction((state, mutation) => {
      state.privacyList = { ...mutation }
    }),
    [ADD_PRIVACY]: handleAction({
      success: (state, mutation) => {
        state.msg = {
          type: 'ADDED'
        }
        if (mutation && state.privacyList.items) {
          state.privacyList.items.unshift(mutation)
          state.privacyList.count++
        }
      },
      error: (state, mutation) => {
        state.msg = {
          type: 'FAILED'
        }
      }
    }),
    [EDIT_PRIVACY]: handleAction({
      success: (state, mutation) => {
        state.msg = {
          type: 'EDITED'
        }
        if (mutation && state.privacyList.items && state.privacyList.items[mutation.index]) {
          state.privacyList.items.splice(mutation.index, 1, mutation.data)
        }
      },
      error: (state, mutation) => {
        state.msg = {
          type: 'FAILED'
        }
      }
    }),
    [DEL_PRIVACY]: handleAction((state, mutation) => {
      if (mutation.multi) {
        if (!state.delCount[mutation.multi.uniqueId]) {
          state.delCount[mutation.multi.uniqueId] = 1
        } else {
          state.delCount[mutation.multi.uniqueId]++
        }
        if (state.delCount[mutation.multi.uniqueId] === mutation.multi.count) {
          state.msg = {
            type: 'MULTI-DELETED',
            time: new Date().getTime()
          }
        }
      } else {
        state.msg = {
          type: 'DELETED'
        }
        if (mutation && state.privacyList.items && state.privacyList.items[mutation.index]) {
          state.privacyList.items.splice(mutation.index, 1)
          state.privacyList.count--
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
