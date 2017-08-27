<template>
  <div class="ui-tip-page" v-html="selectedTemplate.help_info"></div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['selectedTemplate'])
  },
  mounted () {
    document.title = this.__('help_info')
  }
}
</script>
<style>
body {
  background-color: var(--color7);
}
.ui-tip-page {
  margin-top: dpr(34px);
  padding: 0 dpr(20px);

  & p {
    font-size: var(--text13);
    color: var(--color1);

    & .ql-size-small {
      font-size: var(--text5);
    }

    & .ql-size-large {
      font-size: var(--text9);
    }

    & em {
      font-style: italic;
    }
  }
}
</style>
