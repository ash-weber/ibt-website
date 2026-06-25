import { apiClient } from './apiClient'

export interface InternshipApplication {
  id: string
  name: string
  email: string
  phone: string
  about: string
  skills: string
  jobType: string
  applicationType: string
  resumeUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export const getApplications = async (): Promise<InternshipApplication[]> => {
  const { data } = await apiClient.get('/api/internship/v1/applications')
  return data.data
}

export const updateApplicationStatus = async ({ id, status }: { id: string; status: string }): Promise<InternshipApplication> => {
  const { data } = await apiClient.patch(`/api/internship/v1/applications/${id}/status`, { status })
  return data.data
}

export const deleteApplication = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/internship/v1/applications/${id}`)
}
