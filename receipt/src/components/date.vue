<template lang="html">
  <div class="ui-datepicker">
    <c-col v-for="(column, index) in columns" :key="index">
      <c-picker v-if="column.type === 'picker'"
        :class="column.class"
        :size="size"
        :index="column.index"
        transition
        @change="column.mutate">
        <p
          v-for="(item, i) in column.items"
          :class="['column-item', {'column-item-active': column.index === i}]">{{item}}</p>
      </c-picker>
    </c-col>
  </div>
</template>

<script>
import CPicker from 'components/core/picker'
import CButton from 'components/core/button'
import CCol from 'components/core/col'
import datetime from 'nd-datetime'

function makeArrayByRange (start, end) {
  const arr = []
  for (let i = start; i <= end; i++) {
    arr.push(i)
  }
  return arr
}

export default {
  name: 'x-date',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    const {
      value = Date.now(),
      constraint = {}
    } = this.data
    const {
      pattern = 'yyyy-MM-dd',
      max: maxDate,
      min: minDate
    } = constraint
    const moment = datetime(value)
    return {
      value,
      maxDate,
      minDate,
      pattern: pattern || 'yyyy-MM-dd',
      size: 5,
      /* eslint-disable */
      year: moment.yyyy(),
      month: moment.M(),
      date: moment.d(),
      hour: moment.h(),
      minute: moment.m(),
      second: moment.s(),
      /* eslint-enable */
    }
  },
  computed: {
    columns () {
      let views = this.pattern.match(/y+|M+|d+|h+|m+|s+|i+|E+|D+|[^yMdhmsiED]+/g)
      if (views === null) {
        return []
      }
      views = views.filter(view => !/[^yMdhmsiED]/.test(view))
      return views.map(view => {
        if (/[^yMdhmsiED]/.test(view)) {
          return view
        }
        const name = this.getName(view)
        const items = this.getItems(view)
        const index = items.indexOf(this[name])

        // 找不到置为第一个
        if (index === -1) {
          this[name] = items[0]
        }
        return {
          class: `c-datepicker-${name}s`,
          type: 'picker',
          index: index > -1 ? index : 0,
          items,
          mutate: i => {
            this[name] = +items[i]
          }
        }
      })
    }
  },
  methods: {
    getStyle (index, active) {
      const diff = (+active) - (+index)
      if (diff !== 0 && diff < this.size && diff > -this.size) {
        let angle = diff * 30 % 360
        if (angle > 90) {
          angle = 90
        } else if (angle < -90) {
          angle = -90
        }
        return {
          transform: `rotate3d(1, 0, 0, ${angle}deg)`
        }
      }
    },
    getValue () {
      const date = `${this.year}-${this.month}-${this.date}-${this.hour}-${this.minute}-${this.second}`
      return {
        value: datetime(date).toNumber()
      }
    },
    getName (type) {
      return ({
        'yyyy': 'year',
        'MM': 'month',
        'dd': 'date',
        'hh': 'hour',
        'mm': 'minute',
        'ss': 'second'
      })[type]
    },
    getItems (type) {
      const maxDate = datetime(this.maxDate || Date.now())
      const minDate = datetime(this.minDate || '1900-1-1')
      /* eslint-disable */
      const maxYear = maxDate.yyyy()
      const minYear = minDate.yyyy()
      const maxMonth = maxDate.M()
      const minMonth = minDate.M()
      const maxDay = maxDate.d()
      const minDay = minDate.d()
      const maxHour = maxDate.h()
      const minHour = minDate.h()
      const maxMinute = maxDate.m()
      const minMinute = minDate.m()
      const maxSecond = maxDate.s()
      const minSecond = minDate.s()
      /* eslint-enable */
      const showMaxMonth = +this.year === +maxYear
      const showMaxDay = showMaxMonth && +this.month === +maxMonth
      const showMaxHour = showMaxDay && +this.date === +maxDay
      const showMaxMinute = showMaxHour && +this.hour === +maxHour
      const showMaxSecond = showMaxMinute && +this.minute === +maxMinute
      const showMinMonth = +this.year === +minYear
      const showMinDay = showMinMonth && +this.month === +minMonth
      const showMinHour = showMinDay && +this.date === +minDay
      const showMinMinute = showMinHour && +this.hour === +minHour
      const showMinSecond = showMinMinute && +this.minute === +minMinute

      switch (type) {
        case 'yyyy':
          return makeArrayByRange(minYear, maxYear)
        case 'MM':
          return makeArrayByRange(showMinMonth ? +minMonth : 1, showMaxMonth ? +maxMonth : 12)
        case 'dd':
          return makeArrayByRange(showMinDay ? minDay : 1, showMaxDay ? maxDay : datetime(`${this.year}-${this.month + 1}-00`, 'yyyy-MM-dd').d())
        case 'hh':
          return makeArrayByRange(showMinHour ? +minHour : 0, showMaxHour ? +maxHour : 23)
        case 'mm':
          return makeArrayByRange(showMinMinute ? minMinute : 0, showMaxMinute ? maxMinute : 59)
        case 'ss':
          return makeArrayByRange(showMinSecond ? minSecond : 0, showMaxSecond ? maxSecond : 59)
      }
    }
  },
  components: {
    CPicker,
    CButton,
    CCol
  }
}
</script>

<style>
.ui-datepicker {
  display: flex;
  width: 100%;
  padding: dpr(42px) 0;
  border-top: dpr(2px) solid var(--color9);
  background-color: var(--color7);

  & p.column-item {
    font-size: dpr(36px);
  }
}
</style>
