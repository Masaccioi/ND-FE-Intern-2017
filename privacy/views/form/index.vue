<template lang="html">
  <el-dialog :title="__('添加')" size="tiny" v-model="show" @close="dialogClose">
    <el-form class="privacy-dialog-form" :model="form" :inline="true" :rules="rules" ref="form">
      <el-form-item :label="__('标签')" prop="label">
        <el-input class="privacy-dialog-form-input" :maxlength="100"
        v-model="form.label" ></el-input>
      </el-form-item>
      <el-form-item :label="__('语言')" prop="language">
        <el-select class="privacy-dialog-form-input" :placeholder="__('请选择语言')" v-model="form.language">
          <el-option v-for="item in languageOptions"
            :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="__('业务名')" prop="biz_name">
        <el-input class="privacy-dialog-form-input" v-model="form.biz_name"
         :maxlength="100"></el-input>
      </el-form-item>
      <el-form-item :label="__('下一步跳转地址')" prop="next_action">
        <el-input class="privacy-dialog-form-input" v-model="form.next_action"
         :maxlength="500"></el-input>
      </el-form-item>
      <!-- <el-form-item :label="__('隐私模式来源')" prop="mode_source">
        <el-select class="privacy-dialog-form-input" v-model="form.mode_source">
          <el-option v-for="item in modeOptions"
            :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="__('key')">
        <el-input class="privacy-dialog-form-input" v-model="form.client_event_key"></el-input>
      </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <Button size="large" @click="handleCancel">{{ __('取消') }}</Button>
      <Button size="large" type="primary" @click="handleConfirm">{{ __('保存') }}</Button>
    </div>
  </el-dialog>
</template>
<script>
import { Dialog, Form, FormItem, Input, Select, Option } from 'element-ui'
import { Button } from 'iview'
import { I18N } from 'utils/config'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default () {}
    },
    index: {
      type: Number
    },
    id: {
      type: String
    }
  },
  data () {
    return {
      form: {},
      rulesProps: {
        label: this.__('标签'),
        language: this.__('语言'),
        biz_name: this.__('业务名'),
        next_action: this.__('下一步跳转地址')
      },
      // modeOptions: [{
      //   value: 0,
      //   label: '隐私服务端'
      // }, {
      //   value: 1,
      //   label: '业务方服务端'
      // }],
      languageOptions: Object.keys(I18N).map(key => {
        return {
          label: I18N[key],
          value: key
        }
      })
    }
  },
  mapGetters: {
  },
  mapActions: {
  },
  computed: {
    show: {
      get () {
        return this.visible || false
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    },
    rules () {
      const rls = {}
      Object.keys(this.rulesProps).map(key => {
        if (key === 'biz_name') {
          rls[key] = [{
            required: true, message: this.rulesProps[key] + this.__('不能为空'), trigger: 'blur'
          }, {
            validator: (rule, value, callback) => {
              if (!value || !value.trim()) {
                return callback(new Error(this.__('业务名不能为空')))
              }
              if (!/^[a-zA-Z0-9_]+$/g.test(value)) {
                return callback(new Error(this.__('业务名只能字母数字下划线组合')))
              }
              callback()
            }, trigger: 'blur'
          }]
        } else {
          rls[key] = [{
            required: true, message: this.rulesProps[key] + this.__('不能为空'), trigger: 'blur'
          }, {
            validator: (rule, value, cb) => {
              if (!value || !value.trim()) {
                cb(new Error(this.rulesProps[key] + this.__('不能为空')))
              } else {
                cb()
              }
            }, trigger: 'blur'
          }]
        }
      })
      // rls['mode_source'] = [{
      //   required: true, message: this.__('隐私模式来源') + this.__('不能为空'), trigger: 'blur', type: 'number'
      // }]
      return rls
    }
  },
  methods: {
    handleCancel () {
      this.$emit('cancel')
    },
    handleConfirm () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('confirm', this.form, this.id, this.index)
        }
      })
    },
    dialogClose () {
      this.handleCancel()
      // 表单重置
      this.form = {
        label: null,
        language: null,
        biz_name: null,
        next_action: null,
        mode_source: 0,
        client_event_key: null
      }
      this.$refs.form.resetFields()
    }
  },
  watch: {
    formData (val) {
      // 初始化数据到form中
      if (val) {
        this.form = {
          ...this.form,
          ...val
        }
      }
    }
  },
  mapComponents: {
    Dialog,
    Form,
    FormItem,
    Button,
    Input,
    Select,
    Option
  }
}
</script>
<style>
.privacy-dialog-form {
  text-align: center;

  & label {
    width: 120px;
  }

  & .privacy-dialog-form-input {
    width: 300px;
  }
}
</style>
