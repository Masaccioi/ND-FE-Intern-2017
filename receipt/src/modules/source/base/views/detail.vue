<template>
  <div class="ui-result-detail">
    <c-row v-for="row in rows" class="item-row">
      <div class="item-label text-overflow">{{ row.label }}</div>
      <div class="item-value" v-if="row.type !== 'DATE'">{{ row.value }}</div>
      <div class="item-value" v-else>{{ row.value | dateFormatter }}</div>
    </c-row>
  </div>
</template>
<script>
import CRow from 'components/core/row'
import { mapGetters } from 'vuex'
import datetime from 'nd-datetime'
export default {
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['myDatas', 'selectedTemplate']),
    id () {
      return this.$route.params.id
    },
    detail () {
      return this.myDatas && this.myDatas.items[this.id] || {}
    },
    rows () {
      if (this.selectedTemplate && this.detail) {
        const keyMap = this.selectedTemplate.key_map
        const orderMap = this.selectedTemplate.display_order_map
        const typeMap = this.selectedTemplate.data_type_map
        const data = this.detail.data

        if (keyMap && orderMap && data) {
          return Object.keys(orderMap)
            .sort((keyA, keyB) => {
              return orderMap[keyA] - orderMap[keyB]
            })
            .map(key => {
              return {
                label: keyMap[key],
                value: data[key],
                type: typeMap[key]
              }
            })
        }
      }
      return []
    }
  },
  filters: {
    dateFormatter (val) {
      return datetime(val).toString('yyyy/MM/dd')
    }
  },
  components: {
    CRow
  },
  mounted () {
    document.title = this.__('detail')
  }
}
</script>
<style src="../styles/detail.css"></style>
