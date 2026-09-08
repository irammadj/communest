const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toNotifDTO } = require("../mappers");
const { isNonEmptyString, fail } = require("../validation");
const { ownership, asyncRoute } = require("../helpers");
const router = express.Router();
router.get(
  "/estates/:estateId/notifications",
  auth,
  requireRole("estate_admin", "tenant"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("estate_id", req.params.estateId)
      .order("event_date", { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    res.json((data || []).map(toNotifDTO));
  }),
);
router.post(
  "/estates/:estateId/notifications",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    if (
      !isNonEmptyString(req.body.title) ||
      !isNonEmptyString(req.body.eventDate) ||
      !isNonEmptyString(req.body.description)
    )
      return fail(res, "Title, event date, and description are required.");
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        estate_id: req.params.estateId,
        title: req.body.title.trim(),
        event_date: req.body.eventDate,
        description: req.body.description.trim(),
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(toNotifDTO(data));
  }),
);
router.delete(
  "/notifications/:id",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    const { data: notification } = await supabase
      .from("notifications")
      .select("estate_id")
      .eq("id", req.params.id)
      .single();
    if (!notification)
      return res.status(404).json({ message: "Notification not found." });
    if (!ownership(req, notification.estate_id))
      return res.status(403).json({ message: "Forbidden." });
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", req.params.id);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: "Notification deleted." });
  }),
);
module.exports = router;
