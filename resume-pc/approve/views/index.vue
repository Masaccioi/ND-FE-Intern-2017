<template>
  <div class="ui-resume-audit">
    <el-tabs v-model="curStatus">
      <el-tab-pane :label="__('待处理')" name="0"></el-tab-pane>
      <el-tab-pane :label="__('已处理')" name="3"></el-tab-pane>
    </el-tabs>
    <div class="ui-resume-audit-header">
      <div class="ui-resume-audit-header-buttons">
        <Button
          size="large"
          @click="handleRefresh"
          class="ui-resume-audit-header-button"
          type="primary">{{__('刷新')}}</Button>
        <Button
          size="large"
          v-show="curStatus==='0'"
          :disabled="!selectedIds.length"
          @click.native="handleMultiAudit(selectedIds, 1)"
          class="ui-resume-audit-header-button"
          type="primary">{{__('批量通过')}}</Button>
        <Button
          size="large"
          v-show="curStatus==='0'"
          :disabled="!selectedIds.length"
          @click.native="handleMultiAudit(selectedIds, 2)"
          class="ui-resume-audit-header-button"
          type="primary">{{__('批量不通过')}}</Button>
      </div>
      <el-form ref="searchForm" inline :model="query" class="ui-template-audit-header-form">
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
      :total="auditList.count"
      :size="20"
      @selection-change="selectionChange"
      @page-change="handlePageChange"></c-grid>
    <c-dialog-form
      ref="refuseDialog"
      :visible.sync="dialogVisible"
      @confirm="refuseDialogConfirm"
      @cancel="refuseDialogCancel"></c-dialog-form>
  </div>
</template>

<script>
import { Form, FormItem, Autocomplete, Tabs, TabPane, MessageBox as messagebox } from 'element-ui'
import { Button } from 'iview'
import CGrid from 'components/grid'
import { I18N } from 'utils/config'
import datetime from 'nd-datetime'
import CDialogForm from './refuse/form'

export default {
  data () {
    return {
      currentPage: 1,
      query: {
        $limit: 20,
        $offset: 0,
        count: true
      },
      keyword: '',
      filterUid: null,
      filterStatus: 0,
      selectedIds: [],
      dialogVisible: false,
      userFetched: {},
      languages: I18N,
      curStatus: '0'
    }
  },
  mapGetters: {
    user: ['auth', 'users'],
    resume: ['auditList', 'auditMsg'],
    uc: ['searchedUsers']
  },
  mapActions: {
    config: ['addToast'],
    uc: ['searchUser'],
    user: ['fetchUser'],
    resume: ['fetchResumeAuditList', 'auditResume']
  },
  mapComponents: {
    Form,
    FormItem,
    CGrid,
    Autocomplete,
    CDialogForm,
    Button,
    Tabs,
    TabPane
  },
  computed: {
    orgId () {
      return this.auth.user_info.org_exinfo.org_id
    },
    items () {
      return this.auditList.items || []
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
        prop: 'modified_group_names',
        label: this.__('修改的分组'),
        formatter: ({ modified_group_names }) => {
          if (modified_group_names && modified_group_names.length) {
            return modified_group_names.join(this.__('、'))
          }
          return ''
        }
      }, {
        prop: 'update_time',
        label: this.__('修改时间'),
        formatter: ({ update_time }) => {
          return datetime(update_time).format()
        }
      }]
    },
    action () {
      return {
        label: this.__('操作'),
        width: 200,
        actions: [{
          label: this.__('查看'),
          handler: (index, data) => {
            this.$router.push(`${this.$route.fullPath}/${data.id}`)
          }
        }]
      }
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
    curStatus (val) {
      this.$nextTick(() => {
        this.fetchData()
      })
    },
    auditMsg (val) {
      if (val) {
        switch (val.type) {
          case 'AUDITED':
            this.addToast({
              type: 'success',
              message: this.__('操作成功')
            })
            this.dialogVisible = false
            this.handleRefresh()
            break
        }
      }
    },
    auditList (val) {
      if (val && val.count && val.items && !val.items.length && this.currentPage !== 1) {
        this.currentPage--
        this.query.$offset -= 20
        this.fetchData()
      }
    }
  },
  methods: {
    selectionChange (items) {
      this.selectedIds = items.map(item => item.id)
    },
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
    handlePageChange (page) {
      this.currentPage = page
      this.query.$offset = (page - 1) * this.query.$limit
      this.fetchData()
    },
    handleRefresh () {
      this.fetchData()
    },
    handleSearch () {
      this.query.$offset = 0
      this.currentPage = 1
      if (!this.keyword) {
        this.keyUserId = ''
      }
      this.filterUid = this.keyUserId
      this.fetchData()
    },
    fetchData () {
      const { query, filterUid, curStatus } = this
      if (filterUid) {
        query.$filter = `user_id eq ${filterUid} and status eq ${curStatus}`
      } else {
        query.$filter = `status eq ${curStatus}`
      }
      query.$orderby = 'update_time desc'
      this.fetchResumeAuditList({ query })
    },
    handleSelectTemplate (id) {
      this.selectResumeTemplate(id)
    },
    handleActivateTemplate () {
      this.activateResumeTemplate()
    },
    handleKeywordChange () {
      this.timeout && clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.handleSearch()
        this.timeout = null
      }, 500)
    },
    handleMultiAudit (ids, audit) {
      if (audit === 1) {
        // 批量通过
        messagebox({
          title: this.__('请确认'),
          message: this.__('确定通过吗？'),
          showCancelButton: true,
          confirmButtonText: this.__('确定'),
          cancelButtonText: this.__('取消'),
          callback: action => {
            if (action === 'confirm') {
              const unique = Date.now()
              ids.forEach(id => {
                this.auditResume({
                  id,
                  count: ids.length,
                  unique,
                  payload: {
                    status: 1
                  }
                })
              })
            }
          }
        })
      } else {
        this.dialogVisible = true
      }
    },
    refuseDialogConfirm (reason) {
      const unique = Date.now()
      this.selectedIds.forEach(id => {
        this.auditResume({
          id,
          count: this.selectedIds.length,
          unique,
          payload: {
            status: 2,
            reason
          }
        })
      })
    },
    refuseDialogCancel () {
      this.dialogVisible = false
    }
  },
  created () {
    this.fetchData()
  }
}
</script>

<style scoped>
.ui-resume-audit {
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
