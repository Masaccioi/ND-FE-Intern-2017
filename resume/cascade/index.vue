<template>
  <div class="ui-area">
    <c-row tabindex="-1" class="area-row" v-for="(item, index) in dataSource" @click.native.stop="handleItemClick($event, item.value, index, item)" :key="item.value" :link="!!(item.children && item.children.length)">
      <c-col class="area-col">
        <c-label class="area-label">{{item.label}}</c-label>
      </c-col>
    </c-row>
  </div>
</template>
<script>
import CRow from 'components/core/row'
import CCol from 'components/core/col'
import CLabel from 'components/core/label'
import dataSource from 'utils/area'
import { mapActions, mapGetters } from 'vuex'

const getDataSource = path => {
  const pathArr = path.split('-')
  let temp = [...dataSource]
  for (let i = 0; i < pathArr.length; i++) {
    temp = temp[pathArr[i]].children || []
  }
  return temp
}

export default {
  name: 'Area',
  components: {
    CRow,
    CCol,
    CLabel
  },
  props: {
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dataSource: this.options
    }
  },
  computed: mapGetters(['area']),
  methods: {
    ...mapActions(['setArea']),
    handleItemClick (e, value, index, item) {
      if (item.children && item.children.length > 0) {
        let path
        if (this.path) {
          path = `${this.path}-${index}`
        } else {
          path = index
        }
        this.$router.push(`/resume/area/${path}`)
      } else {
        const data = []
        if (this.path) {
          const pathArr = this.path.split('-')
          let cur = dataSource
          pathArr.map(i => {
            data.push(cur[i])
            cur = cur[i].children || []
          })
        }
        data.push({ ...item })
        this.setArea(data)
        if (this.area.next) {
          this.$router.replace(this.area.next)
        }
      }
    },
    setDataSource () {
      const { params } = this.$route
      this.path = params.path
      if (this.path) {
        this.dataSource = [...getDataSource(this.path)]
      } else {
        this.dataSource = [...dataSource]
      }
    }
  },
  watch: {
    '$route.params.path' () {
      this.setDataSource()
    }
  },
  created () {
    this.setDataSource()
  }
}
</script>
<style scoped>
.ui-area {
  & .area-row {
    background-color: var(--color10);

    &:active {
      background-color: var(--color8);
    }
    &::after {
      left: 0 !important;
    }
  }

  & .area-col {
    height: dpr(88px);
    line-height: dpr(88px);
    padding-left: dpr(20px);
    box-sizing: border-box;
  }

  & .area-label {
    color: var(--color1);
    font-size: var(--text4);
  }
}
</style>

