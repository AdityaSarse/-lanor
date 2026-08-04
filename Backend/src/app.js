const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRouter     = require("./routes/auth.routes");
const productRouter  = require("./routes/product.routes");
const categoryRouter = require("./routes/category.routes");
const brandRouter    = require("./routes/brand.routes");
const reviewRouter   = require("./routes/review.routes");
const wishlistRouter = require("./routes/wishlist.routes");
const cartRouter     = require("./routes/cart.routes");
const addressRouter  = require("./routes/address.routes");
const couponRouter   = require("./routes/coupon.routes");
const orderRouter        = require("./routes/order.routes");
const paymentRouter      = require("./routes/payment.routes");
const notificationRouter = require("./routes/notification.routes");
const uploadRouter       = require("./routes/upload.routes");
const errorHandler       = require("./middelwares/error.middleware");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Must be FIRST — before body parsers and routes.
// credentials:true is required so the browser sends cookies (refreshToken).
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",          authRouter);
app.use("/api/v1/products",      productRouter);
app.use("/api/v1/categories",    categoryRouter);
app.use("/api/v1/brands",        brandRouter);
app.use("/api/v1/reviews",       reviewRouter);
app.use("/api/v1/wishlist",      wishlistRouter);
app.use("/api/v1/cart",          cartRouter);
app.use("/api/v1/address",       addressRouter);
app.use("/api/v1/coupons",       couponRouter);
app.use("/api/v1/orders",        orderRouter);
app.use("/api/v1/payments",      paymentRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/upload",        uploadRouter);

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must be registered AFTER all routes — Express uses the 4-arg signature to
// identify this as an error-handling middleware.
app.use(errorHandler);

module.exports = app;