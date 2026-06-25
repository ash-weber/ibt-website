import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  PartnerCollegeListResult,
  PartnerCollegeMasterItem,
  PartnerCollegeMasterPayload,
} from '../types/partnerCollegesMaster'

const BASE_PATH = '/api/partner-colleges/v1'

export async function getPartnerCollegesMasterItems(params: { page: number; limit: number; search?: string }) {
  const response = await apiClient.get<MasterApiResponse<PartnerCollegeMasterItem[]>>(BASE_PATH, {
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
  } satisfies PartnerCollegeListResult
}

export async function getAllPartnerCollegesMasterItems() {
  const response = await apiClient.get<MasterApiResponse<PartnerCollegeMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function createPartnerCollegesMasterItem(payload: PartnerCollegeMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<PartnerCollegeMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updatePartnerCollegesMasterItem(itemId: string, payload: PartnerCollegeMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<PartnerCollegeMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deletePartnerCollegesMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}

export async function uploadCollegeLogo(file: File) {
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
  >('/api/uploads/v1/colleges', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}
