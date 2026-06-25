export type BranchType = 'HEADQUARTERS' | 'REGIONAL' | 'INTERNATIONAL'

export type BranchMemberAssignment = {
  id: string
  branchId: string
  memberId: string
  order: number
  member: {
    id: string
    name: string
    role: string
    avatarUrl: string
    email: string
    phone: string
  }
  createdAt: string
  updatedAt: string
}

export type BranchMasterItem = {
  id: string
  name: string
  location: string
  type: BranchType
  order: number
  _count: {
    teamMembers: number
  }
  createdAt: string
  updatedAt: string
}

export type BranchMasterPayload = {
  name?: string
  location?: string
  type?: BranchType
  order?: number
}

export type BranchListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type BranchListResult = {
  items: BranchMasterItem[]
  meta: BranchListMeta
}
