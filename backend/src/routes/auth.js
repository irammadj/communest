const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const { toUserDTO } = require("../mappers");
const {
  textLength,
  validEmail,
  validPhone,
  validPassword,
  fail,
} = require("../validation");
const { asyncRoute } = require("../helpers");
const router = express.Router();

router.post(
  "/register",
  asyncRoute(async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!textLength(name, 4, 20))
      return fail(res, "Name must be between 4 and 20 characters.");
    if (!validEmail(email))
      return fail(res, "Use a valid Gmail or email.com address.");
    if (!validPhone(phone))
      return fail(
        res,
        "Phone must start with +254 and contain 9 digits after the prefix.",
      );
    if (!validPassword(password))
      return fail(
        res,
        "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol.",
      );
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    });
    if (error)
      return res
        .status(/already|exist|duplicate/i.test(error.message) ? 409 : 400)
        .json({
          message: /already|exist|duplicate/i.test(error.message)
            ? "An account with this email already exists."
            : error.message,
        });
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: created.user.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: "regular_user",
        email_verified: false,
        phone_verified: false,
      });
    if (profileError) {
      await supabase.auth.admin.deleteUser(created.user.id);
      return res
        .status(/duplicate|unique/i.test(profileError.message) ? 409 : 500)
        .json({
          message: /duplicate|unique/i.test(profileError.message)
            ? "An account with this email already exists."
            : profileError.message,
        });
    }
    res.status(201).json({ message: "Account created successfully." });
  }),
);

router.post(
  "/login",
  asyncRoute(async (req, res) => {
    const { email, password } = req.body;
    if (!validEmail(email) || typeof password !== "string")
      return res.status(401).json({ message: "Invalid email or password." });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.user || !data.session)
      return res.status(401).json({ message: "Invalid email or password." });
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    if (profileError || !profile)
      return res.status(401).json({ message: "Profile not found." });
    res.json({ token: data.session.access_token, user: toUserDTO(profile) });
  }),
);

router.post(
  "/logout",
  auth,
  asyncRoute(async (req, res) => {
    await supabase.auth.admin.signOut(req.user.token);
    res.json({ message: "Logged out successfully." });
  }),
);

module.exports = router;
