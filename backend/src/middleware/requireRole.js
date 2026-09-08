module.exports =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.profile.role))
      return res.status(403).json({ message: "Forbidden." });
    next();
  };
