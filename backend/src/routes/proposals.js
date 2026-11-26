const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toProposalDTO } = require("../mappers");
const { isNonEmptyString, fail } = require("../validation");
const { ownership, asyncRoute } = require("../helpers");
const router = express.Router();
router.post(
  "/proposals",
  auth,
  requireRole("regular_user"),
  asyncRoute(async (req, res) => {
    const { estateId, houseId } = req.body;
    if (!isNonEmptyString(estateId) || !isNonEmptyString(houseId))
      return fail(
        res,
        "Estate and house are required.",
      );
    const { data: house, error: houseError } = await supabase
      .from("houses")
      .select("id, estate_id, status")
      .eq("id", houseId)
      .eq("estate_id", estateId)
      .single();
    if (houseError || !house)
      return res.status(404).json({ message: "House not found." });
    if (house.status !== "vacant")
      return res.status(409).json({ message: "This house is not available." });
    const { data: existing, error: existingError } = await supabase
      .from("proposals")
      .select("id")
      .eq("house_id", houseId)
      .eq("email", req.user.profile.email)
      .eq("status", "pending")
      .maybeSingle();
    if (existingError)
      return res.status(500).json({ message: existingError.message });
    if (existing)
      return res
        .status(409)
        .json({ message: "You already applied for this house." });
    const { data, error } = await supabase
      .from("proposals")
      .insert({
        estate_id: estateId,
        house_id: houseId,
        name: req.user.profile.name,
        email: req.user.profile.email,
        phone: req.user.profile.phone,
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
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (proposalError || !proposal)
      return res.status(404).json({ message: "Proposal not found." });
    if (!ownership(req, proposal.estate_id))
      return res.status(403).json({ message: "Forbidden." });
    if (proposal.status !== "pending")
      return res
        .status(409)
        .json({ message: "Only pending applications can be reviewed." });

    if (req.body.status === "approved") {
      const { data: house, error: houseError } = await supabase
        .from("houses")
        .select("id, status")
        .eq("id", proposal.house_id)
        .eq("estate_id", proposal.estate_id)
        .maybeSingle();
      if (houseError) return res.status(500).json({ message: houseError.message });
      if (!house || house.status !== "vacant")
        return res.status(409).json({ message: "This house is no longer available." });

      const { data: applicant, error: applicantError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("email", proposal.email)
        .maybeSingle();
      if (applicantError)
        return res.status(500).json({ message: applicantError.message });
      if (!applicant || applicant.role !== "regular_user")
        return res.status(409).json({
          message: "The applicant must have an active regular user account.",
        });

      const { data: occupiedHouse, error: houseUpdateError } = await supabase
        .from("houses")
        .update({
          status: "occupied",
          occupied_at: new Date().toISOString(),
          tenant_name: proposal.name,
          payment_status: "pending",
        })
        .eq("id", proposal.house_id)
        .eq("status", "vacant")
        .select("id")
        .maybeSingle();
      if (houseUpdateError)
        return res.status(500).json({ message: houseUpdateError.message });
      if (!occupiedHouse)
        return res
          .status(409)
          .json({ message: "This house is no longer available." });

      const { data: updatedApplicant, error: profileError } = await supabase
        .from("profiles")
        .update({ role: "tenant", estate_id: proposal.estate_id })
        .eq("id", applicant.id)
        .eq("role", "regular_user")
        .select("id")
        .maybeSingle();
      if (profileError)
        return res.status(500).json({ message: profileError.message });
      if (!updatedApplicant) {
        const { error: rollbackError } = await supabase
          .from("houses")
          .update({
            status: "vacant",
            occupied_at: null,
            tenant_name: null,
            payment_status: null,
          })
          .eq("id", proposal.house_id)
          .eq("status", "occupied");
        if (rollbackError)
          return res.status(500).json({ message: rollbackError.message });
        return res.status(409).json({
          message: "The applicant is no longer eligible for this house.",
        });
      }
    }

    const { data, error } = await supabase
      .from("proposals")
      .update({ status: req.body.status })
      .eq("id", req.params.id)
      .eq("status", "pending")
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.json(toProposalDTO(data));
  }),
);
module.exports = router;
