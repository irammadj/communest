const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { toUserDTO } = require("../mappers");
const { textLength, validPhone, fail } = require("../validation");
const { asyncRoute } = require("../helpers");
const router = express.Router();
router.use(auth);

router.get("/", (req, res) => res.json(toUserDTO(req.user.profile)));
router.patch(
  "/",
  asyncRoute(async (req, res) => {
    const updates = {};
    if (req.body.name !== undefined) {
      if (!textLength(req.body.name, 4, 20))
        return fail(res, "Name must be between 4 and 20 characters.");
      updates.name = req.body.name.trim();
    }
    if (req.body.phone !== undefined) {
      if (!validPhone(req.body.phone))
        return fail(
          res,
          "Phone must start with +254 and contain 9 digits after the prefix.",
        );
      updates.phone = req.body.phone.trim();
    }
    if (req.body.profilePicture !== undefined) {
      if (typeof req.body.profilePicture !== "string")
        return fail(res, "Profile picture must be a URL string.");
      updates.profile_picture = req.body.profilePicture;
    }
    if (!Object.keys(updates).length)
      return fail(res, "At least one profile field is required.");
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", req.user.id)
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    res.json(toUserDTO(data));
  }),
);
router.delete(
  "/",
  requireRole("regular_user", "tenant"),
  asyncRoute(async (req, res) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", req.user.id);
    if (error) return res.status(500).json({ message: error.message });
    const result = await supabase.auth.admin.deleteUser(req.user.id);
    if (result.error)
      return res.status(500).json({ message: result.error.message });
    res.json({ message: "Account deleted." });
  }),
);
module.exports = router;
