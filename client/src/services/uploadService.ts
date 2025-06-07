
import { apiService, ApiResponse } from './api';
import { Upload } from '@/contexts/UserContext';

export interface CreateUploadData {
  title: string;
  type: 'photo' | 'video';
  file: File;
  userId: string;
}

export const uploadService = {
  async getUploads(userId: string): Promise<ApiResponse<Upload[]>> {
    return apiService.get<Upload[]>(`/uploads?userId=${userId}`);
  },

  async createUpload(data: CreateUploadData): Promise<ApiResponse<Upload>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('file', data.file);
    formData.append('userId', data.userId);

    const response = await fetch(`${apiService['baseUrl']}/uploads`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async deleteUpload(uploadId: string): Promise<ApiResponse<null>> {
    return apiService.delete<null>(`/uploads/${uploadId}`);
  },

  async likeUpload(uploadId: string): Promise<ApiResponse<Upload>> {
    return apiService.post<Upload>(`/uploads/${uploadId}/like`, {});
  }
};
