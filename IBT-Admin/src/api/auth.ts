import { apiClient } from './apiClient'
import type { ApiResponse, LoginPayload, LoginResponseData, AuthUser } from '../types/auth'

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/api/auth/v1/login', payload)
  return response.data
}

export async function getMe() {
  const response = await apiClient.get<ApiResponse<AuthUser>>('/api/auth/v1/me')
  return response.data.data
}
