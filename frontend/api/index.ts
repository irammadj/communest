import { projectId } from '../../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5d5fb4b7`;

async function request<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  register: (payload: { name: string; email: string; phone: string; password: string }) =>
    request<{ message: string }>('POST', '/auth/register', payload),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: UserDTO }>('POST', '/auth/login', payload),

  logout: (token: string) =>
    request<{ message: string }>('POST', '/auth/logout', undefined, token),
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profile = {
  get: (token: string) => request<UserDTO>('GET', '/profile', undefined, token),

  update: (token: string, payload: Partial<{ name: string; phone: string; profilePicture: string }>) =>
    request<UserDTO>('PATCH', '/profile', payload, token),

  deleteAccount: (token: string) =>
    request<{ message: string }>('DELETE', '/profile', undefined, token),
};

// ─── Estates ──────────────────────────────────────────────────────────────────

export const estates = {
  list: (params?: { county?: string; maxRent?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.county) qs.set('county', params.county);
    if (params?.maxRent) qs.set('maxRent', String(params.maxRent));
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return request<EstateDTO[]>('GET', `/estates${query ? `?${query}` : ''}`);
  },

  get: (id: string) => request<EstateDTO>('GET', `/estates/${id}`),

  create: (token: string, payload: CreateEstatePayload) =>
    request<EstateDTO>('POST', '/estates', payload, token),

  updateStatus: (token: string, id: string, status: 'approved' | 'denied') =>
    request<EstateDTO>('PATCH', `/estates/${id}/status`, { status }, token),

  updatePhoto: (token: string, id: string, estatePhoto: string) =>
    request<EstateDTO>('PATCH', `/estates/${id}/photo`, { estatePhoto }, token),
};

// ─── Houses ───────────────────────────────────────────────────────────────────

export const houses = {
  list: (estateId: string) =>
    request<HouseDTO[]>('GET', `/estates/${estateId}/houses`),

  create: (token: string, estateId: string, payload: CreateHousePayload) =>
    request<HouseDTO>('POST', `/estates/${estateId}/houses`, payload, token),

  updateStatus: (token: string, id: string, status: 'vacant' | 'occupied') =>
    request<HouseDTO>('PATCH', `/houses/${id}/status`, { status }, token),

  updatePayment: (token: string, id: string, paymentStatus: 'paid' | 'pending') =>
    request<HouseDTO>('PATCH', `/houses/${id}/payment`, { paymentStatus }, token),
};

// ─── Proposals ────────────────────────────────────────────────────────────────

export const proposals = {
  create: (payload: { estateId: string; houseId: string; name: string; email: string; phone: string }) =>
    request<{ message: string; proposalId: string }>('POST', '/proposals', payload),

  list: (token: string, estateId: string) =>
    request<ProposalDTO[]>('GET', `/estates/${estateId}/proposals`, undefined, token),

  updateStatus: (token: string, id: string, status: 'approved' | 'rejected') =>
    request<ProposalDTO>('PATCH', `/proposals/${id}/status`, { status }, token),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = {
  list: (token: string, estateId: string) =>
    request<NotificationDTO[]>('GET', `/estates/${estateId}/notifications`, undefined, token),

  create: (token: string, estateId: string, payload: { title: string; eventDate: string; description: string }) =>
    request<NotificationDTO>('POST', `/estates/${estateId}/notifications`, payload, token),

  delete: (token: string, id: string) =>
    request<{ message: string }>('DELETE', `/notifications/${id}`, undefined, token),
};

// ─── Maintenance ──────────────────────────────────────────────────────────────

export const maintenance = {
  list: (token: string, estateId: string) =>
    request<MaintenanceDTO[]>('GET', `/estates/${estateId}/maintenance`, undefined, token),

  create: (token: string, estateId: string, payload: { title: string; description: string }) =>
    request<MaintenanceDTO>('POST', `/estates/${estateId}/maintenance`, payload, token),

  updateStatus: (token: string, id: string, status: 'scheduled' | 'in_progress' | 'resolved') =>
    request<MaintenanceDTO>('PATCH', `/maintenance/${id}/status`, { status }, token),

  delete: (token: string, id: string) =>
    request<{ message: string }>('DELETE', `/maintenance/${id}`, undefined, token),
};

// ─── Payment Options ──────────────────────────────────────────────────────────

export const paymentOptions = {
  list: (token: string, estateId: string) =>
    request<PaymentOptionDTO[]>('GET', `/estates/${estateId}/payment-options`, undefined, token),

  create: (token: string, estateId: string, payload: { name: string; details: string }) =>
    request<PaymentOptionDTO>('POST', `/estates/${estateId}/payment-options`, payload, token),

  delete: (token: string, id: string) =>
    request<{ message: string }>('DELETE', `/payment-options/${id}`, undefined, token),
};

// ─── Inquiries ────────────────────────────────────────────────────────────────

export const inquiries = {
  list: (token: string, estateId: string) =>
    request<InquiryDTO[]>('GET', `/estates/${estateId}/inquiries`, undefined, token),

  create: (token: string, estateId: string, payload: { houseId: string; message: string }) =>
    request<InquiryDTO>('POST', `/estates/${estateId}/inquiries`, payload, token),

  reply: (token: string, id: string, reply: string) =>
    request<InquiryDTO>('PATCH', `/inquiries/${id}/reply`, { reply }, token),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const admin = {
  addAdmin: (token: string, email: string) =>
    request<{ message: string }>('POST', '/admin/add-admin', { email }, token),

  allEstates: (token: string) =>
    request<EstateDTO[]>('GET', '/admin/estates', undefined, token),
};

// ─── DTO Types ────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'communest_admin' | 'estate_admin' | 'tenant' | 'regular_user';
  profilePicture?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  estateId?: string;
}

export interface EstateDTO {
  id: string;
  name: string;
  location: string;
  county: string;
  units: number;
  totalArea: number;
  description?: string;
  managementName: string;
  managementEmail: string;
  managementPhone: string;
  titleDeedNumber: string;
  estatePhoto: string;
  amenityPhotos: string[];
  status: 'pending' | 'approved' | 'denied';
  adminId: string;
  submittedAt: string;
}

export interface HouseDTO {
  id: string;
  estateId: string;
  houseNumber: string;
  totalArea: number;
  rooms: number;
  photos: string[];
  amenities: string[];
  rentAmount: number;
  managerPhone: string;
  status: 'vacant' | 'occupied';
  occupiedAt?: string;
  tenantName?: string;
  paymentStatus?: 'paid' | 'pending';
}

export interface ProposalDTO {
  id: string;
  estateId: string;
  houseId: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface NotificationDTO {
  id: string;
  estateId: string;
  title: string;
  eventDate: string;
  description: string;
  createdAt: string;
}

export interface MaintenanceDTO {
  id: string;
  estateId: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface PaymentOptionDTO {
  id: string;
  estateId: string;
  name: string;
  details: string;
}

export interface InquiryDTO {
  id: string;
  estateId: string;
  houseId: string;
  tenantId: string;
  tenantName: string;
  unit: string;
  message: string;
  reply?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  repliedAt?: string;
}

export interface CreateEstatePayload {
  name: string;
  location: string;
  county: string;
  units: number;
  totalArea: number;
  description?: string;
  managementName: string;
  managementEmail: string;
  managementPhone: string;
  titleDeedNumber: string;
  estatePhoto: string;
  amenityPhotos?: string[];
}

export interface CreateHousePayload {
  houseNumber: string;
  totalArea: number;
  rooms: number;
  photos?: string[];
  amenities?: string[];
  rentAmount: number;
  managerPhone: string;
}
