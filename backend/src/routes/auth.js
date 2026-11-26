const express = require("express");
const supabase = require("../supabase");
const supabaseAuth = require("../supabaseAuth");
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
const { resolveImage } = require("../storage");
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
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        phone: phone.trim(),
      },
    });
    if (error)
      return res
        .status(/already|exist|duplicate/i.test(error.message) ? 409 : 400)
        .json({
          message: /already|exist|duplicate/i.test(error.message)
            ? "An account with this email already exists."
            : error.message,
        });
    if (!data.user)
      return res.status(500).json({ message: "Account creation failed." });

    const profile = {
      id: data.user.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: "regular_user",
    };
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profile, { onConflict: "id" });
    if (profileError) {
      const { error: cleanupError } = await supabase.auth.admin.deleteUser(
        data.user.id,
      );
      if (cleanupError)
        console.error(
          "Unable to remove an auth user after profile creation failed:",
          cleanupError,
        );
      return res.status(500).json({
        message: cleanupError
          ? "The account was created, but its profile could not be saved. Contact support."
          : "Unable to save the account profile. Please try registering again.",
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
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.user || !data.session)
      return res.status(401).json({ message: "Invalid email or password." });
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileError)
      return res.status(500).json({ message: profileError.message });

    let profile = existingProfile;
    if (!profile) {
      const metadata = data.user.user_metadata || {};
      if (
        !textLength(metadata.name, 4, 20) ||
        !validPhone(metadata.phone) ||
        !data.user.email
      )
        return res.status(401).json({
          message: "Profile not found. Contact support to restore your account.",
        });

      const { data: restoredProfile, error: restoreError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: data.user.id,
            name: metadata.name.trim(),
            email: data.user.email,
            phone: metadata.phone.trim(),
            role: "regular_user",
          },
          { onConflict: "id" },
        )
        .select("*")
        .single();
      if (restoreError || !restoredProfile)
        return res.status(500).json({
          message: restoreError?.message || "Unable to restore the account profile.",
        });
      profile = restoredProfile;
    }

    const user = toUserDTO(profile);
    user.profilePicture = await resolveImage(
      "profiles",
      profile.profile_picture,
    );
    res.json({ token: data.session.access_token, user });
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
