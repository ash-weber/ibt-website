import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  ClientListResult,
  ClientMasterItem,
  ClientMasterPayload,
} from '../types/clientsMaster'

const BASE_PATH = '/api/clients/v1'

export async function getClientsMasterItems(params: { page: number; limit: number; search?: string }) {
  const response = await apiClient.get<MasterApiResponse<ClientMasterItem[]>>(BASE_PATH, {
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
  } satisfies ClientListResult
}

export async function getAllClientsMasterItems() {
  const response = await apiClient.get<MasterApiResponse<ClientMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function createClientsMasterItem(payload: ClientMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<ClientMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updateClientsMasterItem(itemId: string, payload: ClientMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<ClientMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deleteClientsMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}

export async function uploadClientLogo(file: File) {
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
  >('/api/uploads/v1/clients', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}
