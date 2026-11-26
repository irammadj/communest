const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toEstateDTO } = require("../mappers");
const {
  textLength,
  validContactEmail,
  validPhone,
  positiveInteger,
  inRangeInteger,
  isNonEmptyString,
  fail,
} = require("../validation");
const { ownership, asyncRoute } = require("../helpers");
const { uploadImage, resolveImage, removeImage } = require("../storage");
const multer = require("multer");
const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 11 },
});
const estateUpload = upload.fields([
  { name: "estatePhoto", maxCount: 1 },
  { name: "amenityPhotos", maxCount: 10 },
]);
const imageUrl = async (bucket, path) => resolveImage(bucket, path);
const estateWithImages = async (estate) => ({
  ...toEstateDTO(estate),
  estatePhoto: await imageUrl("estates", estate.estate_photo),
  amenityPhotos: await Promise.all(
    (estate.amenity_photos || []).map((photo) => imageUrl("extras", photo)),
  ).then((photos) => photos.filter(Boolean)),
});
const validateEstate = (body) => {
  if (
    !textLength(body.name, 4, 20) ||
    !textLength(body.location, 4, 20) ||
    !textLength(body.managementName, 4, 20)
  )
    return "Name, location, and management name must be 4 to 20 characters.";
  if (
    !isNonEmptyString(body.county) ||
    !validContactEmail(body.managementEmail) ||
    !validPhone(body.managementPhone) ||
    !isNonEmptyString(body.titleDeedNumber)
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
    res.json(await Promise.all(estates.map(estateWithImages)));
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
    res.json(await estateWithImages(data));
  }),
);
router.post(
  "/",
  auth,
  requireRole("regular_user"),
  estateUpload,
  asyncRoute(async (req, res) => {
    const body = {
      ...req.body,
      units: Number(req.body.units),
      totalArea: Number(req.body.totalArea),
    };
    const validationError = validateEstate(body);
    if (validationError) return fail(res, validationError);
    const estateFile = req.files?.estatePhoto?.[0];
    if (!estateFile) return fail(res, "An estate photo is required.");
    const { data: pendingEstate, error: pendingError } = await supabase
      .from("estates")
      .select("id")
      .eq("admin_id", req.user.id)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();
    if (pendingError)
      return res.status(500).json({ message: pendingError.message });
    if (pendingEstate)
      return res.status(409).json({
        message: "You already have an estate awaiting Communest Admin review.",
      });

    const amenityFiles = req.files?.amenityPhotos || [];
    const estatePath = await uploadImage("estates", "estate", estateFile);
    const amenityPaths = await Promise.all(
      amenityFiles.map((file) => uploadImage("extras", "amenity", file)),
    );
    const { data, error } = await supabase
      .from("estates")
      .insert({
        ...mapInsert({
          ...body,
          estatePhoto: estatePath,
          amenityPhotos: amenityPaths,
        }),
        status: "pending",
        admin_id: req.user.id,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(await estateWithImages(data));
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
router.get(
  "/:id/admins",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.id))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("estate_id", req.params.id)
      .eq("role", "estate_admin")
      .order("name");
    if (error) return res.status(500).json({ message: error.message });
    res.json(data || []);
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
      .eq("status", "pending")
      .select()
      .maybeSingle();
    if (error) return res.status(500).json({ message: error.message });
    if (!data)
      return res
        .status(409)
        .json({ message: "This estate is no longer awaiting review." });

    if (req.body.status === "approved") {
      if (!data.admin_id) {
        const { error: rollbackError } = await supabase
          .from("estates")
          .update({ status: "pending" })
          .eq("id", data.id)
          .eq("status", "approved");
        if (rollbackError)
          return res.status(500).json({ message: rollbackError.message });
        return res
          .status(409)
          .json({ message: "This estate has no submitting account." });
      }

      const { data: promotedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({ role: "estate_admin", estate_id: data.id })
        .eq("id", data.admin_id)
        .select("id")
        .maybeSingle();
      if (profileError || !promotedProfile) {
        const { error: rollbackError } = await supabase
          .from("estates")
          .update({ status: "pending" })
          .eq("id", data.id)
          .eq("status", "approved");
        if (rollbackError)
          return res.status(500).json({ message: rollbackError.message });
        return res.status(profileError ? 500 : 409).json({
          message:
            profileError?.message ||
            "The estate owner account could not be granted admin access.",
        });
      }
    } else if (data.admin_id) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "regular_user", estate_id: null })
        .eq("id", data.admin_id)
        .eq("role", "estate_admin")
        .eq("estate_id", data.id);
      if (profileError) {
        const { error: rollbackError } = await supabase
          .from("estates")
          .update({ status: "pending" })
          .eq("id", data.id)
          .eq("status", "denied");
        if (rollbackError)
          return res.status(500).json({ message: rollbackError.message });
        return res.status(500).json({ message: profileError.message });
      }
    }

    res.json(await estateWithImages(data));
  }),
);
router.patch(
  "/:id/photo",
  auth,
  requireRole("estate_admin"),
  upload.single("estatePhoto"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.id))
      return res.status(403).json({ message: "Forbidden." });
    if (!req.file) return fail(res, "Estate photo is required.");
    const existing = await supabase
      .from("estates")
      .select("estate_photo")
      .eq("id", req.params.id)
      .single();
    const estatePath = await uploadImage("estates", "estate", req.file);
    const { data, error } = await supabase
      .from("estates")
      .update({ estate_photo: estatePath })
      .eq("id", req.params.id)
      .select()
      .single();
    console.log(data, error);
    if (error || !data)
      return res.status(404).json({ message: "Estate not found." });
    if (!error && existing.data)
      await removeImage("estates", existing.data.estate_photo);
    res.json(await estateWithImages(data));
  }),
);
module.exports = router;
