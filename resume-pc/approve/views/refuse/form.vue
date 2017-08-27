<template lang="html">
  <el-dialog class="resume-data-refuse-form" :title="__('请选择不通过理由')" size="tiny" v-model="show" @close="dialogClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form ref="form" label-width="70px">
      <el-form-item>
        <el-select v-model="selection">
          <el-option
            v-for="(item, index) in options"
            :key="index"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="other">{{__('其他理由')}}</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-input type="textarea" :rows="3" :disabled="!other" v-model="otherReason"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <Button size="large" @click="dialogClose">{{ __('取消') }}</Button>
      <Button size="large" type="primary" @click="handleSubmit">{{ __('提交') }}</Button>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog, Form, FormItem, Select, Option, Checkbox, Input } from 'element-ui'
import { Button } from 'iview'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      awaiting: false,
      options: ['经核实，信息有误', '格式不符合规范'],
      other: false,
      otherReason: '',
      selection: '经核实，信息有误'
    }
  },
  computed: {
    show: {
      get () {
        return this.visible || false
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    handleCancel () {
      this.$emit('cancel')
    },
    handleSubmit () {
      const reason = this.other ? this.otherReason : this.seletion
      this.$emit('confirm', reason)
    },
    dialogClose () {
      this.handleCancel()
      // 表单重置
    }
  },

  watch: {
    show (val) {
      if (val) {
        this.$refs.form && this.$refs.form.resetFields()
        this.awaiting = false
      }
    }
  },

  created () {
  },

  mapComponents: {
    Dialog,
    Form,
    FormItem,
    Button,
    Select,
    Option,
    Checkbox,
    Input
  }
}
</script>
<style>
.resume-data-resume-form {
}
</style>
