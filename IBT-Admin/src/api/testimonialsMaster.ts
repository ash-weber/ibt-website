import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  TestimonialListResult,
  TestimonialMasterItem,
  TestimonialMasterPayload,
} from '../types/testimonialsMaster'

const BASE_PATH = '/api/testimonials/v1'

export async function getTestimonialsMasterItems(params: { page: number; limit: number; search?: string }) {
  const response = await apiClient.get<MasterApiResponse<TestimonialMasterItem[]>>(BASE_PATH, {
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
  } satisfies TestimonialListResult
}

export async function getAllTestimonialsMasterItems() {
  const response = await apiClient.get<MasterApiResponse<TestimonialMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function createTestimonialsMasterItem(payload: TestimonialMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<TestimonialMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updateTestimonialsMasterItem(itemId: string, payload: TestimonialMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<TestimonialMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deleteTestimonialsMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}

export async function uploadTestimonialAvatar(file: File) {
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
  >('/api/uploads/v1/testimonials', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}
