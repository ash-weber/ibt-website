import { apiClient } from './apiClient';

export interface LabIdea {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  category: string;
  ideaTitle: string;
  description: string;
  attachments: string[];
  privacyAccepted: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface LabIdeaResponse {
  items: LabIdea[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export const getLabIdeas = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  category?: string
): Promise<LabIdeaResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (category) params.append('category', category);

  const response = await apiClient.get<{ data: LabIdeaResponse }>(`/api/lab-ideas/v1/admin?${params.toString()}`);
  return response.data.data;
};

export const updateLabIdeaStatus = async (params: { id: string; status: string }): Promise<LabIdea> => {
  const response = await apiClient.patch<{ data: LabIdea }>(`/api/lab-ideas/v1/admin/${params.id}/status`, {
    status: params.status,
  });
  return response.data.data;
};

export const deleteLabIdea = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/lab-ideas/v1/admin/${id}`);
};
