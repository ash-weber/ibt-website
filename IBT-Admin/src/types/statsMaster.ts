export type StatMasterItem = {
  id: string
  label: string
  value: string
  category: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export type StatMasterPayload = {
  label?: string
  value?: string
  category?: string
  order?: number
}

export type StatListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type StatListResult = {
  items: StatMasterItem[]
  meta: StatListMeta
}
