const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toEstateDTO } = require("../mappers");
const {
  textLength,
  validEmail,
  validPhone,
  positiveInteger,
  inRangeInteger,
  isNonEmptyString,
  fail,
} = require("../validation");
const { ownership, asyncRoute } = require("../helpers");
const router = express.Router();
const validateEstate = (body) => {
  if (
    !textLength(body.name, 4, 20) ||
    !textLength(body.location, 4, 20) ||
    !textLength(body.managementName, 4, 20)
  )
    return "Name, location, and management name must be 4 to 20 characters.";
  if (
    !isNonEmptyString(body.county) ||
    !validEmail(body.managementEmail) ||
    !validPhone(body.managementPhone) ||
    !isNonEmptyString(body.titleDeedNumber) ||
    !isNonEmptyString(body.estatePhoto)
  )
    return "Please provide valid estate, management, legal, and photo details.";
  if (!inRangeInteger(body.units, 1, 1000))
    return "Units must be an integer between 1 and 1000.";
  if (!positiveInteger(body.totalArea))
    return "Total area must be a positive integer.";
  if (body.description !== undefined && typeof body.description !== "string")
    return "Description must be text.";
  if (
    body.amenityPhotos !== undefined &&
    (!Array.isArray(body.amenityPhotos) ||
      body.amenityPhotos.some((photo) => typeof photo !== "string"))
  )
    return "Amenity photos must be an array of URL strings.";
  return null;
};
const mapInsert = (b) => ({
  name: b.name.trim(),
  location: b.location.trim(),
  county: b.county.trim(),
  units: b.units,
  total_area: b.totalArea,
  description: b.description || null,
  management_name: b.managementName.trim(),
  management_email: b.managementEmail.trim(),
  management_phone: b.managementPhone.trim(),
  title_deed_number: b.titleDeedNumber.trim(),
  estate_photo: b.estatePhoto,
  amenity_photos: b.amenityPhotos || [],
});

router.get(
  "/",
  asyncRoute(async (req, res) => {
    let query = supabase.from("estates").select("*").eq("status", "approved");
    if (req.query.county) query = query.eq("county", req.query.county);
    if (req.query.search)
      query = query.or(
        `name.ilike.%${req.query.search}%,location.ilike.%${req.query.search}%`,
      );
    const { data, error } = await query.order("submitted_at", {
      ascending: false,
    });
    if (error) return res.status(500).json({ message: error.message });
    let estates = data || [];
    if (req.query.maxRent) {
      const maxRent = Number(req.query.maxRent);
      if (!Number.isFinite(maxRent))
        return fail(res, "maxRent must be a number.");
      const { data: houses, error: houseError } = await supabase
        .from("houses")
        .select("estate_id")
        .eq("status", "vacant")
        .lt("rent_amount", maxRent);
      if (houseError)
        return res.status(500).json({ message: houseError.message });
      const ids = new Set((houses || []).map((house) => house.estate_id));
      estates = estates.filter((estate) => ids.has(estate.id));
    }
    res.json(estates.map(toEstateDTO));
  }),
);
router.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const { data, error } = await supabase
      .from("estates")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (error || !data)
      return res.status(404).json({ message: "Estate not found." });
    res.json(toEstateDTO(data));
  }),
);
router.post(
  "/",
  auth,
  requireRole("regular_user", "estate_admin"),
  asyncRoute(async (req, res) => {
    const validationError = validateEstate(req.body);
    if (validationError) return fail(res, validationError);
    const { data, error } = await supabase
      .from("estates")
      .insert({
        ...mapInsert(req.body),
        status: "pending",
        admin_id: req.user.id,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "estate_admin", estate_id: data.id })
      .eq("id", req.user.id);
    if (profileError)
      return res.status(500).json({ message: profileError.message });
    req.user.profile.role = "estate_admin";
    req.user.profile.estate_id = data.id;
    res.status(201).json(toEstateDTO(data));
  }),
);
router.post(
  "/:estateId/admins",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    if (!validEmail(req.body.email))
      return fail(res, "A valid email is required.");
    const email = req.body.email.trim();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .single();
    if (!profile) return res.status(404).json({ message: "User not found." });
    if (profile.role !== "regular_user")
      return fail(res, "Only regular users can become Estate Admins.");
    const { error } = await supabase
      .from("profiles")
      .update({ role: "estate_admin", estate_id: req.params.estateId })
      .eq("id", profile.id);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: `Estate Admin access granted to ${email}.` });
  }),
);
router.patch(
  "/:id/status",
  auth,
  requireRole("communest_admin"),
  asyncRoute(async (req, res) => {
    if (!["approved", "denied"].includes(req.body.status))
      return fail(res, "Status must be approved or denied.");
    const { data, error } = await supabase
      .from("estates")
      .update({ status: req.body.status })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error || !data)
      return res.status(404).json({ message: "Estate not found." });
    res.json(toEstateDTO(data));
  }),
);
router.patch(
  "/:id/photo",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.id))
      return res.status(403).json({ message: "Forbidden." });
    if (!isNonEmptyString(req.body.estatePhoto))
      return fail(res, "Estate photo is required.");
    const { data, error } = await supabase
      .from("estates")
      .update({ estate_photo: req.body.estatePhoto })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error || !data)
      return res.status(404).json({ message: "Estate not found." });
    res.json(toEstateDTO(data));
  }),
);
module.exports = router;
