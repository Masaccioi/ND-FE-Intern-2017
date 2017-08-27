<template>
  <div class="c-message">
    <slot></slot>
    <c-icon class="fs-64">x</c-icon>
  </div>
</template>

<script>
import CIcon from 'components/core/icon'
export default {
  props: {
    wait: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      offset: 0,
      minOffset: 0,
      maxOffset: 0
    }
  },

  components: {
    CIcon
  }
}
</script>

<style src="./styles/message"></style>
