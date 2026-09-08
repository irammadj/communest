export type UserRole = 'communest_admin' | 'estate_admin' | 'tenant' | 'regular_user' | 'outsider';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePicture?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  estateId?: string;
}

export interface House {
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

export interface Notification {
  id: string;
  estateId: string;
  title: string;
  eventDate: string;
  description: string;
  createdAt: string;
}

export interface MaintenanceIssue {
  id: string;
  estateId: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface PaymentOption {
  id: string;
  estateId: string;
  name: string;
  details: string;
}

export interface Inquiry {
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

export interface RentalProposal {
  id: string;
  estateId: string;
  houseId: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Estate {
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
