export type PartnerMasterItem = {
  id: string
  name: string
  logoUrl: string
  website: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export type PartnerMasterPayload = {
  name?: string
  logoUrl?: string
  website?: string | null
  order?: number
}

export type PartnerListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PartnerListResult = {
  items: PartnerMasterItem[]
  meta: PartnerListMeta
}
