<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
      <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
      <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
      <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { Tabs, TabPane } from 'element-ui'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Home',
  data () {
    return {
      template: [
        {
          "label": "电脑维修单",
          "id": 1
        },
        {
          "label": "年假申请",
          "id": 2
        },
        {
          "label": "不关机权限申请表",
          "id": 3
        }
      ],
      activeName: ''
    }
  },
  computed: {
    ...mapGetters([])
  },
  methods: {
    ...mapActions([])
  },
  created () {
    // this.fetchTemplate()
  },
  components: {
    Tabs,
    TabPane
  }
}
</script>
<style src="../styles/index.css"></style>
