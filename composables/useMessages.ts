import { ref, type Ref } from 'vue'
import { useAuth } from '~/modules/auth/composables/useAuth'

export enum MessageType {
  REQUEST_DOCUMENT = 'request_document',
  GENERAL = 'general',
  STATUS_UPDATE = 'status_update',
  QUESTION = 'question',
}

export enum MessageSenderType {
  ADMIN = 'admin',
  CLIENT = 'client',
}

export interface POAMessage {
  id: string
  poaId: string
  senderId: string
  senderType: MessageSenderType
  type: MessageType
  subject: string
  message: string
  isRead: boolean
  readAt: Date | null
  createdAt: Date
  updatedAt: Date
  sender?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface CreateMessageDto {
  type: MessageType
  subject: string
  message: string
}

export interface UseMessagesReturn {
  messages: Ref<POAMessage[]>
  unreadCount: Ref<number>
  loading: Ref<boolean>
  error: Ref<Error | null>
  fetchMessages: (poaId: string) => Promise<void>
  sendMessage: (poaId: string, dto: CreateMessageDto) => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  getUnreadCount: () => Promise<void>
  refresh: (poaId: string) => Promise<void>
}

/**
 * Composable para manejar la mensajería del POA (Admin)
 * Permite enviar mensajes al cliente, listar mensajes y marcar como leídos
 */
export function useMessages(): UseMessagesReturn {
  const messages = ref<POAMessage[]>([])
  const unreadCount = ref<number>(0)
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

  const fetchMessages = async (poaId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: POAMessage[] }>(
        `/api/poa/admin/${poaId}/messages`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      )
      messages.value = response.data
    } catch (e: any) {
      error.value = e
      console.error('Error fetching messages:', e)
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (poaId: string, dto: CreateMessageDto) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: POAMessage }>(
        `/api/poa/admin/${poaId}/messages`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: dto,
        }
      )
      // Add the new message to the list
      messages.value.unshift(response.data)
    } catch (e: any) {
      error.value = e
      console.error('Error sending message:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await $fetch<{ success: boolean; data: POAMessage }>(
        `/api/poa/admin/messages/${messageId}/read`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
        }
      )
      // Update the message in the list
      const messageIndex = messages.value.findIndex((m) => m.id === messageId)
      if (messageIndex !== -1) {
        messages.value[messageIndex].isRead = true
        messages.value[messageIndex].readAt = new Date()
      }
      // Decrease unread count
      if (unreadCount.value > 0) {
        unreadCount.value--
      }
    } catch (e: any) {
      error.value = e
      console.error('Error marking message as read:', e)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      await $fetch(
        `/api/poa/admin/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      )
      // Remove the message from the list
      messages.value = messages.value.filter((m) => m.id !== messageId)
    } catch (e: any) {
      error.value = e
      console.error('Error deleting message:', e)
      throw e
    }
  }

  const getUnreadCount = async () => {
    try {
      const response = await $fetch<{ success: boolean; data: { unreadCount: number } }>(
        '/api/poa/admin/messages/unread-count',
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      )
      unreadCount.value = response.data.unreadCount
    } catch (e: any) {
      error.value = e
      console.error('Error fetching unread count:', e)
    }
  }

  const refresh = async (poaId: string) => {
    await Promise.all([fetchMessages(poaId), getUnreadCount()])
  }

  return {
    messages,
    unreadCount,
    loading,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    getUnreadCount,
    refresh,
  }
}
