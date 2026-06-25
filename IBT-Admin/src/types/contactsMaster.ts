export type ContactType = 'PHONE' | 'EMAIL' | 'ADDRESS'

export type ContactMasterItem = {
  id: string
  type: ContactType
  value: string
  order: number
  createdAt: string
  updatedAt: string
}

export type ContactMasterPayload = {
  type?: ContactType
  value?: string
  order?: number
}

export type ContactListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type ContactListResult = {
  items: ContactMasterItem[]
  meta: ContactListMeta
}
