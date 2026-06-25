import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  MemberListResult,
  MemberMasterItem,
  MemberMasterPayload,
} from '../types/membersMaster'

const BASE_PATH = '/api/members/v1'

export async function getMembersMasterItems(params: { page: number; limit: number; search?: string; branchId?: string }) {
  const response = await apiClient.get<MasterApiResponse<MemberMasterItem[]>>(BASE_PATH, {
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
  } satisfies MemberListResult
}

export async function getAllMembersMasterItems() {
  const response = await apiClient.get<MasterApiResponse<MemberMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function createMembersMasterItem(payload: MemberMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<MemberMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updateMembersMasterItem(itemId: string, payload: MemberMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<MemberMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deleteMembersMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}

export async function uploadMemberAvatar(file: File) {
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
  >('/api/uploads/v1/members', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}
