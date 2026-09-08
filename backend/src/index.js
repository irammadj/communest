require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS."));
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/estates", require("./routes/estates"));
app.use("/api", require("./routes/houses"));
app.use("/api", require("./routes/proposals"));
app.use("/api", require("./routes/notifications"));
app.use("/api", require("./routes/maintenance"));
app.use("/api", require("./routes/paymentOptions"));
app.use("/api", require("./routes/inquiries"));
app.use("/api/admin", require("./routes/admin"));

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.parse.failed")
    return res
      .status(400)
      .json({ message: "Request body must be valid JSON." });
  console.error(error);
  res.status(500).json({ message: "Server error." });
});

if (require.main === module)
  app.listen(port, () => console.log(`Communest API running on port ${port}`));
module.exports = app;
