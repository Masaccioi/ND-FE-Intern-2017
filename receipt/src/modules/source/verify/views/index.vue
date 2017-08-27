<template>
  <div class="ui-verify-page">
    <transition name="fade">
      <div v-show="showTip" class="verify-tips">
        <p>{{__('tips')}}</p>
        <img v-tap @tap="showTip = false" :src="closeIcon">
      </div>
    </transition>
    <c-form class="verify-main" @submit.native.prevent="handleLogin">
      <div class="input-wrapper">
        <img :src="iconSrc">
        <c-textfield type="password"
          field="password"
          :placeholder="__('input_password')"
          :value="password"
          @change="password = $event"
          @focus.native="focused=true"
          @blur.native="focused=false"
          :validate="{ required: { message: this.__('password_no_empty') }}"></c-textfield>
      </div>
      <c-badge v-if="$validation.errors.length" class="warning" size="small">
        {{$validation.errors.filter(function (error) { return error.field === 'password' }).map(function (error) { return error.message }).join(' ')}}
      </c-badge>
      <c-button class="primary" :disabled="loading" type="submit"
        size="large">
        <c-spinner v-if="loading" size="small"></c-spinner>
        {{__('login')}}
      </c-button>
    </c-form>
  </div>
</template>

<script>
import lockIcon from '../styles/images/query_login_icon_password.png'
import hoverLockIcon from '../styles/images/password_input.png'
import closeIcon from '../styles/images/query_top_button_close.png'
import CForm from 'components/core/form'
import CBadge from 'components/core/badge'
import CTextfield from 'components/core/textfield'
import CSpinner from 'components/core/spinner'
import CButton from 'components/core/button'
import md5s from 'nd-md5s'
import { mapGetters, mapActions } from 'vuex'
import { getNetStatus } from 'utils/sdk'

export default {
  data () {
    return {
      password: '',
      focused: false,
      closeIcon,
      hoverLockIcon,
      showTip: true,
      loading: false,
      tryTimes: 0
    }
  },
  methods: {
    ...mapActions(['checkPassword', 'addToast', 'setUserInfo', 'setCore']),
    changeValue (val) {
      this.password = val
    },
    fetchUserInfo () {
      const uc = window.Bridge && window.Bridge.require('sdp.uc')
      if (uc) {
        uc.getCurrentUser({
          force: true
        }, {
          success: data => {
            this.setUserInfo(data)
            if (data && data.org_exinfo) {
              this.checkPassword({
                payload: {
                  'login_name': data.org_exinfo.org_user_code,
                  org_name: data.org_exinfo.org_name,
                  password: md5s(this.password, '\xa3\xac\xa1\xa3fdjf,jkgfkl')
                }
              })
            } else {
              this.addToast(this.__('no_org_exinfo'))
            }
          },
          fail: () => {
            this.loading = false
            this.addToast(this.__('userinfo_fail'))
            this.setUserInfo({
              error: new Date()
            })
          }
        })
      } else if (++this.tryTimes < 10) {
        setTimeout(() => {
          this.fetchUserInfo()
        }, 500)
      } else {
        this.loading = false
        this.addToast(this.__('userinfo_fail'))
      }
    },
    handleLogin () {
      this.tryTimes = 0
      this.$validate().then(() => {
        this.loading = true
        if (this.userInfo && this.userInfo.org_exinfo) {
          this.checkPassword({
            payload: {
              'login_name': this.userInfo.org_exinfo.org_user_code,
              org_name: this.userInfo.org_exinfo.org_name,
              password: md5s(this.password, '\xa3\xac\xa1\xa3fdjf,jkgfkl')
            }
          })
        } else if (!getNetStatus()) {
          this.addToast(this.__('/NETWORK_ERROR'))
          this.loading = false
        } else {
          this.fetchUserInfo()
        }
      })
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isValid', 'translations']),
    iconSrc () {
      return this.focused ? hoverLockIcon : lockIcon
    }
  },
  watch: {
    isValid (val) {
      this.loading = false
      if (val && val.value) {
        this.setCore({
          authorized: true
        })
        this.$router.replace('/source/base')
      }
    },
    translations (val) {
      if (val) {
        this.$nextTick(() => {
          document.title = this.__('login') + ' - ' + this.__('data_query')
        })
      }
    }
  },
  mounted () {
    document.title = this.__('login') + ' - ' + this.__('data_query')
  },

  validator: {
    auto: false
  },
  components: {
    CBadge,
    CForm,
    CTextfield,
    CButton,
    CSpinner
  }
}
</script>
<style src="../styles/index.css" scoped></style>
