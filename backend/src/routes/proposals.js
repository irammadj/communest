const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toProposalDTO } = require("../mappers");
const {
  textLength,
  validEmail,
  validPhone,
  isNonEmptyString,
  fail,
} = require("../validation");
const { ownership, asyncRoute } = require("../helpers");
const router = express.Router();
router.post(
  "/",
  asyncRoute(async (req, res) => {
    const { estateId, houseId, name, email, phone } = req.body;
    if (
      !isNonEmptyString(estateId) ||
      !isNonEmptyString(houseId) ||
      !textLength(name, 1, 100) ||
      !validEmail(email) ||
      !validPhone(phone)
    )
      return fail(
        res,
        "Estate, house, applicant name, email, and phone must be valid.",
      );
    const { data: house } = await supabase
      .from("houses")
      .select("id, estate_id, status")
      .eq("id", houseId)
      .eq("estate_id", estateId)
      .single();
    if (!house || house.status !== "vacant")
      return fail(res, "This house is not available.");
    const { data, error } = await supabase
      .from("proposals")
      .insert({
        estate_id: estateId,
        house_id: houseId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status: "pending",
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res
      .status(201)
      .json({ message: "Application submitted.", proposalId: data.id });
  }),
);
router.get(
  "/estates/:estateId/proposals",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("estate_id", req.params.estateId)
      .order("submitted_at", { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    res.json((data || []).map(toProposalDTO));
  }),
);
router.patch(
  "/proposals/:id/status",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!["approved", "rejected"].includes(req.body.status))
      return fail(res, "Status must be approved or rejected.");
    const { data: proposal } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (!proposal)
      return res.status(404).json({ message: "Proposal not found." });
    if (!ownership(req, proposal.estate_id))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("proposals")
      .update({ status: req.body.status })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    if (req.body.status === "approved") {
      const { error: houseError } = await supabase
        .from("houses")
        .update({
          status: "occupied",
          occupied_at: new Date().toISOString(),
          tenant_name: proposal.name,
          payment_status: "pending",
        })
        .eq("id", proposal.house_id);
      if (houseError)
        return res.status(500).json({ message: houseError.message });

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "tenant", estate_id: proposal.estate_id })
        .eq("email", proposal.email);
      if (profileError)
        return res.status(500).json({ message: profileError.message });
    }
    res.json(toProposalDTO(data));
  }),
);
module.exports = router;
