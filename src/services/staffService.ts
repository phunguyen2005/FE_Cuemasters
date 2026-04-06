import api from './api';

export const staffService = {
  getSchedule: () => api.get('/staff/schedule').then(res => res.data),
  getSessions: () => api.get('/staff/sessions').then(res => res.data),
  completeSession: (id: string, notes?: string) => api.put(`/staff/sessions/${id}/complete`, { notes }).then(res => res.data),
  getAvailability: () => api.get('/staff/availability').then(res => res.data),
};
