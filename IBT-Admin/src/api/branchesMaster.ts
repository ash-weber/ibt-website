import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  BranchListResult,
  BranchMasterItem,
  BranchMasterPayload,
  BranchType,
  BranchMemberAssignment,
} from '../types/branchesMaster'

const BASE_PATH = '/api/branches/v1'

export async function getBranchesMasterItems(params: { page: number; limit: number; search?: string; type?: BranchType }) {
  const response = await apiClient.get<MasterApiResponse<BranchMasterItem[]>>(BASE_PATH, {
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
  } satisfies BranchListResult
}

export async function getAllBranchesMasterItems() {
  const response = await apiClient.get<MasterApiResponse<BranchMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function getBranchMasterItem(branchId: string) {
  const response = await apiClient.get<MasterApiResponse<BranchMasterItem>>(`${BASE_PATH}/${branchId}`)
  return response.data.data
}

export async function createBranchesMasterItem(payload: BranchMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<BranchMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updateBranchesMasterItem(itemId: string, payload: BranchMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<BranchMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deleteBranchesMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}

export async function getBranchMembersPaginated(
  branchId: string,
  params: { page: number; limit: number; search?: string },
) {
  const response = await apiClient.get<MasterApiResponse<BranchMemberAssignment[]>>(`${BASE_PATH}/${branchId}/members`, {
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
  }
}

export async function getAllBranchMembers(branchId: string) {
  const response = await apiClient.get<MasterApiResponse<BranchMemberAssignment[]>>(`${BASE_PATH}/${branchId}/members`)
  return response.data.data
}

export async function assignMemberToBranch(branchId: string, payload: { memberId: string; order?: number }) {
  const response = await apiClient.post<MasterApiResponse<BranchMemberAssignment>>(`${BASE_PATH}/${branchId}/members`, payload)
  return response.data.data
}

export async function updateBranchMemberOrder(branchId: string, memberId: string, order: number) {
  const response = await apiClient.patch<MasterApiResponse<BranchMemberAssignment>>(
    `${BASE_PATH}/${branchId}/members/${memberId}`,
    { order },
  )

  return response.data.data
}

export async function removeMemberFromBranch(branchId: string, memberId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${branchId}/members/${memberId}`)
  return response.data.data
}
