<template lang="html">
  <el-dialog class="resume-data-import-form" v-if="downloadTemplate" :title="__('导入')" size="tiny" v-model="show" @close="dialogClose"
    :show-close="status!=='LOADING'"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form v-if="status==='READY'" :model="form" :rules="rules" ref="form" label-width="70px">
      <el-form-item :label="__('下载：')">
        <a :href="downloadTemplate" download="用户履历数据导入模板.xslx">{{ __('下载用户履历数据导入模板') }}</a>
      </el-form-item>
      <el-form-item prop="dentryId" :label="__('文件：')">
        <Upload
          ref="upload"
          :action="uploadUrl"
          :data="uploadData"
          accept=".xls, .xlsx"
          :format="['xls', 'xlsx']"
          :on-remove="handleRemove"
          :before-upload="handleBeforeUpload"
          :on-format-error="handleFormatError"
          :on-exceeded-size="handleMaxSize"
          :on-success="handleSuccess"
          :on-error="handleError"
          :max-size="5120"
          :default-file-list="defaultFileList">
          <Button size="large" type="primary">{{ __('+选择文件') }}</Button>
        </Upload>
      </el-form-item>
    </el-form>
    <div v-if="status==='LOADING'">{{ __('导入数据需要一点时间，请不要关闭页面！若长时间没响应，刷新页面试试。') }}</div>
    <div v-if="status==='DONE'">
      <p v-if="uploadRes.success">{{__('导入成功数：')}}{{ uploadRes.success }}</p>
      <p v-if="uploadRes.error_msg">{{__('导入失败：')}}<br />{{ uploadRes.error_msg }}</p>
    </div>
    <div slot="footer" class="dialog-footer">
      <Button size="large" v-if="status==='LOADING'" disabled>{{ __('数据导入中')}}... </Button>
      <Button size="large" v-if="status==='READY'" @click="dialogClose">{{ __('取消') }}</Button>
      <Button size="large" type="primary" :disabled="!form.dentryId" v-if="status==='READY'" @click="handleImport">{{ __('提交') }}</Button>
      <Button size="large" type="primary" v-if="status==='DONE'"@click="dialogClose">{{ __('完成') }}</Button>
    </div>
  </el-dialog>
  <el-dialog class="resume-data-import-form" v-else :title="__('错误提示')">
    <div>{{__('请先进行履历配置，履历配置后才能使用导入数据功能')}}</div>
    <Button size="large" type="primary" @click="dialogClose">{{ __('知道了') }}</Button>
  </el-dialog>
</template>

<script>
import { Dialog, Form, FormItem } from 'element-ui'
import { Button, Upload } from 'iview'
import { CS_RES } from 'utils/config'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    template: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      awaiting: false,
      status: 'READY',
      form: {
        dentryId: ''
      },
      uploadData: {
        scope: 1
      },
      defaultFileList: []
    }
  },
  mapGetters: {
    model: ['sessions'],
    resume: ['resumeTemplate', 'uploadRes']
  },
  mapActions: {
    config: ['addToast'],
    model: ['getSessions'],
    resume: ['fetchResumeTemplate', 'importResumeDatas']
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
      return {
        dentryId: [
          { required: true, message: this.__('请上传导入数据'), trigger: 'blur' }
        ]
      }
    },
    uploadUrl () {
      return CS_RES.base + `/upload?session=${this.sessions.session}`
    },
    downloadTemplate () {
      return this.template && `${CS_RES.base}/download?dentryId=${this.template}&attachment=true`
    }
  },
  methods: {
    handleCancel () {
      this.$emit('cancel')
    },
    handleImport () {
      // this.$emit('confirm')
      this.$refs.form.validate(valid => {
        if (valid) {
          this.importResumeDatas(this.form.dentryId)
          this.status = 'LOADING'
        }
      })
    },
    dialogClose () {
      if (this.status === 'LOADING') {
        return false
      }
      this.handleCancel()
      // 表单重置
    },
    handleBeforeUpload (file) {
      this.$refs.upload.clearFiles()
      this.uploadData.name = file.name
    },
    handleFormatError () {
      this.addToast({
        type: 'error',
        message: `${this.__('文件格式只能为')}.xls${this.__('或')}.xlsx${this.__('，请检查')})`
      })
    },
    handleMaxSize () {
      this.addToast({
        type: 'error',
        message: this.__('文件大小不能超过5M，请检查')
      })
    },
    handleSuccess (res, file) {
      this.form.dentryId = res.dentry_id
      this.defaultFileList = [{
        name: file.name
      }]
    },
    handleError (err) {
      this.addToast({
        type: 'error',
        message: typeof err === 'object' && this.__(err.code) || this.__('上传失败')
      })
    },
    handleRemove () {
      this.form.dentryId = ''
    }
  },

  watch: {
    sessions (val) {
      if (val && val.path) {
        this.uploadData.path = val.path
      }
    },
    uploadRes (val) {
      if (val) {
        if (val.fail) {
          this.status = 'READY'
          return
        }
        this.status = 'DONE'
        if (val.success) {
          this.$emit('refresh')
        }
      }
    },
    show (val) {
      if (val) {
        if (!this.sessions || !this.sessions.session || this.sessions.expire_at < Date.now()) {
          this.getSessions('/template')
        }
        this.form = {
          dentryId: ''
        }
        this.defaultFileList = []
        this.$refs.upload && this.$refs.upload.clearFiles()
        this.$refs.form && this.$refs.form.resetFields()
        this.awaiting = false
        this.status = 'READY'
      }
    }
  },

  created () {
    this.getSessions('/template')
    if (!this.resumeTemplate || !this.resumeTemplate.template_file_id) {
      this.fetchResumeTemplate()
    }
  },

  mapComponents: {
    Dialog,
    Form,
    FormItem,
    Button,
    Upload
  }
}
</script>
<style>
.resume-data-import-form {
  & .el-dialog__body {
    height: 240px;
  }

  & .ivu-upload.ivu-upload-select {
    display: inline-block;
  }
}
</style>
