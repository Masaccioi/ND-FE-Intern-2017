import { createAction, handleAction } from 'vuex-actions'
import rnd from 'utils/rnd'
import request from 'utils/request'
import { MT_RES } from 'utils/config'

export default ({ scope }) => {
  const FETCH_RESUME_DATA = rnd('FETCH_RESUME_DATA')
  const IMPORT_RESUME_DATA = rnd('IMPORT_RESUME_DATA')
  const FETCH_USER_RESUME_DATA = rnd('FETCH_USER_RESUME_DATA')
  const EDIT_USER_RESUME_DATA = rnd('EDIT_USER_RESUME_DATA')
  const DELETE_USER_RESUME_DATA = rnd('DELETE_USER_RESUME_DATA')

  const state = {
    resumeDataList: {},
    uploadRes: {},
    resumeUserData: {},
    dataMsg: {},
    delCount: {}
  }

  const getters = {
    resumeDataList: state => state.resumeDataList,
    uploadRes: state => state.uploadRes,
    resumeUserData: state => state.resumeUserData,
    dataMsg: state => state.dataMsg
  }

  const { base: mtBase } = MT_RES

  const actions = {
    fetchResumeDataList: createAction(FETCH_RESUME_DATA, ({ query }) => {
      return request(`${mtBase}/resume/template/datas`, {
        query
      })
    }),
    importResumeDatas: createAction(IMPORT_RESUME_DATA, dentryId => {
      return request(`${mtBase}/resume/template/datas/upload`, {
        method: 'POST',
        body: {
          dentry_id: dentryId
        }
      })
    }),
    fetchUserResumeData: createAction(FETCH_USER_RESUME_DATA, ({ uid, needAudit = false }) => {
      return request(`${mtBase}/resume/template/${uid}/datas?need_audit_data=${needAudit}`)
    }),
    editUserResumeData: createAction(EDIT_USER_RESUME_DATA, ({ payload }) => {
      return request(`${mtBase}/local/source/templates/datas/actions/update`, {
        method: 'PUT',
        body: payload
      }).then(data => {
        return {
          data
        }
      })
    }),
    deleteUserResumeData: createAction(DELETE_USER_RESUME_DATA, ({ uid, index, count, unique }) => {
      return request(`${mtBase}/resume/template/${uid}/datas`, {
        method: 'DELETE'
      }).then(data => {
        return {
          index,
          count,
          unique
        }
      })
    })
  }

  const mutations = {
    [FETCH_RESUME_DATA]: handleAction((state, mutation) => {
      state.resumeDataList = { ...mutation }
    }),
    [IMPORT_RESUME_DATA]: handleAction({
      success: (state, mutation) => {
        state.uploadRes = { ...mutation }
      },
      error: state => {
        state.uploadRes = { fail: Date.now() }
      }
    }),
    [FETCH_USER_RESUME_DATA]: handleAction({
      pending: (state, mutation) => {
        state.resumeUserData = {
          ...state.resumeUserData,
          pending: true
        }
      },
      success: (state, mutation) => {
        state.resumeUserData = {
          ...mutation,
          pending: false
        }
      },
      error: state => {
        state.resumeUserData = {
          ...state.resumeUserDatas,
          error: true,
          pending: false
        }
      }
    }),
    [EDIT_USER_RESUME_DATA]: handleAction((state, mutation) => {
      state.resumeUserData = { ...mutation }
      state.dataMsg = { type: 'EDITED' }
    }),
    [DELETE_USER_RESUME_DATA]: handleAction((state, mutation) => {
      if (mutation) {
        if (mutation.unique) {
          // 批量删除
          if (!state.delCount[mutation.unique]) {
            state.delCount[mutation.unique] = 0
          }
          state.delCount[mutation.unique]++
          if (state.delCount[mutation.unique] === mutation.count) {
            state.dataMsg = { type: 'MULTI-DELETED' }
          }
        } else {
          // 单个删除
          if (mutation && state.resumeDataList.items && state.resumeDataList.items[mutation.index]) {
            state.resumeDataList.items.splice(mutation.index, 1)
            state.resumeDataList.count--
          }
          state.dataMsg = { type: 'DELETED' }
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
