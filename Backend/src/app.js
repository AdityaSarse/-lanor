const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRouter);

module.exports = app;