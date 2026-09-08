const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toPaymentOptionDTO } = require("../mappers");
const { isNonEmptyString, fail } = require("../validation");
const { ownership, asyncRoute } = require("../helpers");
const router = express.Router();
router.get(
  "/estates/:estateId/payment-options",
  auth,
  requireRole("estate_admin", "tenant"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    const { data, error } = await supabase
      .from("payment_options")
      .select("*")
      .eq("estate_id", req.params.estateId);
    if (error) return res.status(500).json({ message: error.message });
    res.json((data || []).map(toPaymentOptionDTO));
  }),
);
router.post(
  "/estates/:estateId/payment-options",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    if (!ownership(req, req.params.estateId))
      return res.status(403).json({ message: "Forbidden." });
    if (!isNonEmptyString(req.body.name) || !isNonEmptyString(req.body.details))
      return fail(res, "Name and details are required.");
    const { data, error } = await supabase
      .from("payment_options")
      .insert({
        estate_id: req.params.estateId,
        name: req.body.name.trim(),
        details: req.body.details.trim(),
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(toPaymentOptionDTO(data));
  }),
);
router.delete(
  "/payment-options/:id",
  auth,
  requireRole("estate_admin"),
  asyncRoute(async (req, res) => {
    const { data: option } = await supabase
      .from("payment_options")
      .select("estate_id")
      .eq("id", req.params.id)
      .single();
    if (!option)
      return res.status(404).json({ message: "Payment option not found." });
    if (!ownership(req, option.estate_id))
      return res.status(403).json({ message: "Forbidden." });
    const { error } = await supabase
      .from("payment_options")
      .delete()
      .eq("id", req.params.id);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: "Payment option deleted." });
  }),
);
module.exports = router;
