export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN'

export type AuditLogUser = {
  id: string
  email: string
  name: string | null
  role: string
}

export type AuditLogItem = {
  id: string
  userId: string | null
  action: AuditAction
  entity: string
  entityId: string
  oldData: unknown | null
  newData: unknown | null
  user: AuditLogUser | null
  createdAt: string
}

export type AuditLogListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type AuditLogListResult = {
  items: AuditLogItem[]
  meta: AuditLogListMeta
}

export type AuditLogQueryParams = {
  page: number
  limit: number
  action?: AuditAction
  entity?: string
  entityId?: string
  userId?: string
  search?: string
  from?: string
  to?: string
}
