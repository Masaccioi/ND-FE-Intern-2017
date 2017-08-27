<template>
  <div class="ui-home-page">
    <div class="header">
      <img class="header-bg" :src="avatar"/>
      <div class="mask"></div>
      <div class="header-info" @click.stop.native="handleAvatar">
        <img :src="avatar"/>
      </div>
    </div>
    <component
      v-for="(group, index) in groups"
      :key="group.id"
      :is="!group.multi_enabled ? 'BasicGroup' : 'MultiGroup'"
      :group="group"
      :class="['info-group', {
        'basic-info': !group.multi_enabled,
        'first-group': index === 0
      }]"></component>
  </div>
</template>
<script>
import CLabel from 'components/core/label'
import CAvatar from 'components/core/avatar'
import CLink from 'components/core/link'

import BasicGroup from '../components/basic-group'
import MultiGroup from '../components/multi-group'

import { mapActions, mapGetters } from 'vuex'
import { CS_RES } from 'utils/config'
import { getCurrentUserId, goPage } from 'utils/sdk'

export default {
  name: 'ResumeHome',
  data () {
    return {
      uid: getCurrentUserId()
    }
  },
  computed: {
    ...mapGetters(['template', 'userResume', 'staged']),
    groups () {
      return this.template.groups || []
    },
    avatar () {
      const CS_API_ORIGIN = CS_RES.base
      const uid = this.uid
      const size = '80'
      if (CS_API_ORIGIN.indexOf('beta') === -1) {
        return `${CS_API_ORIGIN}/static/cscommon/avatar/${uid}/${uid}.jpg?size=${size}&_=${Date.now()}`
      } else {
        return `${CS_API_ORIGIN}/static/preproduction_content_cscommon/avatar/${uid}/${uid}.jpg?size=${size}&_=${Date.now()}`
      }
    }
  },
  methods: {
    ...mapActions(['fetchTemplate', 'fetchUserResume', 'fetchUserInfo']),
    handleAvatar () {
      goPage(`cmp://com.nd.pbl.pblcomponent/settingAvatar?uid=${this.uid}`)
    }
  },
  created () {
    // 存在 staged.key 则表示不需要重新获取数据
    if (!this.staged.key) {
      this.fetchTemplate()
      this.fetchUserResume({
        id: getCurrentUserId()
      })
    }
  },
  components: {
    CAvatar,
    CLabel,
    CLink,
    BasicGroup,
    MultiGroup
  }
}
</script>
<style src="../styles/index.css"></style>
