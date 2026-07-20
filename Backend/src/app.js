const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter     = require("./routes/auth.routes");
const productRouter  = require("./routes/product.routes");
const categoryRouter = require("./routes/category.routes");
const brandRouter    = require("./routes/brand.routes");
const errorHandler   = require("./middelwares/error.middleware");

const app = express();

app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",       authRouter);
app.use("/api/v1/products",   productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/brands",     brandRouter);

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must be registered AFTER all routes — Express uses the 4-arg signature to
// identify this as an error-handling middleware.
app.use(errorHandler);

module.exports = app;