import { apiClient } from './apiClient'
import type {
  MasterApiResponse,
  ServiceListResult,
  ServiceMasterItem,
  ServiceMasterPayload,
} from '../types/servicesMaster'

const BASE_PATH = '/api/services/v1'

export async function getServicesMasterItems(params: { page: number; limit: number; search?: string; tag?: string }) {
  const response = await apiClient.get<MasterApiResponse<ServiceMasterItem[]>>(BASE_PATH, {
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
  } satisfies ServiceListResult
}

export async function getAllServicesMasterItems() {
  const response = await apiClient.get<MasterApiResponse<ServiceMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function createServicesMasterItem(payload: ServiceMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<ServiceMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updateServicesMasterItem(itemId: string, payload: ServiceMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<ServiceMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deleteServicesMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}

export async function uploadServiceImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<
    MasterApiResponse<{
      category: string
      filename: string
      originalName: string
      mimeType: string
      size: number
      relativeUrl: string
      absoluteUrl: string
    }>
  >('/api/uploads/v1/services', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}
