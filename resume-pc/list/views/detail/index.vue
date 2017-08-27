<template>
  <div class="ui-resume-template-detail">
    <el-row>
      <el-col :span="3" class="item-label"><span class="must">*</span>{{__('名称')}}</el-col>
      <el-col :span="21">{{template.name}}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3" class="item-label"><span class="must">*</span>{{__('语言')}}</el-col>
      <el-col :span="21">{{I18N[template.language]}}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3" class="item-label"><span class="must">*</span>{{__('页面标题')}}</el-col>
      <el-col :span="21">{{template.title}}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3" class="item-label"><span class="must">*</span>{{__('分组')}}</el-col>
      <el-col :span="21">
        <ul class="template-groups">
          <li v-for="group in template.groups" :key="group.group_id" class="template-group">
            <div class="group-info">{{group.group_name}}</div>
            <ul>
              <li v-for="item in group.items" :key="item.id" class="item-info">
                <span>{{item.multi_label && item.multi_label[lang] || item.label}}</span>
                <div class="item-chmod">
                  <div class="chmod-item">
                    <Tag>{{item.custom_enabled ? __('允许自定义可见性') : __('不允许自定义可见性')}}</Tag>
                  </div>
                  <div class="chmod-item">
                    <Tag>{{item.perfect_count_enabled ? __('列入资料完整度统计') : __('不列入资料完整度统计')}}</Tag>
                  </div>
                  <div class="chmod-item">
                    <Tag>{{item.hot_search_enabled ? __('开启关键词智能匹配') : __('不开启关键词智能匹配')}}</Tag>
                  </div>
                  <div class="chmod-item">
                    <Tag>{{__('默认：')}}{{visibility[item.visibility]}}</Tag>
                  </div>
                  <div class="chmod-item">
                    <Tag type="dot" v-if="item.chmod===2" color="blue">{{chmod[item.chmod]}}</Tag>
                    <Tag type="dot" v-else>{{chmod[item.chmod]}}</Tag>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </el-col>
    </el-row>
    <el-row class="resume-detail-actions">
      <el-col :span="3">&nbsp;</el-col>
      <el-col :span="21">
        <Button size="large" @click="onCancel">{{__('取消')}}</Button>
        <Button size="large" type="primary" :disabled="isSelected" @click="onCancel">{{__('选中')}}</Button>
        <Button size="large" type="primary" :disabled="isActivated" @click="onCancel">{{__('立即生效')}}</Button>
      </el-col>
    </el-row>

  </div>
</template>
<script>
import { Row, Col } from 'element-ui'
import { Tag, Button } from 'iview'
import { I18N } from 'utils/config'
import { chmod, visibility } from 'modules/model/utils'

export default {
  data () {
    return {
      I18N,
      chmod,
      visibility
    }
  },
  computed: {
    tid () {
      return this.$route.params.id
    },
    template () {
      return this.templates && this.templates.entities && this.templates.entities[this.tid] || {}
    },
    isSelected () {
      return this.tid === this.resumeTemplate.selected_model_id
    },
    isActivated () {
      return this.tid === this.resumeTemplate.effective_model_id
    }
  },
  mapGetters: {
    i18n: ['lang'],
    model: ['templates'],
    resume: ['resumeTemplate']
  },
  mapActions: {
    model: ['fetchTemplate'],
    resume: ['fetchResumeTemplate', 'selectResumeTemplate', 'activateResumeTemplate']
  },
  mapComponents: {
    Row,
    Col,
    Tag,
    Button
  },
  methods: {
    onCancel () {
      this.$router.back()
    },
    handleSelect () {
      this.selectResumeTemplate(this.tid)
    },
    handleActivate () {
      this.activateResumeTemplate()
    }
  },
  created () {
    if (this.tid) {
      this.fetchTemplate({
        id: this.tid,
        needItem: true
      })
    }
  }
}
</script>
<style src="../../styles/detail" scoped></style>
