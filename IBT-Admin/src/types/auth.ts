export type AuthUser = {
  id: string
  email: string
  name: string | null
  role: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type LoginResponseData = {
  token: string
  user: AuthUser
}
