export interface SocialLinkMasterItem {
  id: string;
  platform: string;
  logoUrl: string;
  url: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type SocialLinkMasterPayload = Omit<SocialLinkMasterItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>;

export interface SocialLinkListResult {
  items: SocialLinkMasterItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
