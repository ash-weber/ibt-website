export type TestimonialMasterItem = {
  id: string
  name: string
  content: string
  role: string | null
  company: string | null
  avatarUrl: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export type TestimonialMasterPayload = {
  name?: string
  content?: string
  role?: string | null
  company?: string | null
  avatarUrl?: string | null
  order?: number
}

export type TestimonialListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type TestimonialListResult = {
  items: TestimonialMasterItem[]
  meta: TestimonialListMeta
}
