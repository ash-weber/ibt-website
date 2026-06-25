import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  AuditLogItem,
  AuditLogListResult,
  AuditLogQueryParams,
} from '../types/auditLogs'

const BASE_PATH = '/api/audit-logs/v1'

export async function getAuditLogs(params: AuditLogQueryParams) {
  const response = await apiClient.get<MasterApiResponse<AuditLogItem[]>>(BASE_PATH, {
    params,
  })

  return {
    items: response.data.data,
    meta: response.data.meta ?? {
      page: params.page,
      limit: params.limit,
      total: response.data.data.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  } satisfies AuditLogListResult
}

export async function getAuditLogById(auditLogId: string) {
  const response = await apiClient.get<MasterApiResponse<AuditLogItem>>(`${BASE_PATH}/${auditLogId}`)
  return response.data.data
}
