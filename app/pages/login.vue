<script setup lang="ts">
import { Eye, EyeOff, LogIn } from 'lucide-vue-next'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const { login } = useAuth()
const router = useRouter()

// Form state
const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

// Handle login
const handleLogin = async () => {
  error.value = ''

  // Validation
  if (!form.email || !form.password) {
    error.value = 'Por favor completa todos los campos'
    return
  }

  loading.value = true

  try {
    const result = await login({
      email: form.email,
      password: form.password,
    })

    if (result.success) {
      router.push('/dashboard')
    } else {
      error.value = result.error || 'Error al iniciar sesión'
    }
  } catch (err: any) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-2xl">EF</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p class="text-gray-600 mt-2">Emigrantes FT</p>
        </div>

        <!-- Error message -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
        >
          {{ error }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              :disabled="loading"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              placeholder="admin@emigrantesft.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                :disabled="loading"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                :disabled="loading"
              >
                <component :is="showPassword ? EyeOff : Eye" :size="20" />
              </button>
            </div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <component :is="LogIn" :size="20" />
            <span v-if="!loading">Iniciar Sesión</span>
            <span v-else>Iniciando...</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-6 text-center text-sm text-gray-600">
          <p>Solo para administradores</p>
        </div>
      </div>

      <!-- Info -->
      <div class="mt-6 text-center text-sm text-gray-600">
        <p>&copy; 2025 Emigrantes FT LLC. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</template>
