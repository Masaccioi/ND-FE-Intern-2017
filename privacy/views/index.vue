<template>
  <div class="ui-privacy-page">
    <div class="ui-privacy-header">
      <div class="ui-privacy-actions">
        <Button size="large"
          @click="fetchData"
          type="primary">{{ __('刷新') }}</Button>
        <Button size="large"
          @click="handleAdd"
          type="primary">{{ __('新增') }}</Button>
        <Button
          size="large"
          :disabled="!selectedIds.length"
          type="primary"
          @click.native="handleMultiDel(selectedIds)">{{__('批量删除')}}</Button>
        </div>
        <el-form ref="searchForm" inline :model="filter" class="ui-privacy-header-form">
          <el-form-item>
            <Input
              size="large"
              v-model="filter.label"
              :placeholder="__('标签')"></Input>
          </el-form-item>
          <el-form-item>
            <el-select :placeholder="__('语言')" v-model="filter.language">
              <el-option v-for="item in languageOptions"
                :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <Button size="large" type="primary" @click="handleSearch">{{__('搜索')}}</Button>
          </el-form-item>
          <el-form-item>
            <Button size="large" @click="handleReset">{{__('重置')}}</Button>
          </el-form-item>
        </el-form>
    </div>
    <c-grid :data="items"
      :columns="columns"
      :action="action"
      :current-page="currentPage"
      :total="privacyList.count"
      :size="20"
      @selection-change="selectionChange"
      @page-change="handlePageChange"
      checkable>
    </c-grid>
    <c-dialog-form
      ref="dialog"
      :visible.sync="dialog.visible"
      :formData="dialog.formData"
      :index="dialog.index"
      :id="dialog.id"
      @confirm="dialogConfirm"
      @cancel="dialogCancel"></c-dialog-form>
  </div>
</template>
<script>
import { MessageBox as messagebox, Select, Option, Form, FormItem } from 'element-ui'
import { Button, Input } from 'iview'
import datetime from 'nd-datetime'
import { I18N } from 'utils/config'
import CGrid from 'components/grid'
import CDialogForm from './form/index'
export default {
  data () {
    return {
      filter: {
        label: '',
        language: ''
      },
      dialog: {
        visible: false,
        formData: {},
        index: null,
        id: null
      },
      currentPage: 1,
      selectedIds: [],
      languageOptions: Object.keys(I18N).map(key => {
        return {
          label: I18N[key],
          value: key
        }
      })
    }
  },
  mapActions: {
    privacy: ['fetchPrivacyList', 'deletePrivacy', 'addPrivacy', 'editPrivacy'],
    config: ['addToast']
  },
  mapGetters: {
    privacy: ['privacyList', 'msg']
  },
  computed: {
    items () {
      return this.privacyList && this.privacyList.items || []
    },
    columns () {
      return [{
        prop: 'label',
        label: this.__('标签')
      }, {
        prop: 'language',
        label: this.__('语言'),
        formatter: ({ language }) => {
          return I18N[language]
        }
      }, {
        prop: 'biz_name',
        label: this.__('业务名')
      }, {
        prop: 'create_time',
        label: this.__('创建时间'),
        formatter: ({ create_time: time }) => {
          return datetime(time).format()
        }
      }, {
        prop: 'update_time',
        label: this.__('更新时间'),
        formatter: ({ update_time: time }) => {
          return datetime(time).format()
        }
      }]
    },
    action () {
      return {
        label: this.__('操作'),
        actions: [{
          label: this.__('编辑'),
          handler: this.handleEdit
        }, {
          label: this.__('删除'),
          handler: this.handleDelete
        }]
      }
    },
    query () {
      return {
        $count: true,
        $offset: 20 * (this.currentPage - 1),
        $limit: 20,
        $orderby: 'create_time desc'
      }
    }
  },
  methods: {
    selectionChange (items) {
      this.selectedIds = items.map(item => item.id)
    },
    handleReset () {
      this.filter = {
        label: '',
        language: ''
      }
      this.handleSearch()
    },
    handleAdd () {
      this.dialog.visible = true
      this.dialog.formData = {
        label: null,
        language: null,
        biz_name: null,
        next_action: null,
        mode_source: 0,
        client_event_key: null
      }
      this.dialog.id = ''
    },
    handleSearch () {
      this.currentPage = 1
      this.$nextTick(() => {
        this.fetchData()
      })
    },
    fetchData () {
      const filterArr = []
      if (this.filter.label) {
        filterArr.push(`label like ${this.filter.label}`)
      }
      if (this.filter.language) {
        filterArr.push(`language eq ${this.filter.language}`)
      }
      const filterStr = filterArr.join(' and ')
      this.fetchPrivacyList({
        query: {
          ...this.query,
          $filter: filterStr || undefined
        }
      })
    },
    handlePageChange (page) {
      this.currentPage = page
      this.$nextTick(() => {
        this.fetchData()
      })
    },
    handleDelete (index, data) {
      messagebox({
        title: this.__('请确认'),
        message: this.__('确定删除？'),
        showCancelButton: true,
        confirmButtonText: this.__('确定'),
        cancelButtonText: this.__('取消'),
        callback: action => {
          if (action === 'confirm') {
            this.deletePrivacy({
              id: data.id,
              index
            })
          }
        }
      })
    },
    handleMultiDel (items) {
      messagebox({
        title: this.__('请确认'),
        message: this.__('确定删除？'),
        showCancelButton: true,
        confirmButtonText: this.__('确定'),
        cancelButtonText: this.__('取消'),
        callback: action => {
          if (action === 'confirm') {
            const uniqueId = new Date().getTime()
            this.selectedIds.forEach(id => {
              this.deletePrivacy({
                id,
                multi: {
                  uniqueId,
                  count: this.selectedIds.length
                }
              })
            })
          }
        }
      })
    },
    dialogConfirm (data, id, index) {
      if (this.awaiting) {
        return
      }
      this.awaiting = true
      if (id) {
        this.editPrivacy({
          id,
          payload: data,
          index
        })
      } else {
        this.addPrivacy({
          payload: data
        })
      }
    },
    dialogCancel () {
      this.dialog.visible = false
    },
    handleEdit (index, data) {
      this.dialog.visible = true
      this.dialog.formData = {
        label: data.label,
        language: data.language,
        biz_name: data.biz_name,
        next_action: data.next_action,
        mode_source: data.mode_source,
        client_event_key: data.client_event_key
      }
      this.dialog.index = index
      this.dialog.id = data.id
    }
  },
  watch: {
    msg (val) {
      if (val) {
        let text
        switch (val.type) {
          case 'DELETED':
            text = '删除成功'
            break
          case 'ADDED':
            text = '新增成功'
            this.awaiting = false
            this.dialog.visible = false
            break
          case 'EDITED':
            text = '编辑成功'
            this.awaiting = false
            this.dialog.visible = false
            break
          case 'MULTI-DELETED':
            text = '删除成功'
            this.fetchData()
            break
          case 'FAILED':
            this.awaiting = false
            break
          default:
            break
        }
        if (text) {
          this.addToast({
            type: 'success',
            message: this.__(text)
          })
        }
      }
    }
  },
  created () {
    this.fetchData()
  },
  mapComponents: {
    Button,
    CGrid,
    CDialogForm,
    Input,
    Select,
    Option,
    Form,
    FormItem
  }
}
</script>
<style src="../styles/index.css" scoped></style>
