import { ref } from 'vue'

export interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<Toast[]>([])

/**
 * Composable para mostrar notificaciones toast
 * @returns Métodos para manejar toasts
 */
export function useToast() {
  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 3000,
    }

    toasts.value.push(newToast)

    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (title: string, description?: string) => {
    return showToast({ title, description, type: 'success' })
  }

  const error = (title: string, description?: string) => {
    return showToast({ title, description, type: 'error' })
  }

  const info = (title: string, description?: string) => {
    return showToast({ title, description, type: 'info' })
  }

  const warning = (title: string, description?: string) => {
    return showToast({ title, description, type: 'warning' })
  }

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }
}
