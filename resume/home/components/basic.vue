<template>
  <div class="basic-item">
    <c-row class="c-editbox">
      <c-label>{{item.label}}</c-label>
      <c-textfield 
       :placeholder="item.placeholder"
       :type="item.type"
       :value="formData[item.key.replace(/\./g, '_nodot_')]"
       @change="handleInputChange($event)"
       @blur.native="rules"
       ></c-textfield>
      <c-audit-warn v-if="getAuditStatus(item) !== 1">
        {{ getAuditStatus(item) === 0 ? __('审核中') : __('审核不通过')}}
      </c-audit-warn>
    </c-row>
    <transition name="fade">
      <c-warn v-if="error" class="warning">
        {{error}}
      </c-warn>
    </transition>
    <c-warn v-show="item.require_approve"><span slot="warn-key">{{item.label}}</span>{{ __('需要审核后才能开放查阅,请慎重填写')}}</c-warn>
  </div>
</template>
<script>
import CRow from 'components/core/row'
import CCol from 'components/core/col'
import CLabel from 'components/core/label'
import CBadge from 'components/core/badge'
import CTextfield from 'components/core/textfield'
import CAuditWarn from 'components/audit-warn'
import CWarn from 'components/warn'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'BasicItem',
  data () {
    return {
      showAuditFail: false,
      groupId: this.$route.params.groupId,
      itemId: this.$route.params.itemId,
      group: {},
      item: {},
      error: null,
      formData: {}
    }
  },
  computed: {
    ...mapGetters(['userResume', 'template', 'saveBtn']),
    basicInfo () {
      return this.userResume[this.groupId] || []
    },
    localSourceId () {
      if (this.basicInfo.length && this.basicInfo[0].hasOwnProperty('id')) {
        return this.basicInfo[0]['id']
      }
    },
    userData () {
      const arr = this.userResume[this.groupId] || []
      return arr[0] ? arr[0]['data'] : {}
    },
    auditStatus () {
      return this.userData.data_audit_status || {}
    }
  },
  methods: {
    ...mapActions(['editResume', 'addResume', 'addToast']),
    handleInputChange (val) {
      this.formData[this.item.key.replace(/\./g, '_nodot_')] = val
    },
    getAuditStatus (item) {
      const status = this.auditStatus[item.key.replace(/\./g, '_nodot_')]
      if (typeof status !== 'number') {
        return 1
      }
      return status
    },
    rules () {
      const {
        label,
        necessary = false,
        constraint = {}
      } = this.item
      const { min, max, pattern, peinfo } = constraint
      const key = this.item.key.replace(/\./g, '_nodot_')
      if (!this.formData[key]) {
        this.error = necessary ? label + this.__('不能为空') : null
        return
      }
      let regex
      if (pattern) {
        regex = new RegExp(pattern)
      }
      if ((min && this.formData[key].length < +min) || (max && this.formData[key].length > +max) || (regex && !regex.test(this.formData[key]))) {
        this.error = peinfo || this.__('格式错误，请重新填写')
      } else {
        this.error = null
      }
    },
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
      }
    },
    mapUserDataToFormData () {
      // 根据路由获取group和item内容
      this.group = this.template.groups.find(group => {
        return group.group_id === this.groupId
      })
      this.item = this.group.items.find(item => {
        return item.id === this.itemId
      })
      this.group.items.map(item => {
        const data = this.userData[item.key.replace(/\./g, '_nodot_')] || ''
        this.formData[item.key.replace(/\./g, '_nodot_')] = data
      })
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
  created () {
    this.mapUserDataToFormData()
  },
  components: {
    CRow,
    CCol,
    CLabel,
    CTextfield,
    CAuditWarn,
    CWarn,
    CBadge
  }
}
</script>
<style>
.basic-item{

  & .c-editbox {
    line-height: dpr(88px);
    background-color: var(--color7);
    padding-left: dpr(20px);

    & .c-label {
      width: dpr(265px);
      margin-right: dpr(30px);
    }

    & .c-textfield {
      &::placeholder {
        font-size: var(--text13);
        color: var(--color4);
      }
    }
  }
}
</style>
