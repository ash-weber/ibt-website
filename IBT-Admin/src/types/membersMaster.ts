export type MemberBranch = {
  id: string
  branchId: string
  memberId: string
  order: number
  branch: {
    id: string
    name: string
    location: string
    type: 'HEADQUARTERS' | 'REGIONAL' | 'INTERNATIONAL'
  }
}

export type MemberMasterItem = {
  id: string
  name: string
  role: string
  avatarUrl: string
  email: string
  linkedinUrl?: string | null
  phone: string
  order?: number
  branches: MemberBranch[]
  createdAt: string
  updatedAt: string
}

export type MemberMasterPayload = {
  name?: string
  role?: string
  avatarUrl?: string
  email?: string
  linkedinUrl?: string
  phone?: string
  order?: number
}

export type MemberListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type MemberListResult = {
  items: MemberMasterItem[]
  meta: MemberListMeta
}
