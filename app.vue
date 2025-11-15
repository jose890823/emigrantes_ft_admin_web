<script setup lang="ts">
// Check auth on app mount
const { checkAuth } = useAuth()

onMounted(() => {
  checkAuth()
})
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
