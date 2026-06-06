import type { Handler } from "express";

const isAdmin: Handler = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ msg: "Forbidden" });
  }
};

export default isAdmin;
