import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  PartnerListResult,
  PartnerMasterItem,
  PartnerMasterPayload,
} from '../types/partnersMaster'

const BASE_PATH = '/api/partners/v1'

export async function getPartnersMasterItems(params: { page: number; limit: number; search?: string }) {
  const response = await apiClient.get<MasterApiResponse<PartnerMasterItem[]>>(BASE_PATH, {
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
  } satisfies PartnerListResult
}

export async function getAllPartnersMasterItems() {
  const response = await apiClient.get<MasterApiResponse<PartnerMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function createPartnersMasterItem(payload: PartnerMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<PartnerMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updatePartnersMasterItem(itemId: string, payload: PartnerMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<PartnerMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deletePartnersMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}

export async function uploadPartnerLogo(file: File) {
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
  >('/api/uploads/v1/partners', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}
