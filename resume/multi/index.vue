<template>
  <div class="multi-group-items">
    <c-row v-for="item in groupItems" :key="item.id" class="item-row" @click.stop.native="handleRowClick(item, $event)">
      <c-col class="item-col">
        <c-label class="item-label">{{ item.label }}</c-label>
        <c-textfield
          :readonly="isReadonly(item)"
          :placeholder="item.placeholder"
          :value="format(item, formData[item.key.replace(/\./g, '_nodot_')])"
          @change="handleInputChange($event, item)"
          @blur.native="rules"
          class="item-value"></c-textfield>
        <c-audit-warn v-if="getAuditStatus(item) !== 1">
          {{ getAuditStatus(item) === 0 ? __('审核中') : __('审核不通过')}}
        </c-audit-warn>
      </c-col>
    </c-row>
    <transition name="fade">
      <c-warn v-if="error" class="warning">
        {{error}}
      </c-warn>
    </transition>
    <c-warn>{{__('{0}修改后需要审核才开发查阅，请慎重填写', groupName)}}</c-warn>
    <c-button class="delete-btn" v-if="itemId" @click.native="deleteInfo">{{__('删除信息')}}</c-button>
    <c-single
      :visible="sheetVisible"
      @cancel="handleSheetCancel"
      @ok="handleSheetOk"
      :options="options"></c-single>
    <date-picker :visible="pickerVisible" 
      @ok="handlePickerOk" 
      @cancel="handlePickerCancel" 
      :min="`1900-1-1`" 
      :value="formData[activeName]"></date-picker>
    <c-modal :show="modalVisible"
      @cancel="handleModalCancel"
      @submit="handleModalOk"
      :actions="modalActions">
        <div class="title">{{__('删除提示')}}</div>
        <div class="content">{{__('确定要删除{0}', groupName)}}</div>
    </c-modal>
  </div>
</template>
<script>
import CRow from 'components/core/row'
import CCol from 'components/core/col'
import CLabel from 'components/core/label'
import CAuditWarn from 'components/audit-warn'
import CWarn from 'components/warn'
import CSingle from 'components/single'
import DatePicker from 'components/date-picker'
import CTextfield from 'components/core/textfield'
import CButton from 'components/core/button'
import CModal from 'components/core/modal'
import datetime from 'nd-datetime'
import gb2260 from 'nd-gb2260'

import { mapGetters, mapActions } from 'vuex'
gb2260.register('201607', require('nd-gb2260/lib/201607'))
const gb = new gb2260.GB2260(gb2260.revisions()[0])
export default {
  name: 'MultiItem',
  data () {
    return {
      options: [],
      pickerVisible: false,
      sheetVisible: false,
      modalVisible: false,
      groupId: this.$route.params.groupId,
      itemId: this.$route.params.itemId,
      modalActions: {
        cancel: {
          label: this.__('取消'),
          class: 'primary'
        },
        submit: {
          label: this.__('确定'),
          class: 'primary'
        }
      },
      error: null,
      formData: {},
      activeName: ''
    }
  },
  computed: {
    ...mapGetters(['userResume', 'template', 'saveBtn', 'staged', 'area']),
    group () {
      const { groups = [] } = this.template
      return groups.find(group => group.group_id === this.groupId)
    },
    groupItems () {
      return this.group.items || []
    },
    groupName () {
      return this.group.group_name
    },
    userData () {
      const arr = this.userResume[this.groupId] || []
      return arr.filter(item => item.id === this.itemId)[0] || {}
    },
    auditStatus () {
      return this.userData.data_audit_status || {}
    }
  },
  watch: {
    'saveBtn.id' (id) {
      if (id) {
        this.rules()
        if (this.error) {

        } else {
          this.saveData()
        }
      }
    },
    'userResume.pending' (pending) {
      if (!pending && !this.userResume.error) {
        this.addToast(this.toast)
        this.$router.replace('/resume/home')
      }
    }
  },
  methods: {
    ...mapActions(['addResume', 'deleteResume', 'editResume', 'addToast', 'setAreaNext', 'stageData']),
    handleInputChange (value, item) {
      this.formData[item.key.replace(/\./g, '_nodot_')] = value
    },
    handleRowClick (item) {
      this.activeName = item.key.replace(/\./g, '_nodot_')
      if (this.isReadonly(item)) {
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
          default:
            console.warn('Unsupported type')
            break
        }
      }
    },
    handlePickerOk (date) {
      this.formData[this.activeName] = date
      this.pickerVisible = false
    },
    handlePickerCancel () {
      this.pickerVisible = false
    },
    handleSheetOk (value) {
      this.sheetVisible = false
      this.formData[this.activeName] = value.toString()
    },
    handleSheetCancel () {
      this.sheetVisible = false
    },
    handleModalCancel () {
      this.modalVisible = false
    },
    handleModalOk () {
      this.deleteResume({
        id: this.itemId
      })
      this.toast = this.__('删除成功')
      this.modalVisible = false
    },
    getAuditStatus (item) {
      const status = this.auditStatus[item.key.replace(/\./g, '_nodot_')]
      if (typeof status !== 'number') {
        return 1
      }
      return status
    },
    isReadonly (item) {
      return !/text/img.test(item.type)
    },
    mapUserDataToFormData (item) {
      const data = this.staged.data || this.userData['data'] || {}
      let sep
      this.groupItems.map(item => {
        if (item.type === 'AREA') sep = item.constraint.sep || ' '
        this.formData[item.key.replace(/\./g, '_nodot_')] = data[item.key.replace(/\./g, '_nodot_')]
      })
      if (this.staged.key && this.area.data) {
        this.formData[this.staged.key] = this.area.data.map(item => item.value).join(sep)
      }
      this.stageData()
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
        // 日期用 yyyy-mm-dd 字符串存储
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
    rules () {
      const currentItem = this.groupItems.find(item => item.key.replace(/\./g, '_nodot_') === this.activeName)
      if (currentItem) {
        if (currentItem.type === 'TEXT' || currentItem.type === 'EMAIL' || currentItem.type === 'MOBILE') {
          const {
            label,
            necessary = false,
            constraint = {}
          } = currentItem
          const key = currentItem.key.replace(/\./g, '_nodot_')
          const { min, max, pattern, peinfo } = constraint
          if (!this.formData[key]) {
            this.error = necessary ? label + this.__('不能为空') : null
            return
          }
          let regex
          if (pattern) {
            regex = new RegExp(pattern)
          }
          if ((min && this.formData[key].length < +min) || (max && this.formData[key] > +max) || (regex && !regex.test(this.formData[key]))) {
            this.error = label + peinfo || label + this.__('格式错误，请重新填写')
          } else {
            this.error = null
          }
        }
      }
    },
    saveData () {
      if (!this.userResume.pending) {
        if (this.itemId) {
          this.editResume({
            id: this.itemId,
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
      }
    },
    deleteInfo () {
      if (!this.userResume.pending) {
        this.modalVisible = true
      }
    }
  },
  created () {
    this.mapUserDataToFormData()
  },
  components: {
    CRow,
    CCol,
    CWarn,
    CLabel,
    CButton,
    CTextfield,
    CAuditWarn,
    DatePicker,
    CSingle,
    CModal
  }
}
</script>
<style src="./styles/index.css"></style>
