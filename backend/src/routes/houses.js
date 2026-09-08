const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toHouseDTO } = require("../mappers");
const {
  positiveInteger,
  isNonEmptyString,
  validPhone,
  fail,
} = require("../validation");
const { ownership, asyncRoute } = require("../helpers");
const router = express.Router();
const validateHouse = (b) => {
  if (
    !isNonEmptyString(b.houseNumber) ||
    !positiveInteger(b.totalArea) ||
    !positiveInteger(b.rooms) ||
    !positiveInteger(b.rentAmount) ||
    !validPhone(b.managerPhone)
  )
    return "House number, area, rooms, rent, and manager phone are required and must be valid.";
  if (
    b.photos !== undefined &&
    (!Array.isArray(b.photos) || b.photos.some((v) => typeof v !== "string"))
  )
    return "Photos must be an array of URL strings.";
  if (
    b.amenities !== undefined &&
    (!Array.isArray(b.amenities) ||
      b.amenities.some((v) => typeof v !== "string"))
  )
    return "Amenities must be an array of strings.";
  return null;
};
router.get(
  "/estates/:estateId/houses",
  asyncRoute(async (req, res) => {
    const { data, error } = await supabase
      .from("houses")
      .select("*")
      .eq("estate_id", req.params.estateId)
      .order("house_number");
    if (error) return res.status(500).json({ message: error.message });
    res.json((data || []).map(toHouseDTO));
  }),
);
router.post(
  "/estates/:estateId/houses",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    const validationError = validateHouse(req.body);
    if (validationError) return fail(res, validationError);
    const { data, error } = await supabase
      .from("houses")
      .insert({
        estate_id: req.params.estateId,
        house_number: req.body.houseNumber.trim(),
        total_area: req.body.totalArea,
        rooms: req.body.rooms,
        photos: req.body.photos || [],
        amenities: req.body.amenities || [],
        rent_amount: req.body.rentAmount,
        manager_phone: req.body.managerPhone,
        status: "vacant",
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(toHouseDTO(data));
  }),
);
router.patch(
  "/houses/:id/status",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!["vacant", "occupied"].includes(req.body.status))
      return fail(res, "Status must be vacant or occupied.");
    const { data: house } = await supabase
      .from("houses")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (!house) return res.status(404).json({ message: "House not found." });
    if (!ownership(req, house.estate_id))
      return res.status(403).json({ message: "Forbidden." });
    const updates =
      req.body.status === "occupied"
        ? { status: "occupied", occupied_at: new Date().toISOString() }
        : {
            status: "vacant",
            occupied_at: null,
            tenant_name: null,
            payment_status: null,
          };
    const { data, error } = await supabase
      .from("houses")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.json(toHouseDTO(data));
  }),
);
router.patch(
  "/houses/:id/payment",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!["paid", "pending"].includes(req.body.paymentStatus))
      return fail(res, "Payment status must be paid or pending.");
    const { data: house } = await supabase
      .from("houses")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (!house) return res.status(404).json({ message: "House not found." });
    if (!ownership(req, house.estate_id))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("houses")
      .update({ payment_status: req.body.paymentStatus })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.json(toHouseDTO(data));
  }),
);
module.exports = router;
