<template>
  <div class="ui-resume">
    <div class="ui-resume-header">
      <div class="ui-resume-header-buttons">
        <Button
          size="large"
          @click="handleRefresh"
          class="ui-resume-header-button"
          type="primary">{{__('刷新')}}</Button>
      </div>
      <el-form ref="searchForm" inline :model="query" class="ui-template-header-form">
        <el-form-item>
          <Input
            size="large"
            @keyup.native="handleKeywordChange"
            v-model="filters.name"
            :placeholder="__('名称')"></Input>
        </el-form-item>
        <el-form-item>
          <Button size="large" type="primary" @click="handleSearch">{{__('搜索')}}</Button>
        </el-form-item>
      </el-form>
    </div>
    <div>{{__('*选中模板后，默认第二天0点生效；请选择包含用户基本信息且基本信息排在第一的模板，否则会造成前端排版混乱')}}</div>
    <c-grid
      :data="items"
      :columns="columns"
      :action="action"
      :total="templates.count"
      :size="20"
      @page-change="handlePageChange"></c-grid>
  </div>
</template>

<script>
import { Form, FormItem } from 'element-ui'
import { Button, Input } from 'iview'
import CGrid from 'components/grid'
import { I18N } from 'utils/config'
import datetime from 'nd-datetime'

export default {
  data () {
    return {
      currentPage: 1,
      query: {
        $limit: 20,
        $offset: 0,
        count: true
      },
      filters: {
        name: undefined
      },
      languages: I18N
    }
  },
  mapGetters: {
    model: ['templates'],
    resume: ['resumeTemplate', 'msg']
  },
  mapActions: {
    config: ['addToast'],
    model: ['fetchTemplates'],
    resume: ['fetchResumeTemplate', 'selectResumeTemplate', 'activateResumeTemplate']
  },
  mapComponents: {
    Form,
    FormItem,
    CGrid,
    Input,
    Button
  },
  computed: {
    items () {
      return this.templates.items || []
    },
    columns () {
      return [{
        prop: 'name',
        label: this.__('名称')
      }, {
        prop: 'language',
        label: this.__('语言'),
        formatter: ({ language }) => {
          return I18N[language]
        }
      }, {
        prop: 'title',
        label: this.__('标题')
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
        width: 200,
        actions: [{
          label: this.__('查看'),
          handler: (index, data) => {
            this.$router.push(`${this.$route.fullPath}/${data.id}`)
          }
        }, {
          label: this.__('选中'),
          handler: (index, data) => {
            this.handleSelectTemplate(data.id)
          },
          disabled: (index, data) => {
            return !this.resumeTemplate || (this.resumeTemplate.selected_model_id === data.id)
          }
        }, {
          label: this.__('立即生效'),
          handler: () => {
            this.handleActivateTemplate()
          },
          disabled: (index, data) => {
            return !this.resumeTemplate || ((this.resumeTemplate.effective_model_id === data.id) || (this.resumeTemplate.selected_model_id !== data.id))
          }
        }]
      }
    }
  },
  watch: {
    currentPage (page) {
      this.query.$offset = (page - 1) * this.query.$limit
      this.fetchData()
    },
    msg (val) {
      if (val) {
        switch (val.type) {
          case 'SELECTED':
            this.addToast({
              type: 'success',
              message: this.__('已选中')
            })
            break
          case 'ACTIVATED':
            this.addToast({
              type: 'success',
              message: this.__('已生效')
            })
            break
        }
      }
    }
  },
  methods: {
    handlePageChange (page) {
      this.currentPage = page
    },
    handleRefresh () {
      this.fetchData()
    },
    handleSearch () {
      this.query.$offset = 0
      this.fetchData()
    },
    fetchData () {
      const { query, filters } = this
      const $filter = []
      for (const key in filters) {
        if (filters[key]) {
          $filter.push(`${key} ${key === 'name' ? 'like' : 'eq'} ${filters[key]}`)
        }
      }
      query.$filter = $filter.join(' and ')
      query.$orderby = 'update_time desc'
      this.fetchTemplates({ query })
      this.fetchResumeTemplate()
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
    }
  },
  created () {
    this.fetchData()
  }
}
</script>

<style scoped>
.ui-resume {
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
