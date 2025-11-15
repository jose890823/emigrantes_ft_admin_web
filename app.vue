<template>
  <div>
    <NuxtLayout :name="layoutName">
      <NuxtPage />
    </NuxtLayout>

    <!-- Layout Switcher Global -->
    <LayoutSwitcher />
  </div>
</template>

<script setup lang="ts">
import LayoutSwitcher from '~/components/layout/LayoutSwitcher.vue'
import { useLayout } from '~/composables/useLayout'

const { currentLayout } = useLayout()

// El layout es reactivo y se actualizará automáticamente
const layoutName = currentLayout
</script>
