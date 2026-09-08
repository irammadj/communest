const ownership = (req, estateId) =>
  req.user.profile.role === "communest_admin" ||
  req.user.profile.estate_id === estateId;
const dbError = (res, error) =>
  res.status(500).json({ message: error?.message || "Server error." });
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = { ownership, dbError, asyncRoute };
