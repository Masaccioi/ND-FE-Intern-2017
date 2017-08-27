<template>
  <div class="basic-group">
    <transition name="fade">
      <div v-show="showAuditFail" class="audit-fail-info">
          <span>{{ __('{0}中的{1}审核不通过，请修改', groupName, 'xx')}}</span>
          <img @click.stop="showAuditFail = false" :src="closeIcon">
      </div>
    </transition>
    <p class="info-title">{{ groupName }}</p>
    <c-row v-for="item in groupItems" :key="item.id" class="info-row" link @click.stop.native="handleRowClick(item, $event)">
      <c-col>
        <c-label class="row-label">{{ item.label }}</c-label>
        <c-label class="row-value">{{format(item, formData[item.key.replace(/\./g, '_nodot_')])}}</c-label>
      </c-col>
      <c-audit-warn v-if="getAuditStatus(item) !== 1">
        {{ getAuditStatus(item) === 0 ? __('审核中') : __('审核不通过')}}
      </c-audit-warn>
    </c-row>
    <c-single
      :visible="sheetVisible"
      @cancel="handleSheetCancel"
      @ok="handleSheetOk"
      :options="options"></c-single>
    <date-picker :visible="pickerVisible" @ok="handlePickerOk" @cancel="handlePickerCancel" :min="`1900-1-1`"></date-picker>
  </div>
</template>
<script>
import CRow from 'components/core/row'
import CCol from 'components/core/col'
import CLabel from 'components/core/label'
import CAuditWarn from 'components/audit-warn'
import CSingle from 'components/single'
import DatePicker from 'components/date-picker'
import datetime from 'nd-datetime'
import gb2260 from 'nd-gb2260'

import closeIcon from '../styles/images/personal_system_icon_close.png'

import { mapGetters, mapActions } from 'vuex'
gb2260.register('201607', require('nd-gb2260/lib/201607'))
const gb = new gb2260.GB2260(gb2260.revisions()[0])
export default {
  name: 'BasicGroup',
  props: {
    group: {
      type: Object,
      defualt: () => ({})
    }
  },
  data () {
    return {
      closeIcon,
      showAuditFail: false,
      options: [],
      pickerVisible: false,
      sheetVisible: false,
      activeName: '',
      formData: {}
    }
  },
  computed: {
    ...mapGetters(['userResume', 'area', 'staged', 'auditLog']),
    groupItems () {
      return this.group.items || []
    },
    groupName () {
      return this.group.group_name
    },
    groupId () {
      return this.group.group_id
    },
    userData () {
      const arr = this.userResume[this.groupId] || []
      return arr[0] ? arr[0] : {}
    },
    localSourceId () {
      return this.userData.id || ''
    },
    auditStatus () {
      return this.userData.data_audit_status || {}
    }
  },
  watch: {
    auditStatus () {
      this.showAuditFail = this.auditLog.length > 0
    },
    'userResume.pending' (pending) {
      if (!pending) {
        if (this.saved) {
          if (this.toast && !this.userResume.error) {
            this.addToast(this.toast)
          }
          this.fetchUserResume({})
          this.saved = null
        } else {
          this.mapDataToFormData()
        }
      }
    }
  },
  methods: {
    ...mapActions(['setAreaNext', 'setArea', 'stageData', 'editResume', 'addResume', 'addToast', 'fetchAuditLog', 'fetchUserResume', 'deleteResume']),
    saveData () {
      if (!this.userResume.pending) {
        if (this.localSourceId) {
          this.editResume({
            id: this.localSourceId,
            payload: {
              data: this.formData
            }
          })
          this.toast = this.__('编辑成功')
        } else {
          this.addResume({
            id: this.groupId,
            payload: {
              data: this.formData
            }
          })
          this.toast = this.__('新增成功')
        }
        this.saved = true
        // 这个操作应当在结果返回之后进行，因为请求可能失败
        // this.addToast(this.toast)
      }
    },
    mapDataToFormData () {
      const data = this.staged.data || this.userData['data'] || {}
      let sep
      this.groupItems.map(item => {
        if (item.type === 'AREA') sep = item.constraint.sep || ' '
        this.formData[item.key.replace(/\./g, '_nodot_')] = data[item.key.replace(/\./g, '_nodot_')]
      })
      if (this.staged.key && this.area.data) {
        this.formData[this.staged.key] = this.area.data.map(item => item.value).join(sep)
        this.saveData()
      }
      this.stageData()
    },
    handleRowClick (item) {
      this.activeName = item.key.replace(/\./g, '_nodot_')
      switch (item.type) {
        case 'BIRTHDAY':
        case 'DATE':
          this.pickerVisible = true
          break
        case 'SINGLE':
          this.sheetVisible = true
          if (item.constraint && item.constraint.data) {
            this.options = item.constraint.data
          }
          break
        case 'AREA':
          this.setAreaNext(this.$route.fullPath)
          this.stageData({
            data: this.formData,
            key: this.activeName
          })
          this.$router.push('/resume/area')
          break
        case 'MOBILE':
        case 'EMAIL':
        case 'TEXT':
          this.$router.push(`/resume/basic/${this.group.group_id}/${item.id}`)
          break
        default:
          console.warn('Unsupported type')
          break
      }
    },
    handlePickerOk (date) {
      this.formData[this.activeName] = date
      this.pickerVisible = false
      this.saveData()
    },
    handlePickerCancel () {
      this.pickerVisible = false
    },
    handleSheetOk (value) {
      this.formData[this.activeName] = value.toString()
      this.sheetVisible = false
      this.saveData()
    },
    handleSheetCancel () {
      this.sheetVisible = false
    },
    format (item, value) {
      const { constraint = {} } = item
      const { pattern: defaultPattern = 'yyyy-MM-dd', hideYear, data = [] } = constraint
      let pattern = defaultPattern
      if (hideYear) {
        pattern = 'MM-dd'
      }
      if (!value) {
        return
      }
      switch (item.type) {
        case 'BIRTHDAY':
        case 'DATE':
          return datetime(value).format(pattern)
        case 'SINGLE':
          return this.sheetFormat(data, value)
        case 'AREA':
          const sep = item.constraint.sep || ','
          return value.split(sep).map(code => gb.get(code).name).join('')
        default:
          return value
      }
    },
    sheetFormat (data, value) {
      let result
      data.forEach(item => {
        if (item.value === value.toString()) {
          result = item.label
        }
      })
      return result
    },
    getAuditStatus (item) {
      const status = this.auditStatus[item.key.replace(/\./g, '_nodot_')]
      if (typeof status !== 'number') {
        return 1
      }
      return status
    }
  },
  created () {
    // 这里也需要，以防止 useResume 比 template 先返回
    this.mapDataToFormData()
    this.fetchAuditLog()
    // this.deleteResume({
    //   id: '599e8d9245cec11309ea55d5'
    // })
  },
  components: {
    CRow,
    CCol,
    CLabel,
    CAuditWarn,
    CSingle,
    DatePicker
  }
}
</script>
<style>
.basic-group{
  & .info-row{
    & .c-audit-warn{
      & .c-audit-info{
        margin-right: -dpr(20px);
      }
    }
  }
}
</style>
