import { createAction, handleAction } from 'vuex-actions'
import rnd from 'utils/rnd'
import { MD_RES } from 'utils/config'
import request from 'utils/request'

export default () => {
  const SELECT_TEMPLATE = rnd('SELECT_TEMPLATE')
  const FETCH_LOC_TEMPLATES = rnd('FETCH_LOC_TEMPLATES')
  const FETCH_LOC_TEMP_DETAIL = rnd('FETCH_LOC_TEMP_DETAIL')
  const FETCH_MY_DATAS = rnd('FETCH_MY_DATAS')
  const SET_SELECTED_QUERYS = rnd('SET_SELECTED_QUERYS')

  const state = {
    locTemplates: {},
    selectedTemplate: {},
    myDatas: {},
    selectedQuerys: []
  }

  const getters = {
    locTemplates: state => state.locTemplates,
    selectedTemplate: state => state.selectedTemplate,
    myDatas: state => state.myDatas,
    selectedQuerys: state => state.selectedQuerys
  }

  const { base: MDBase } = MD_RES

  const actions = {
    selectTemplate ({ state, commit }, payload) {
      commit(SELECT_TEMPLATE, payload)
    },
    selectQuerys ({ state, commit }, payload) {
      commit(SET_SELECTED_QUERYS, payload)
    },
    fetchLocTemplates: createAction(FETCH_LOC_TEMPLATES, () => {
      return request(`${MDBase}/client/local/source/templates`, {
        query: {
          $limit: 500
        }
      })
    }),
    fetchLocTempDetail: createAction(FETCH_LOC_TEMP_DETAIL, tid => {
      return request(`${MDBase}/local/source/templates/${tid}`)
    }),
    fetchMyDatas: createAction(FETCH_MY_DATAS, ({ tid, query }) => {
      return request(`${MDBase}/client/local/source/templates/${tid}/users/datas`, { query })
        .then(data => {
          return {
            ...data,
            id: tid,
            isAppend: !!query.$offset
          }
        })
    })
  }

  const mutations = {
    [SELECT_TEMPLATE] (state, payload) {
      state.selectedTemplate = payload
    },
    [FETCH_LOC_TEMPLATES]: handleAction({
      pending: state => {
        state.locTemplates = { loading: new Date() }
      },
      success: (state, mutation) => {
        state.locTemplates = { ...mutation }
      },
      error: state => {
        state.locTemplates = { error: new Date() }
      }
    }),
    [SET_SELECTED_QUERYS] (state, payload) {
      state.selectedQuerys = payload
    },
    [FETCH_MY_DATAS]: handleAction({
      pending: state => {
        state.myDatas = {
          ...state.myDatas,
          loading: new Date(),
          fail: false
        }
      },
      success: (state, mutation) => {
        if (mutation.isAppend) {
          state.myDatas = {
            ...state.myDatas,
            loading: false,
            fail: false,
            items: state.myDatas.items.concat(mutation.items)
          }
        } else {
          state.myDatas = { ...mutation }
        }
      },
      error: state => {
        state.myDatas = {
          ...state.myDatas,
          fail: new Date(),
          loading: false
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
