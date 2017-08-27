<template>
  <div class="ui-resume-data">
    <div class="ui-resume-data-header">
      <div class="ui-resume-data-header-buttons">
        <Button
          size="large"
          @click="handleRefresh"
          class="ui-resume-data-header-button"
          type="primary">{{__('刷新')}}</Button>
        <Button
          size="large"
          @click="handleImport"
          class="ui-resume-data-header-button"
          type="primary">{{__('导入')}}</Button>
        <Button
          size="large"
          :disabled="!selectedIds.length"
          @click.native="handleMultiDelete(selectedIds)"
          class="ui-resume-data-header-button"
          type="primary">{{__('删除选定')}}</Button>
      </div>
      <el-form ref="searchForm" inline :model="query" class="ui-template-data-header-form">
        <el-form-item>
          <el-autocomplete v-model="keyword"
          :placeholder="__('搜索用户')"
          :props="{label: 'value', value: 'id'}"
          :fetch-suggestions="querySearchUser"
          :trigger-on-focus="false"
          @select="handleSelect"
          @keyup.enter.native="handleSearch"></el-autocomplete>
        </el-form-item>
        <el-form-item>
          <Button size="large" type="primary" @click="handleSearch">{{__('搜索')}}</Button>
        </el-form-item>
      </el-form>
    </div>
    <c-grid
      checkable
      :data="items"
      :columns="columns"
      :action="action"
      :total="resumeDataList.count"
      :size="20"
      @selection-change="selectionChange"
      @page-change="handlePageChange"></c-grid>
    <c-dialog-import-form
      ref="importDialog"
      :visible.sync="dialogVisible"
      :template="resumeTemplate.template_file_id"
      @refresh="handleRefresh"
      @confirm="importDialogConfirm"
      @cancel="importDialogCancel"></c-dialog-import-form>
  </div>
</template>
<script>
import { Form, FormItem, Autocomplete, MessageBox as messagebox } from 'element-ui'
import { Button } from 'iview'
import datetime from 'nd-datetime'
import CGrid from 'components/grid'
import CDialogImportForm from './import/index'

export default {
  mapComponents: {
    Form,
    FormItem,
    Autocomplete,
    CGrid,
    CDialogImportForm,
    Button
  },
  data () {
    return {
      query: {
        $limit: 20,
        $offset: 0,
        count: true
      },
      keyword: '',
      filterUid: null,
      selectedIds: [],
      dialogVisible: false,
      userFetched: {}
    }
  },
  mapGetters: {
    user: ['auth', 'users'],
    resume: ['resumeDataList', 'resumeTemplate', 'uploadRes', 'dataMsg'],
    uc: ['searchedUsers']
  },
  computed: {
    orgId () {
      return this.auth.user_info.org_exinfo.org_id
    },
    items () {
      return this.resumeDataList.items || []
    },
    columns () {
      return [{
        prop: 'user_id',
        label: this.__('用户名'),
        formatter: ({ user_id }) => {
          if (this.users.entities && this.users.entities[user_id]) {
            const user = this.users.entities[user_id]
            return (user.nick_name || user.org_exinfo && user.org_exinfo.real_name || '') + `(${user.org_exinfo && user.org_exinfo.org_user_code || user_id})`
          } else if (!this.userFetched[user_id]) {
            this.fetchUser(user_id)
            this.userFetched[user_id] = true
          }
          return user_id
        }
      }, {
        prop: 'update_time',
        label: this.__('更新时间'),
        formatter: ({ update_time }) => {
          return datetime(update_time).format()
        }
      }]
    },
    action () {
      return {
        label: this.__('操作'),
        width: 120,
        actions: [{
          label: this.__('编辑'),
          handler: this.handleEdit
        }, {
          label: this.__('删除'),
          handler: this.handleDelete
        }]
      }
    }
  },
  mapActions: {
    resume: ['fetchResumeDataList', 'fetchResumeTemplate', 'deleteUserResumeData'],
    uc: ['searchUser'],
    user: ['fetchUser'],
    config: ['addToast']
  },
  methods: {
    querySearchUser (keyword, cb) {
      this.searchCB = null
      if (!keyword) {
        cb([])
        return
      }
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.timeout = null
        this.searchUser({
          orgId: this.orgId,
          nodeId: 0,
          query: {
            name: keyword,
            $limit: 20,
            $offset: 0
          }
        })
        this.searchCB = cb
      }, 500)
    },
    handleSelect (item) {
      this.keyword = item.value
      this.keyUserId = item.id
    },
    handleRefresh () {
      this.fetchData()
    },
    handleSearch () {
      if (!this.keyword) {
        this.keyUserId = ''
      }
      this.filterUid = this.keyUserId
      this.fetchData()
    },
    handleImport () {
      this.dialogVisible = true
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
            this.deleteUserResumeData({
              uid: data.user_id,
              index
            })
          }
        }
      })
    },
    handleMultiDelete (ids) {
      if (ids && ids.length) {
        messagebox({
          title: this.__('请确认'),
          message: this.__('确定删除？'),
          showCancelButton: true,
          confirmButtonText: this.__('确定'),
          cancelButtonText: this.__('取消'),
          callback: action => {
            if (action === 'confirm') {
              const unique = Date.now()
              ids.forEach(id => {
                this.deleteUserResumeData({
                  uid: id,
                  count: ids.length,
                  unique
                })
              })
            }
          }
        })
      }
    },
    handleEdit (index, data) {
      this.$router.push(`${this.$route.fullPath}/${data.user_id}`)
    },
    handlePageChange () {

    },
    fetchData () {
      const { query, filterUid } = this
      if (filterUid) {
        query.$filter = `user_id eq ${filterUid}`
      } else {
        delete query.$filter
      }
      query.$orderby = 'update_time desc'
      this.fetchResumeDataList({ query })
    },
    importDialogConfirm () {

    },
    importDialogCancel () {
      this.dialogVisible = false
    },
    selectionChange (items) {
      this.selectedIds = items.map(item => item.user_id)
    }
  },
  watch: {
    searchedUsers (val) {
      if (val && val.key === this.keyword && val.items) {
        const newItems = val.items.map(item => {
          return {
            value: (item.nick_name || item['org.real_name'] || '') + `(${item['org.org_user_code']})`,
            id: '' + item.user_id
          }
        })
        typeof this.searchCB === 'function' && this.searchCB(newItems)
      }
    },
    dataMsg (val) {
      if (val) {
        let msg = ''
        switch (val.type) {
          case 'DELETED':
            msg = this.__('删除成功')
            break
          case 'MULTI-DELETED':
            msg = this.__('删除成功')
            this.handleRefresh()
            break
        }
        if (msg) {
          this.addToast({
            type: 'success',
            message: msg
          })
        }
      }
    }
  },
  created () {
    this.fetchData()
    if (!this.resumeTemplate || !this.resumeTemplate.template_file_id) {
      this.fetchResumeTemplate()
    }
  }
}
</script>
<style>
.ui-resume-data {
  &-header {
    width: 100%;
    display: flex;
    justify-content: space-between;

    &-button {
      min-width: 5rem;
      margin: 0 10px 22px 0;
    }
  }
}
</style>
