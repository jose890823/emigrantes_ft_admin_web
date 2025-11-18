/**
 * Tipos y enums compartidos para mensajería del POA
 */

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

export enum ThreadType {
  GENERAL = 'general',
  QUESTION = 'question',
  REQUEST_DOCUMENT = 'request_document',
  STATUS_UPDATE = 'status_update',
}

export enum ThreadStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum ThreadCreatedBy {
  ADMIN = 'admin',
  CLIENT = 'client',
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface POAMessage {
  id: string
  poaId?: string
  threadId?: string
  senderId: string
  senderType: MessageSenderType
  type?: MessageType
  subject?: string
  message: string
  isRead: boolean
  readAt: Date | null
  createdAt: Date
  updatedAt: Date
  sender?: User
}

export interface POAThread {
  id: string
  poaId: string
  createdById: string
  createdByType: ThreadCreatedBy
  type: ThreadType
  subject: string
  status: ThreadStatus
  lastMessageAt: Date | null
  messageCount: number
  unreadCount: number
  createdAt: Date
  updatedAt: Date
  createdBy?: User
  messages?: POAMessage[]
}
