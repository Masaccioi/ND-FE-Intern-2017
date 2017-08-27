<template>
  <div class="ui-base-page">
    <c-form @submit.native.prevent="handleQuery">
      <div>
        <c-row class="item-row">
          <div class="item-label text-overflow">{{ __('user') }}</div>
          <div class="item-value item-user-name">{{ userLabel }}</div>
        </c-row>
        <c-row class="item-row" v-tap @tap.native="showTemplateList = !showTemplateList">
          <div class="item-label text-overflow">{{ __('want_search') }}</div>
          <div class="item-value">{{ selectedTemplate.name || __('choose') }}</div>
          <c-textfield type="hidden" field="templateId" :value="selectedTemplate.id" :validate="{
            required: { message: this.__('choose_template') }}"></c-textfield>
          <img class="c-row-select" :src="arrowDown"></img>
        </c-row>
        <c-row class="item-row" v-for="(item, index) in selectedQuerys" :key="index" v-tap @tap.native="handleShowDatePicker(index)">
          <div class="item-label">{{ item.label }}</div>
          <div class="item-value">
            <span v-if="item.value">{{ item.value | dateFormatter }}</span>
            <span v-else>{{ __('choose') }}</span>
          </div>
        </c-row>
      </div>
      <div class="form-errors" v-if="$validation.errors.length">
        <c-badge v-if="$validation.errors.length" class="warning" size="small">
          {{$validation.errors.filter(function (error) { return error.field === 'templateId' }).map(function (error) { return error.message }).join(' ')}}
        </c-badge>
      </div>
      <c-pane>
        <c-button class="primary" type="submit" size="large">
          {{__('query')}}
        </c-button>
      </c-pane>
    </c-form>
    <div class="template-help-info" v-html="selectedTemplate.help_info"></div>
    <div class="template-help-info-more" v-if="showMore">
      <router-link to="tip">{{ __('see_more')}}</router-link>
    </div>
    <div class="template-options" v-if="showTemplateList">
      <c-row class="item-row" v-for="item in templatesOptions" :key="item.id"
        v-tap.prevent @tap.native="handleSelectTemplate(item)">
        <div class="item-value">{{ item.name }}</div>
      </c-row>
      <c-row v-if="locTemplates.items && !locTemplates.items.length" class="item-row">
        <div class="no-result">{{ __('no_templates') }}</div>
      </c-row>
      <c-row v-if="locTemplates.loading" class="item-row">
        <div class="no-result"><c-spinner size="small"></c-spinner>{{ __('loading') + '..' }}</div>
      </c-row>
    </div>
    <c-modal class="date-picker" v-if="showDatePicker" :show="showDatePicker" :actions="datePickerActions"
      @submit="handleConfirm"
      @cancel="handleCloseDatePicker">
      <div class="date-picker-title">{{ selectedQuerys[pickTarget].label }}</div>
      <date-picker ref="datePicker" :data="pickedData"></date-picker>
    </c-modal>
    <div v-if="loading" class="loading-toast-wrapper">
      <div class="loading-toast">
        <img :src="loadingImg"></img>
        <p>{{ __('querying') + '..' }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import CForm from 'components/core/form'
import CPane from 'components/core/pane'
import CRow from 'components/core/row'
import CModal from 'components/core/modal'
import CButton from 'components/core/button'
import CBadge from 'components/core/badge'
import CSpinner from 'components/core/spinner'
import CTextfield from 'components/core/textfield'
import DatePicker from 'components/date'
import { mapGetters, mapActions } from 'vuex'
import datetime from 'nd-datetime'
import loadingImg from '../styles/images/general_load_medium_special.png'
import arrowDown from '../styles/images/general_arrow_down_icon_normal.png'
import { getNetStatus } from 'utils/sdk'
export default {
  data () {
    return {
      showTemplateList: false,
      showDatePicker: false,
      pickTarget: 0,
      loadingImg,
      arrowDown,
      showMore: false
    }
  },
  methods: {
    ...mapActions(['fetchLocTemplates', 'selectTemplate', 'selectQuerys', 'addToast', 'fetchLocTempDetail', 'fetchMyDatas', 'myDatas']),
    handleSelectTemplate (item) {
      this.selectTemplate(item)
      this.showTemplateList = false
    },
    handleShowDatePicker (index) {
      this.pickTarget = index
      this.showDatePicker = true
    },
    handleCloseDatePicker () {
      this.showDatePicker = false
    },
    handleConfirm () {
      const res = this.selectedQuerys.map((query, index) => {
        if (index === this.pickTarget) {
          return {
            ...query,
            value: this.$refs.datePicker.getValue().value
          }
        } else {
          return query
        }
      })
      this.selectQuerys(res)
      this.showDatePicker = false
    },
    handleQuery () {
      this.$validate().then(() => {
        const query = {
          $offset: 0,
          $limit: 30,
          $count: true
        }
        if (this.selectedQuerys && this.selectedQuerys.length) {
          query.$filter = this.selectedQuerys.filter(item => item.value).map(item => {
            return [`data.${item.key}(D)`, item.op, item.value].join(' ')
          }).join(' and ')
        }
        this.fetchMyDatas({
          tid: this.selectedTemplate.id,
          query
        })
      })
    }
  },
  filters: {
    dateFormatter (val) {
      return datetime(val).toString('yyyy/MM/dd')
    }
  },
  computed: {
    ...mapGetters(['selectedTemplate', 'selectedQuerys', 'userInfo', 'locTemplates', 'myDatas']),
    loading () {
      return this.myDatas && this.myDatas.loading || false
    },
    userLabel () {
      return this.userInfo && this.userInfo.org_exinfo && (this.userInfo.org_exinfo.nick_name || this.userInfo.org_exinfo.real_name) || this.userInfo.user_id
    },
    templatesOptions () {
      return this.locTemplates && this.locTemplates.items || []
    },
    datePickerActions () {
      return {
        cancel: {
          label: this.__('cancel'),
          class: ''
        },
        submit: {
          label: this.__('ok'),
          class: 'primary'
        }
      }
    },
    queryOptions () {
      if (this.selectedTemplate.id) {
        const keyMap = this.selectedTemplate.key_map
        const queryMap = this.selectedTemplate.query_enable_map
        const typeMap = this.selectedTemplate.data_type_map
        if (keyMap && queryMap && typeMap) {
          const queryKeys = Object.keys(queryMap).filter(key => queryMap[key])
          const dateQuerys = queryKeys.filter(key => typeMap[key] === 'DATE')
          return dateQuerys.map(key => {
            return {
              key,
              label: keyMap[key]
            }
          })
        }
      }
      return []
    },
    pickedData () {
      return {
        value: this.selectedQuerys[this.pickTarget].value || Date.now()
      }
    }
  },
  watch: {
    queryOptions (val) {
      if (val) {
        const res = []
        const today = new Date()
        const lastYearToday = new Date(`${today.getFullYear() - 1}/${today.getMonth() + 1}/${today.getDate()} 00:00`)
        val.forEach(option => {
          res.push({
            key: option.key,
            label: this.__('start') + option.label,
            op: 'ge',
            value: lastYearToday.getTime()
          })
          res.push({
            key: option.key,
            label: this.__('deadline') + option.label,
            op: 'le',
            value: Date.now()
          })
        })
        this.selectQuerys(res)
      }
    },
    myDatas (val) {
      if (val && val.fail && getNetStatus()) {
        this.addToast(this.__('data_fail'))
      } else if (val && !val.fail && !val.loading) {
        this.$router.push('/source/result')
      }
    },
    locTemplates (val) {
      if (val && val.error) {
        this.addToast(this.__('template_fail'))
      }
    },
    selectedTemplate (val) {
      this.$nextTick(() => {
        const helpInfo = document.getElementsByClassName('template-help-info')[0]
        this.showMore = helpInfo.scrollHeight > helpInfo.clientHeight
      })
    }
  },
  created () {
    if (!this.templatesOptions.length) {
      this.fetchLocTemplates()
    }
  },
  mounted () {
    document.title = this.__('data_query')
    const helpInfo = document.getElementsByClassName('template-help-info')[0]
    this.showMore = helpInfo.scrollHeight > helpInfo.clientHeight
  },
  validator: {
    auto: false
  },
  // directives: {
  //   tap
  // },
  components: {
    CForm,
    CRow,
    CModal,
    DatePicker,
    CTextfield,
    CButton,
    CBadge,
    CPane,
    CSpinner
  }
}
</script>
<style src="../styles/index.css"></style>
