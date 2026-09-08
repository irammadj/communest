const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toMaintenanceDTO } = require("../mappers");
const { isNonEmptyString, fail } = require("../validation");
const { ownership, asyncRoute } = require("../helpers");
const router = express.Router();
router.get(
  "/estates/:estateId/maintenance",
  auth,
  requireRole("estate_admin", "tenant"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("maintenance_issues")
      .select("*")
      .eq("estate_id", req.params.estateId)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    res.json((data || []).map(toMaintenanceDTO));
  }),
);
router.post(
  "/estates/:estateId/maintenance",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    if (
      !isNonEmptyString(req.body.title) ||
      !isNonEmptyString(req.body.description)
    )
      return fail(res, "Title and description are required.");
    const { data, error } = await supabase
      .from("maintenance_issues")
      .insert({
        estate_id: req.params.estateId,
        title: req.body.title.trim(),
        description: req.body.description.trim(),
        status: "scheduled",
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(toMaintenanceDTO(data));
  }),
);
router.patch(
  "/maintenance/:id/status",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!["scheduled", "in_progress", "resolved"].includes(req.body.status))
      return fail(res, "Invalid maintenance status.");
    const { data: issue } = await supabase
      .from("maintenance_issues")
      .select("estate_id")
      .eq("id", req.params.id)
      .single();
    if (!issue) return res.status(404).json({ message: "Issue not found." });
    if (!ownership(req, issue.estate_id))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("maintenance_issues")
      .update({ status: req.body.status })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.json(toMaintenanceDTO(data));
  }),
);
router.delete(
  "/maintenance/:id",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    const { data: issue } = await supabase
      .from("maintenance_issues")
      .select("estate_id")
      .eq("id", req.params.id)
      .single();
    if (!issue) return res.status(404).json({ message: "Issue not found." });
    if (!ownership(req, issue.estate_id))
      return res.status(403).json({ message: "Forbidden." });
    const { error } = await supabase
      .from("maintenance_issues")
      .delete()
      .eq("id", req.params.id);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: "Issue deleted." });
  }),
);
module.exports = router;
