import { apiClient } from './apiClient'
import type { MasterApiResponse } from '../types/servicesMaster'
import type { DashboardOverview } from '../types/dashboard'

const BASE_PATH = '/api/dashboard/v1'

export async function getDashboardOverview(params?: { recentLimit?: number; trendDays?: number }) {
  const response = await apiClient.get<MasterApiResponse<DashboardOverview>>(`${BASE_PATH}/overview`, {
    params,
  })

  return response.data.data
}
