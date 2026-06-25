export type LabProjectStatus = 'ONGOING' | 'COMPLETED' | 'ARCHIVED'

export type LabProjectMasterItem = {
  id: string
  title: string
  slug: string
  description: string
  content: string | null
  imageUrl: string | null
  gallery: string[]
  tags: string[]
  techStack: string[]
  projectUrl: string | null
  repoUrl: string | null
  status: LabProjectStatus
  featured: boolean
  order: number | null
  createdAt: string
  updatedAt: string
}

export type LabProjectMasterPayload = {
  title?: string
  slug?: string
  description?: string
  content?: string | null
  imageUrl?: string | null
  gallery?: string[]
  tags?: string[]
  techStack?: string[]
  projectUrl?: string | null
  repoUrl?: string | null
  status?: LabProjectStatus
  featured?: boolean
  order?: number
}

export type LabProjectListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type LabProjectListResult = {
  items: LabProjectMasterItem[]
  meta: LabProjectListMeta
}
