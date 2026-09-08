const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toInquiryDTO } = require("../mappers");
const { isNonEmptyString, fail } = require("../validation");
const { ownership, asyncRoute } = require("../helpers");
const router = express.Router();
router.get(
  "/estates/:estateId/inquiries",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .eq("estate_id", req.params.estateId)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    res.json((data || []).map(toInquiryDTO));
  }),
);
router.post(
  "/estates/:estateId/inquiries",
  auth,
  requireRole("tenant"),
  asyncRoute(async (req, res) => {
    if (
      !isNonEmptyString(req.body.houseId) ||
      !isNonEmptyString(req.body.message)
    )
      return fail(res, "House and message are required.");
    const { data: house } = await supabase
      .from("houses")
      .select("id, estate_id, house_number")
      .eq("id", req.body.houseId)
      .eq("estate_id", req.params.estateId)
      .single();
    if (!house) return res.status(404).json({ message: "House not found." });
    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        estate_id: req.params.estateId,
        house_id: house.id,
        tenant_id: req.user.id,
        tenant_name: req.user.profile.name,
        unit: house.house_number,
        message: req.body.message.trim(),
        status: "pending",
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(toInquiryDTO(data));
  }),
);
router.patch(
  "/inquiries/:id/reply",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!isNonEmptyString(req.body.reply))
      return fail(res, "Reply is required.");
    const { data: inquiry } = await supabase
      .from("inquiries")
      .select("estate_id")
      .eq("id", req.params.id)
      .single();
    if (!inquiry)
      return res.status(404).json({ message: "Inquiry not found." });
    if (!ownership(req, inquiry.estate_id))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("inquiries")
      .update({
        reply: req.body.reply.trim(),
        status: "resolved",
        replied_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.json(toInquiryDTO(data));
  }),
);
module.exports = router;
