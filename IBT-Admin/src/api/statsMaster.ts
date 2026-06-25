import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  StatListResult,
  StatMasterItem,
  StatMasterPayload,
} from '../types/statsMaster'

const BASE_PATH = '/api/stats/v1'

export async function getStatsMasterItems(params: { page: number; limit: number; search?: string; category?: string }) {
  const response = await apiClient.get<MasterApiResponse<StatMasterItem[]>>(BASE_PATH, {
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
  } satisfies StatListResult
}

export async function getAllStatsMasterItems() {
  const response = await apiClient.get<MasterApiResponse<StatMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function createStatsMasterItem(payload: StatMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<StatMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updateStatsMasterItem(itemId: string, payload: StatMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<StatMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deleteStatsMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}
