<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

// Redirect to dashboard
navigateTo('/dashboard')
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="mt-4 text-gray-600">Redirigiendo...</p>
    </div>
  </div>
</template>
