const toUserDTO = (p) => ({
  id: p.id,
  name: p.name,
  email: p.email,
  phone: p.phone,
  role: p.role,
  profilePicture: p.profile_picture,
  emailVerified: p.email_verified,
  phoneVerified: p.phone_verified,
  estateId: p.estate_id,
});

const toEstateDTO = (e) => ({
  id: e.id,
  name: e.name,
  location: e.location,
  county: e.county,
  units: e.units,
  totalArea: e.total_area,
  description: e.description,
  managementName: e.management_name,
  managementEmail: e.management_email,
  managementPhone: e.management_phone,
  titleDeedNumber: e.title_deed_number,
  estatePhoto: e.estate_photo,
  amenityPhotos: e.amenity_photos || [],
  status: e.status,
  adminId: e.admin_id,
  submittedAt: e.submitted_at,
});

const toHouseDTO = (h) => ({
  id: h.id,
  estateId: h.estate_id,
  houseNumber: h.house_number,
  totalArea: h.total_area,
  rooms: h.rooms,
  photos: h.photos || [],
  amenities: h.amenities || [],
  rentAmount: h.rent_amount,
  managerPhone: h.manager_phone,
  status: h.status,
  occupiedAt: h.occupied_at,
  tenantName: h.tenant_name,
  paymentStatus: h.payment_status,
});

const toProposalDTO = (p) => ({
  id: p.id,
  estateId: p.estate_id,
  houseId: p.house_id,
  name: p.name,
  email: p.email,
  phone: p.phone,
  submittedAt: p.submitted_at,
  status: p.status,
});

const toNotifDTO = (n) => ({
  id: n.id,
  estateId: n.estate_id,
  title: n.title,
  eventDate: n.event_date,
  description: n.description,
  createdAt: n.created_at,
});
const toMaintenanceDTO = (m) => ({
  id: m.id,
  estateId: m.estate_id,
  title: m.title,
  description: m.description,
  status: m.status,
  createdAt: m.created_at,
});
const toPaymentOptionDTO = (p) => ({
  id: p.id,
  estateId: p.estate_id,
  name: p.name,
  details: p.details,
});
const toInquiryDTO = (i) => ({
  id: i.id,
  estateId: i.estate_id,
  houseId: i.house_id,
  tenantId: i.tenant_id,
  tenantName: i.tenant_name,
  unit: i.unit,
  message: i.message,
  reply: i.reply,
  status: i.status,
  createdAt: i.created_at,
  repliedAt: i.replied_at,
});

module.exports = {
  toUserDTO,
  toEstateDTO,
  toHouseDTO,
  toProposalDTO,
  toNotifDTO,
  toMaintenanceDTO,
  toPaymentOptionDTO,
  toInquiryDTO,
};
