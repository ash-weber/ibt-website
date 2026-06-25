import { apiClient } from './apiClient';

export interface SendNotificationPayload {
  emails: string[];
  subject: string;
  message: string;
}

export const sendBulkNotification = async (payload: SendNotificationPayload): Promise<void> => {
  await apiClient.post('/api/notifications/v1/admin/send', payload);
};
