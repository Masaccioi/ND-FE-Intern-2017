<template>
  <div class="ui-result-page" v-if="hasResult">
    <c-row class="ui-result-header">
      <c-col v-for="col in displayCols">
        {{ col.label }}
      </c-col>
      <c-col v-if="!displayCols.length">{{ __('no_cols')}}</c-col>
    </c-row>
    <c-scroller
      :transition="transition"
      :height="height"
      :loading="loading"
      :drained="false"
      :infinite="false"
      @pulldown="pulldown"
      @pullup="pullup">
      <template slot="pulldown" scope="props">
        <div v-if="props.downGo">{{__('release_refresh')}}</div>
        <div v-else-if="props.downReady">{{ __('refresh')}}</div>
        <div v-else-if="props.downAwaiting">{{ __('refreshing') + '..'}}</div>
      </template>
      <c-row v-for="(item, index) in items" class="item-row">
        <router-link :to="`detail/${index}`">
          <c-col v-for="col in displayCols">
            <div v-if="col.type !== 'DATE'">{{ item[col.key] }}</div>
            <div v-else>{{ item[col.key] | dateFormatter }}</div>
          </c-col>
          <c-col v-if="!displayCols.length">{{ __('no_cols')}}</c-col>
          <img class="c-row-goin" :src="arrowRight"></img>
        </router-link>
      </c-row>
      <template slot="pullup" scope="props">
        <div v-if="drained">{{ __('no_more')}}</div>
        <div v-else-if="props.upGo">{{__('release_load')}}</div>
        <div v-else-if="props.upReady">{{ __('load_more')}}</div>
        <div v-else-if="props.upAwaiting">{{ __('loading') + '..'}}</div>
      </template>
    </c-scroller>
  </div>
  <div v-else class="ui-empty-result-page">
    <div class="empty-wrapper">
      <img :src="emptyImg"></img>
      <p>{{ __('nothing') }}</p>
    </div>
  </div>
</template>
<script>
import CRow from 'components/core/row'
import CCol from 'components/core/col'
import CScroller from 'components/core/scroller'
import datetime from 'nd-datetime'
import emptyImg from '../styles/images/general_not_icon_social.png'
import arrowRight from '../styles/images/general_arrow_right_icon_normal.png'
import { mapGetters, mapActions } from 'vuex'
export default {
  data () {
    return {
      emptyImg,
      arrowRight,
      height: 0,
      loading: false
    }
  },
  computed: {
    ...mapGetters(['myDatas', 'selectedTemplate', 'selectedQuerys', 'transition']),
    tid () {
      return this.selectedTemplate && this.selectedTemplate.id || 0
    },
    filters () {
      if (this.selectedQuerys && this.selectedQuerys.length) {
        return this.selectedQuerys.filter(item => item.value).map(item => {
          return [`data.${item.key}(D)`, item.op, item.value].join(' ')
        }).join(' and ')
      }
    },
    displayCols () {
      if (this.selectedTemplate) {
        const displayMap = this.selectedTemplate.display_enable_map
        const keyMap = this.selectedTemplate.key_map
        const orderMap = this.selectedTemplate.display_order_map
        const typeMap = this.selectedTemplate.data_type_map

        if (displayMap && keyMap && orderMap) {
          return Object.keys(displayMap).filter(key => displayMap[key])
            .sort((keyA, keyB) => {
              return orderMap[keyA] - orderMap[keyB]
            })
            .map(key => {
              return {
                label: keyMap[key],
                key,
                type: typeMap[key]
              }
            })
        }
      }
      return []
    },
    items () {
      if (this.myDatas && this.myDatas.items) {
        return this.myDatas.items.map(item => item.data)
      }
      return []
    },
    hasResult () {
      return this.myDatas && this.myDatas.count || 0
    },
    drained () {
      return this.myDatas && this.myDatas.count === this.items.length
    }
  },
  filters: {
    dateFormatter (val) {
      return datetime(val).toString('yyyy/MM/dd')
    }
  },
  mounted () {
    document.title = this.__('result')
    if (!this.hasResult) {
      return
    }
    this.height =
      document.documentElement.clientHeight -
      document.getElementsByClassName('ui-result-header')[0].clientHeight -
      parseInt(getComputedStyle(this.$el).marginTop, 10) * 2
  },
  methods: {
    ...mapActions(['fetchMyDatas']),
    pulldown () {
      if (this.loading) {
        return
      }
      this.loading = true
      this.fetchMyDatas({
        tid: this.tid,
        query: {
          $limit: 30,
          $offset: 0,
          $count: true,
          $filter: this.filters
        }
      })
    },
    pullup () {
      if (this.drained || this.loading) {
        return
      }
      this.loading = true
      this.fetchMyDatas({
        tid: this.tid,
        query: {
          $limit: 30,
          $offset: this.items.length,
          $count: true,
          $filter: this.filters
        }
      })
    }
  },
  watch: {
    myDatas (val) {
      if (val && !val.loading) {
        this.loading = false
      }
    }
  },
  components: {
    CRow,
    CCol,
    CScroller
  }
}
</script>
<style src="../styles/result.css"></style>
