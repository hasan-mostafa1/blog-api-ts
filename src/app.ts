import express from "express";
import cors from "cors";
import path from "node:path";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import webRouter from "./routes/web.js";
import apiRouter from "./routes/api.js";
import adminRouter from "./routes/admin.js";

/**
 * -------------- GENERAL SETUP ----------------
 */

const app = express();

const assetsPath = path.join(process.cwd(), "public");
app.use(express.static(assetsPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// Passport JWT strategy
import "./config/passportJwt.js";

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
const viewsPath = path.join(process.cwd(), "src/views");
app.set("views", viewsPath);
app.set("view engine", "ejs");
