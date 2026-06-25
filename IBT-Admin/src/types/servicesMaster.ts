export type MasterApiResponse<T> = {
  success: boolean
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export type ServiceMasterItem = {
  id: string
  title: string
  slug: string
  description: string
  imageUrl: string
  tags: string[]
  projectUrl?: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export type ServiceMasterPayload = {
  title?: string
  slug?: string
  description?: string
  imageUrl?: string
  tags?: string[]
  projectUrl?: string | null
  order?: number
}

export type ServiceListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type ServiceListResult = {
  items: ServiceMasterItem[]
  meta: ServiceListMeta
}
