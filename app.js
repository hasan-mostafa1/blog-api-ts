require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("node:path");
const errorMiddleware = require("./middlewares/errorMiddleware");
const webRouter = require("./routes/web");
const apiRouter = require("./routes/api");
const adminRouter = require("./routes/admin");

/**
 * -------------- GENERAL SETUP ----------------
 */

const app = express();

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// Passport JWT strategy
require("./config/passportJwt");

/**
 * -------------- ROUTES ----------------
 */

app.use("/api/admin", adminRouter);
app.use("/api", apiRouter);
app.use(webRouter);

/**
 * -------------- ERROR HANDLER ---------------
 */

app.use(errorMiddleware);

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Express app listening on port ${PORT}`);
});

/**
 * -------------- SETTINGS ----------------
 */
const viewsPath = path.join(__dirname, "views");
app.set("views", viewsPath);
app.set("view engine", "ejs");
