<template>
  <div class="ui-datas-edit">
    <el-form :model="form" :rules="rules" ref="form">
      <el-tabs class="ui-datas-edit-nav" v-model="activeName">
        <el-tab-pane 
          class="ui-datas-edit-nav-tab"
          v-for="group in groups"
          :key="group.group_id"
          :label="group.group_name" 
          :name="group.group_id">
          <div v-for="source in resumeUserData[group.group_id]">
            <el-form-item 
              v-for="item in group.items"
              class="ui-datas-edit-form-label"
              :label="item.label"
              :prop="source.id + '.' + item.key.replace(/\./g, '_nodot_')"
              :key="item.id">
              <el-date-picker
                v-if="item.type==='DATE' || item.type==='BIRTHDAY'"
                v-model="form[source.id][item.key.replace(/\./g, '_nodot_')]"
                type="date"></el-date-picker>
              <el-radio-group 
                v-else-if="item.type==='SINGLE'"
                v-model="form[source.id][item.key.replace(/\./g, '_nodot_')]">
                <el-radio 
                  v-for="option in item.constraint.data" 
                  :key="option.value"
                  :label="option.value">{{option.label}}</el-radio>
              </el-radio-group>
              <el-checkbox-group
                v-else-if="item.type==='MULTIPLE'"
                v-model="form[source.id][item.key.replace(/\./g, '_nodot_')]">
                <el-checkbox
                  v-for="option in item.constraint.data" 
                  :key="option.value"
                  :label="option.value">{{option.label}}</el-checkbox>
              </el-checkbox-group>
              <el-cascader
                v-else-if="item.type==='AREA'"
                v-model="form[source.id][item.key.replace(/\./g, '_nodot_')]"
                :options="AreaOptions"
                class="ui-datas-edit-form-input">
              </el-cascader>
              <el-cascader
                v-else-if="item.type==='CASCADE'"
                v-model="form[source.id][item.key.replace(/\./g, '_nodot_')]"
                :options="item.constraint.data">
              </el-cascader>
              <el-input 
                v-else
                v-model="form[source.id][item.key.replace(/\./g, '_nodot_')]"
                class="ui-datas-edit-form-input"></el-input>
            </el-form-item>
          </div>
        </el-tab-pane>
      </el-tabs>
      <Button
        size="large"
        @click="handleCancel">{{__('取消')}}</Button>
      <Button
        size="large"
        @click="handleOk"
        type="primary">{{__('确定')}}</Button>
    </el-form>
  </div>
</template>
<script>
import { Form, FormItem, Input, Tabs, TabPane, DatePicker, RadioGroup,
 Radio, CheckboxGroup, Checkbox, Cascader } from 'element-ui'
import { Button } from 'iview'
import dataSource from 'utils/area'
import datetime from 'nd-datetime'
export default {
  data () {
    return {
      activeName: '',
      form: {},
      AreaOptions: [...dataSource]
    }
  },
  mapGetters: {
    resume: ['resumeTemplate', 'resumeUserData']
  },
  computed: {
    groups () {
      return this.resumeTemplate.effective_model && this.resumeTemplate.effective_model.groups || []
    },
    rules () {
      const rls = {}
      // 等到 userdata加载完之后
      if (!this.resumeUserData.pending) {
        this.groups.map(group => {
          this.resumeUserData[group.group_id].map(local => {
            group.items.map(item => {
              const {
                label,
                necessary = false,
                constraint = {}
              } = item
              const key = local.id + '.' + item.key.replace(/\./g, '_nodot_')
              const { min, max, pattern, peinfo } = constraint
              let regex
              if (pattern) {
                regex = new RegExp(pattern)
              }
              rls[key] = []
              if (necessary) rls[key].push({ required: true, message: label + this.__('不能为空'), trigger: 'blur' })
              if (item.type === 'TEXT' || item.type === 'TEXTAREA' || item.type === 'MOBILE' || item.type === 'EMAIL') {
                rls[key].push({
                  validator: (rule, value, cb) => {
                    if (necessary && (!value || !value.trim())) {
                      return cb(new Error(label + this.__('不能为空')))
                    }
                    if ((regex && !regex.test(value)) || (min && value.length < +min) || (max && value.length > +max)) {
                      return cb(new Error(peinfo || this.__('格式错误，请重新填写')))
                    }
                    cb()
                  },
                  trigger: 'blur'
                })
              }
            })
          })
        })
      }
      return rls
    }
  },
  mapActions: {
    resume: ['fetchResumeTemplate', 'fetchUserResumeData', 'editUserResumeData']
  },
  methods: {
    mapDataToForm () {
      this.groups.map(group => {
        this.resumeUserData[group.group_id].map(local => {
          this.form[local.id] = {}
          group.items.map(item => {
            const key = item.key.replace(/\./g, '_nodot_')
            const { pattern: defaultPattern = 'yyyy-MM-dd', hideYear } = item.constraint
            let pattern = defaultPattern
            if (hideYear) {
              pattern = 'MM-dd'
            }
            switch (item.type) {
              case 'BIRTHDAY':
              case 'DATE':
                if (local.data[key]) {
                  this.form[local.id][key] = datetime(local.data[key]).format(pattern)
                } else {
                  this.form[local.id][key] = datetime(new Date()).format(pattern)
                }
                break
              case 'MULTIPLE':
              case 'CASCADE':
              case 'AREA':
                const sep = item.sep || ','
                if (local.data[key]) this.form[local.id][key] = local.data[key].split(sep)
                else this.form[local.id][key] = []
                break
              default:
                this.form[local.id][key] = local.data[key]
            }
          })
        })
      })
    },
    handleCancel () {
      this.$router.replace('/resume/data')
    },
    handleOk () {
      this.$refs.form.validate(valid => {
        let data = { ...this.form }
        if (valid) {
          this.groups.map(group => {
            this.resumeUserData[group.group_id].map(local => {
              group.items.map(item => {
                const key = item.key.replace(/\./g, '_nodot_')
                switch (item.type) {
                  case 'BIRTHDAY':
                  case 'DATE':
                    data[local.id][key] = datetime(data[local.id][key]).toNumber()
                    break
                  case 'MULTIPLE':
                  case 'CASCADE':
                  case 'AREA':
                    const sep = item.sep || ','
                    data[local.id][key] = data[local.id][key].join(sep)
                    break
                  default:
                    console.log('a')
                }
              })
            })
          })
        }
      })
      // this.editUserResumeData({
      //   payload: this.form
      // }).then(data => {
      //   if (data) {
      //     this.$router.replace('/resume/data')
      //   }
      // })
    }
  },
  watch: {
    'resumeUserData.pending' (pending) {
      if (!pending && !this.resumeUserData.error) {
        this.mapDataToForm()
      }
    }
  },
  created () {
    this.fetchUserResumeData({
      uid: this.$route.params.id
    })
    this.activeName = this.groups.length && this.groups[0].group_id || ''
  },
  mapComponents: {
    Form,
    FormItem,
    Tabs,
    TabPane,
    Button,
    Input,
    DatePicker,
    RadioGroup,
    Radio,
    CheckboxGroup,
    Checkbox,
    Cascader
  }
}
</script>
<style>
.ui-datas-edit{

  & .ui-datas-edit-nav{
    margin-bottom: 20px;
    
    & .el-tabs__header{
      border: none;
      position: absolute;
      z-index: 99;

      & .el-tabs__active-bar{
        display: none;
      }
      
      & .el-tabs__item{
        border: 1px solid #eee;
        display: block;
        background: #fff;
      }
    }

    & .el-tabs__content{
      width: 60%;
      min-width: 700px;
      min-height: 500px;
      padding-left: 130px;
      padding-top: 20px;
      background: #eef1f6;

      & .el-form-item__label{
        width: 80px;
      }

      & .ui-datas-edit-form-input{
        width: 300px;
      }
    }
  }
}

</style>
