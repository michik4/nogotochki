
import { apiService, ApiResponse } from './api';
import { Design } from '@/contexts/UserContext';

export interface CreateDesignData {
  title: string;
  category: string;
  price: string;
  duration: string;
  image: string;
  masterId: string;
}

export const designService = {
  async getDesigns(masterId?: string): Promise<ApiResponse<Design[]>> {
    const endpoint = masterId ? `/designs?masterId=${masterId}` : '/designs';
    return apiService.get<Design[]>(endpoint);
  },

  async createDesign(data: CreateDesignData): Promise<ApiResponse<Design>> {
    return apiService.post<Design>('/designs', data);
  },

  async updateDesign(designId: string, updates: Partial<Design>): Promise<ApiResponse<Design>> {
    return apiService.put<Design>(`/designs/${designId}`, updates);
  },

  async deleteDesign(designId: string): Promise<ApiResponse<null>> {
    return apiService.delete<null>(`/designs/${designId}`);
  },

  async toggleDesignStatus(designId: string): Promise<ApiResponse<Design>> {
    return apiService.put<Design>(`/designs/${designId}/toggle`, {});
  }
};
