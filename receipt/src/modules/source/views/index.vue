<template lang="html">
  <router-view></router-view>
</template>

<script>
import { setMenuVisible } from 'utils/sdk'

export default {
  data () {
    return {}
  },
  methods: {
    setMenuVisible
  },
  created () {
    this.setMenuVisible({
      '_maf_menu': false
    })
  }
}
</script>

<style lang="css">
</style>
