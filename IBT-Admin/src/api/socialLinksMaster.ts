import { apiClient } from './apiClient'
import type {
  SocialLinkListResult,
  SocialLinkMasterItem,
  SocialLinkMasterPayload,
} from '../types/socialLinksMaster'

// I need to define MasterApiResponse to match other api wrappers.
// Let's assume it's like this:
interface MasterApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

const BASE_PATH = '/api/social-links/v1'

export async function getSocialLinksMasterItems(params: { page: number; limit: number; search?: string }) {
  const response = await apiClient.get<MasterApiResponse<SocialLinkMasterItem[]>>(BASE_PATH, {
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
  } satisfies SocialLinkListResult
}

export async function getAllSocialLinksMasterItems() {
  const response = await apiClient.get<MasterApiResponse<SocialLinkMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function createSocialLinksMasterItem(payload: SocialLinkMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<SocialLinkMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updateSocialLinksMasterItem(itemId: string, payload: SocialLinkMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<SocialLinkMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deleteSocialLinksMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}

// Assume the backend uses /api/uploads/v1/social-links or /api/uploads/v1/partners
export async function uploadSocialLinkLogo(file: File) {
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
  >('/api/uploads/v1/social-links', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}
