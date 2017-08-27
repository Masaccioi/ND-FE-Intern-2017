<template>
  <div class="multi-group">
    <c-row tabindex="-1" v-if="!hasInfo" class="info-section info-add" @click.native="handleAddClick">
      <c-col>{{ __('添加{0}', groupName) }}</c-col>
    </c-row>
    <div class="info-section" v-else>
      <p class="info-title">{{ groupName }}</p>
      <c-row class="info-row" link @click.native.stop="handleRowClick(item, $event)" v-for="item in dataItems" :key="item.id">
        <c-col>
          <p class="info-value" v-for="(groupItem, index) in groupItems" v-if="!groupItem.hide" :key="groupItem.key.replace(/\./g, '_nodot_')">{{format(item, groupItem, groupItems, index)}}</p>
        </c-col>
      </c-row>
      <c-button @click.native.stop="handleAddClick" class="secondary-add-btn">{{ __('添加{0}', groupName) }}</c-button>
    </div>
  </div>
</template>
<script>
import CRow from 'components/core/row'
import CCol from 'components/core/col'
import CLabel from 'components/core/label'
import CButton from 'components/core/button'
import CAuditWarn from 'components/audit-warn'

import closeIcon from '../styles/images/personal_system_icon_close.png'
import datetime from 'nd-datetime'
import gb2260 from 'nd-gb2260'

import { mapGetters } from 'vuex'
gb2260.register('201607', require('nd-gb2260/lib/201607'))
const gb = new gb2260.GB2260(gb2260.revisions()[0])
export default {
  name: 'MultiGroup',
  props: {
    group: {
      type: Object,
      defualt: () => ({})
    }
  },
  data () {
    return {
      closeIcon
    }
  },
  computed: {
    ...mapGetters(['userResume']),
    groupItems () {
      const items = this.group.items || []
      const isDate = item => item.type === 'DATE' || item.type === 'BIRTHDAY'
      items.map((item, i) => {
        if (isDate(item) && items[i + 1] && isDate(items[i + 1])) {
          item.showNext = true
          items[i + 1].hide = true
        }
      })
      return items
    },
    groupName () {
      return this.group.group_name
    },
    groupId () {
      return this.group.group_id
    },
    dataItems () {
      return this.userResume[this.groupId] || []
    },
    hasInfo () {
      return this.dataItems.length > 0
    }
  },
  methods: {
    handleRowClick (item) {
      this.$router.push(`/resume/multi/${this.groupId}/${item.id}`)
    },
    handleAddClick () {
      this.$router.push(`/resume/multi/${this.groupId}`)
    },
    getItemData (item) {
      return item.data || {}
    },
    format (item, groupItem, groupItems, i) {
      const data = this.getItemData(item)
      const value = data[groupItem.key.replace(/\./g, '_nodot_')]
      const { constraint = {}, showNext } = groupItem
      const { pattern: defaultPattern = 'yyyy-MM-dd', hideYear } = constraint
      let pattern = defaultPattern
      if (hideYear) {
        pattern = 'MM-dd'
      }
      if (!value) {
        return
      }
      switch (groupItem.type) {
        case 'BIRTHDAY':
        case 'DATE':
          if (showNext) {
            const nextItem = groupItems[i + 1]
            const nextValue = data[nextItem.key.replace(/\./g, '_nodot_')]
            return `${datetime(value).format(pattern)} - ${datetime(nextValue).format(pattern)}`
          }
          return datetime(value).format(pattern)
        case 'AREA':
          const sep = groupItem.constraint.sep || ','
          return value.split(sep).map(code => gb.get(code).name).join('')
        default:
          return value
      }
    }
  },
  components: {
    CRow,
    CCol,
    CLabel,
    CButton,
    CAuditWarn
  }
}
</script>
