import { ref, type Ref } from 'vue'
import { useAuth } from '~/modules/auth/composables/useAuth'
import type { POAThread, POAMessage } from '~/types/poa-messages'
import {
  ThreadType,
  ThreadStatus,
  ThreadCreatedBy,
  MessageSenderType,
} from '~/types/poa-messages'

export interface CreateThreadDto {
  type: ThreadType
  subject: string
}

export interface CreateMessageInThreadDto {
  message: string
}

export interface UseThreadsReturn {
  threads: Ref<POAThread[]>
  currentThread: Ref<POAThread | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  fetchThreads: (poaId: string) => Promise<void>
  fetchThread: (threadId: string) => Promise<void>
  createThread: (poaId: string, dto: CreateThreadDto) => Promise<void>
  sendMessage: (threadId: string, dto: CreateMessageInThreadDto) => Promise<void>
  markThreadAsRead: (threadId: string) => Promise<void>
  closeThread: (threadId: string) => Promise<void>
  reopenThread: (threadId: string) => Promise<void>
  refresh: (poaId: string) => Promise<void>
}

/**
 * Composable para manejar hilos de conversación del POA (Admin)
 * Permite crear hilos, enviar mensajes, y gestionar el estado de los hilos
 */
export function useThreads(): UseThreadsReturn {
  const threads = ref<POAThread[]>([])
  const currentThread = ref<POAThread | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const { accessToken } = useAuth()

  /**
   * Obtener headers de autenticación
   */
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken.value && { Authorization: `Bearer ${accessToken.value}` }),
    }
  }

  const fetchThreads = async (poaId: string) => {
    loading.value = true
    error.value = null

    try {
      console.log(`[useThreads] Fetching threads for POA ${poaId}...`)
      threads.value = await $fetch<POAThread[]>(`/api/poa/admin/${poaId}/threads`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      console.log(`[useThreads] Received ${threads.value.length} threads:`, threads.value)
      threads.value.forEach((thread, index) => {
        console.log(`[useThreads] Thread ${index + 1}:`, {
          id: thread.id,
          subject: thread.subject,
          createdByType: thread.createdByType,
          status: thread.status,
          createdBy: thread.createdBy
        })
      })
    } catch (e: any) {
      error.value = e
      console.error('Error fetching threads:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchThread = async (threadId: string) => {
    loading.value = true
    error.value = null

    try {
      currentThread.value = await $fetch<POAThread>(`/api/poa/admin/threads/${threadId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
    } catch (e: any) {
      error.value = e
      console.error('Error fetching thread:', e)
    } finally {
      loading.value = false
    }
  }

  const createThread = async (poaId: string, dto: CreateThreadDto) => {
    loading.value = true
    error.value = null

    try {
      const newThread = await $fetch<POAThread>(`/api/poa/admin/${poaId}/threads`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: dto,
      })
      threads.value.unshift(newThread)
      currentThread.value = newThread
    } catch (e: any) {
      error.value = e
      console.error('Error creating thread:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (threadId: string, dto: CreateMessageInThreadDto) => {
    loading.value = true
    error.value = null

    try {
      const newMessage = await $fetch<POAMessage>(`/api/poa/admin/threads/${threadId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: dto,
      })

      // Update current thread if loaded
      if (currentThread.value && currentThread.value.id === threadId) {
        if (!currentThread.value.messages) {
          currentThread.value.messages = []
        }
        currentThread.value.messages.push(newMessage)
        currentThread.value.messageCount++
        currentThread.value.lastMessageAt = newMessage.createdAt
      }

      // Update thread in list
      const threadIndex = threads.value.findIndex((t) => t.id === threadId)
      if (threadIndex !== -1) {
        threads.value[threadIndex].messageCount++
        threads.value[threadIndex].lastMessageAt = newMessage.createdAt
      }
    } catch (e: any) {
      error.value = e
      console.error('Error sending message:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const markThreadAsRead = async (threadId: string) => {
    try {
      await $fetch(`/api/poa/admin/threads/${threadId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      // Update current thread
      if (currentThread.value && currentThread.value.id === threadId) {
        if (currentThread.value.messages) {
          currentThread.value.messages.forEach((msg) => {
            if (!msg.isRead && msg.senderType === MessageSenderType.CLIENT) {
              msg.isRead = true
              msg.readAt = new Date()
            }
          })
        }
        currentThread.value.unreadCount = 0
      }

      // Update thread in list
      const threadIndex = threads.value.findIndex((t) => t.id === threadId)
      if (threadIndex !== -1) {
        threads.value[threadIndex].unreadCount = 0
      }
    } catch (e: any) {
      error.value = e
      console.error('Error marking thread as read:', e)
    }
  }

  const closeThread = async (threadId: string) => {
    try {
      const updatedThread = await $fetch<POAThread>(`/api/poa/admin/threads/${threadId}/close`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      // Update current thread
      if (currentThread.value && currentThread.value.id === threadId) {
        currentThread.value.status = ThreadStatus.CLOSED
      }

      // Update thread in list
      const threadIndex = threads.value.findIndex((t) => t.id === threadId)
      if (threadIndex !== -1) {
        threads.value[threadIndex].status = ThreadStatus.CLOSED
      }
    } catch (e: any) {
      error.value = e
      console.error('Error closing thread:', e)
      throw e
    }
  }

  const reopenThread = async (threadId: string) => {
    try {
      const updatedThread = await $fetch<POAThread>(`/api/poa/admin/threads/${threadId}/reopen`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      // Update current thread
      if (currentThread.value && currentThread.value.id === threadId) {
        currentThread.value.status = ThreadStatus.OPEN
      }

      // Update thread in list
      const threadIndex = threads.value.findIndex((t) => t.id === threadId)
      if (threadIndex !== -1) {
        threads.value[threadIndex].status = ThreadStatus.OPEN
      }
    } catch (e: any) {
      error.value = e
      console.error('Error reopening thread:', e)
      throw e
    }
  }

  const refresh = async (poaId: string) => {
    await fetchThreads(poaId)
  }

  return {
    threads,
    currentThread,
    loading,
    error,
    fetchThreads,
    fetchThread,
    createThread,
    sendMessage,
    markThreadAsRead,
    closeThread,
    reopenThread,
    refresh,
  }
}
