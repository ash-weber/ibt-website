import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type {
  LabProjectListResult,
  LabProjectMasterItem,
  LabProjectMasterPayload,
  LabProjectStatus,
} from '../types/labProjectsMaster'

const BASE_PATH = '/api/lab-projects/v1'

export async function getLabProjectsMasterItems(params: {
  page: number
  limit: number
  search?: string
  status?: LabProjectStatus
  featured?: boolean
}) {
  const response = await apiClient.get<MasterApiResponse<LabProjectMasterItem[]>>(BASE_PATH, {
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
  } satisfies LabProjectListResult
}

export async function getAllLabProjectsMasterItems() {
  const response = await apiClient.get<MasterApiResponse<LabProjectMasterItem[]>>(BASE_PATH)
  return response.data.data
}

export async function createLabProjectMasterItem(payload: LabProjectMasterPayload) {
  const response = await apiClient.post<MasterApiResponse<LabProjectMasterItem>>(BASE_PATH, payload)
  return response.data.data
}

export async function updateLabProjectMasterItem(itemId: string, payload: LabProjectMasterPayload) {
  const response = await apiClient.patch<MasterApiResponse<LabProjectMasterItem>>(`${BASE_PATH}/${itemId}`, payload)
  return response.data.data
}

export async function deleteLabProjectMasterItem(itemId: string) {
  const response = await apiClient.delete<MasterApiResponse<{ success: true }>>(`${BASE_PATH}/${itemId}`)
  return response.data.data
}

export async function uploadLabProjectImage(file: File) {
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
  >('/api/uploads/v1/labs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}

export async function uploadLabProjectGalleryImages(files: File[]) {
  if (files.length === 0) {
    return []
  }

  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await apiClient.post<
    MasterApiResponse<
      Array<{
        category: string
        filename: string
        originalName: string
        mimeType: string
        size: number
        relativeUrl: string
        absoluteUrl: string
      }>
    >
  >('/api/uploads/v1/labs/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}
