const supabase = require("../supabase");

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized." });
    const token = header.slice(7).trim();
    if (!token) return res.status(401).json({ message: "Unauthorized." });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user)
      return res.status(401).json({ message: "Invalid or expired token." });
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileError || !profile)
      return res.status(401).json({ message: "Profile not found." });
    req.user = { ...user, profile, token };
    next();
  } catch (error) {
    next(error);
  }
};
