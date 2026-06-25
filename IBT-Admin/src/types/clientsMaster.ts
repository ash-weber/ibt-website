export type ClientMasterItem = {
  id: string
  name: string
  logoUrl: string
  website?: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export type ClientMasterPayload = {
  name?: string
  logoUrl?: string
  website?: string | null
  order?: number
}

export type ClientListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type ClientListResult = {
  items: ClientMasterItem[]
  meta: ClientListMeta
}
