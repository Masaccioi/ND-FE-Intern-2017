<template lang="html">
  <div class="ui-resume">
    <router-view></router-view>
    <c-button v-if="showSaveBtn" @click.native="handleSaveClick">保存</c-button>
    <loading v-show="pending"></loading>
  </div>
</template>
<script>
import CButton from 'components/core/button'
import Loading from 'components/loading'
import { registerSaveButton, unRegisterSaveButton, setMenuVisible } from 'utils/sdk'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Resume',
  computed: {
    ...mapGetters(['userResume', 'template']),
    needSave () {
      return this.$route.path !== '/resume/home' && !/\/resume\/area/.test(this.$route.path)
    },
    showSaveBtn () {
      return __DEV__ && this.needSave && !window.Bridge
    },
    pending () {
      return this.userResume.pending || this.template.pending
    }
  },
  methods: {
    ...mapActions(['clickSaveBtn']),
    handleSaveClick () {
      this.clickSaveBtn()
    }
  },
  watch: {
    needSave (val) {
      if (val && !this.saveBtn) {
        registerSaveButton({
          event: this.handleSaveClick,
          title: this.__('保存'),
          register_button: 'true',
          icon_name: 'general_top_icon_confirm_normal'
        }, res => {
          if (res) {
            this.saveBtn = true
            console.log(res)
            __DEV__ && console.log('Save Btn registered')
          } else {
            __DEV__ && console.log('Save Btn register failed')
          }
        })
      } else if (!val && this.saveBtn) {
        unRegisterSaveButton()
      }
    }
  },
  created () {
    setMenuVisible({
      'maf.copyURL': false,
      '_maf_menu': false,
      'maf.openWithBrowser': false,
      'maf.refresh': false
    })
  },
  beforeDestroy () {
    if (this.saveBtn) {
      unRegisterSaveButton()
    }
  },
  components: {
    CButton,
    Loading
  }
}
</script>
<style>
.ui-resume {
  & .c-button {
    margin-top: dpr(20px);
    border-radius: 0;
    height: dpr(88px);
    line-height: dpr(88px);
    background-color: var(--primary);
    color: var(--color7);
    font-size: var(--text4);
    border: none;
  }
}
</style>


