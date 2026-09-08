const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toEstateDTO } = require("../mappers");
const { validEmail, fail } = require("../validation");
const { asyncRoute } = require("../helpers");
const router = express.Router();
router.use(auth, requireRole("communest_admin"));
router.post(
  "/add-admin",
  asyncRoute(async (req, res) => {
    if (!validEmail(req.body.email))
      return fail(res, "A valid email is required.");
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("email", req.body.email.trim())
      .single();
    if (!profile) return res.status(404).json({ message: "User not found." });
    if (profile.role !== "regular_user")
      return fail(res, "Only regular users can become Communest Admins.");
    const { error } = await supabase
      .from("profiles")
      .update({ role: "communest_admin" })
      .eq("email", req.body.email.trim());
    if (error) return res.status(500).json({ message: error.message });
    res.json({
      message: `Communest Admin access granted to ${req.body.email.trim()}.`,
    });
  }),
);
router.get(
  "/estates",
  asyncRoute(async (req, res) => {
    const { data, error } = await supabase
      .from("estates")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    res.json((data || []).map(toEstateDTO));
  }),
);
module.exports = router;
