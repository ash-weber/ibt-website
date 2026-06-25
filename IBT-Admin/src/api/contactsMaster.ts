import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  ContactListResult,
  ContactMasterItem,
  ContactMasterPayload,
  ContactType,
} from '../types/contactsMaster'

const BASE_PATH = '/api/contacts/v1'

export async function getContactsMasterItems(params: { page: number; limit: number; search?: string; type?: ContactType }) {
  const response = await apiClient.get<MasterApiResponse<ContactMasterItem[]>>(BASE_PATH, {
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
  } satisfies ContactListResult
}

export async function getAllContactsMasterItems(params?: { search?: string; type?: ContactType }) {
  const response = await apiClient.get<MasterApiResponse<ContactMasterItem[]>>(BASE_PATH, {
    params,
  })
  return response.data.data
}

export async function createContactsMasterItem(payload: ContactMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<ContactMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updateContactsMasterItem(itemId: string, payload: ContactMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<ContactMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deleteContactsMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}
