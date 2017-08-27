<template>
    <c-form class="tel-form">
      <div class="tel-box">
        <c-editbox>
          <c-label slot="label">{{ __('联系电话') }}</c-label>
          <c-textfield type="tel" placeholder="请输入您的联系电话"></c-textfield>
          <c-audit-warn>审核不通过</c-audit-warn>
        </c-editbox>
      </div>
      <c-warn>{{ __('此信息需要审核后才能开放查阅,请慎重填写')}}</c-warn>
  </c-form>
</template>
<script>
import CForm from 'components/core/form'
import CEditbox from 'components/editbox'
import CWarn from 'components/warn'
import CLabel from 'components/core/label'
import CTextfield from 'components/core/textfield'
import CAuditWarn from 'components/audit-warn'

export default{
  components: {
    CForm,
    CEditbox,
    CWarn,
    CLabel,
    CTextfield,
    CAuditWarn
  }
}
</script>
<style>
.tel-form{
  & .tel-box{
    border-bottom: dpr(1px) solid var(--color8);
  }
}

</style>
