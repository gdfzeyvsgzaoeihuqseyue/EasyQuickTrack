<template>
  <component :is="tag" :href="tag === 'a' ? ssoUrl : undefined" :class="buttonClass"
    class="inline-flex items-center justify-center space-x-2 transition-all cursor-pointer"
    @click="tag === 'button' ? handleClick : undefined">
    <IconShieldCheck v-if="showIcon && iconPosition === 'left'" class="w-5 h-5" />

    <slot>
      <span>{{ defaultText }}</span>
    </slot>

    <IconArrowRight v-if="showIcon && iconPosition === 'right'" class="w-4 h-4" />
  </component>
</template>

<script setup lang="ts">
import { IconArrowRight, IconShieldCheck } from '@tabler/icons-vue'

interface Props {
  serviceId?: string
  action?: 'login' | 'register'
  returnUrl?: string
  buttonClass?: string
  tag?: 'a' | 'button'
  showIcon?: boolean
  iconPosition?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  action: 'login',
  returnUrl: '',
  buttonClass: 'btn btn-primary',
  tag: 'a',
  showIcon: true,
  iconPosition: 'right'
})

const defaultText = computed(() => {
  return props.action === 'login'
    ? 'Se connecter avec PGS SSO'
    : 'S\'inscrire avec PGS SSO'
})

const { getSSOUrl } = useSSO()

const ssoUrl = computed(() => {
  return getSSOUrl(props.action, props.returnUrl)
})

const handleClick = () => {
  if (props.tag === 'button') {
    window.location.href = ssoUrl.value
  }
}
</script>
