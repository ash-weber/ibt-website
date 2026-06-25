export type PartnerCollegeMasterItem = {
  id: string
  name: string
  logoUrl: string
  website: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export type PartnerCollegeMasterPayload = {
  name?: string
  logoUrl?: string
  website?: string | null
  order?: number
}

export type PartnerCollegeListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PartnerCollegeListResult = {
  items: PartnerCollegeMasterItem[]
  meta: PartnerCollegeListMeta
}
