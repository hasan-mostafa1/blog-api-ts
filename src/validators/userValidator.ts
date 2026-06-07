import { body, validationResult, check, query, param } from "express-validator";
import { prisma } from "../lib/prisma.js";
import type { Request, Response, NextFunction, Handler } from "express";
import fs from "node:fs/promises";

const validateResult: Handler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateSignup = [
  body("firstName")
    .exists()
    .withMessage("first name is required")
    .trim()
    .notEmpty()
    .withMessage("first name can't be empty")
    .isString()
    .withMessage("first name must be a string"),
  body("lastName")
    .exists()
    .withMessage("last name is required")
    .trim()
    .notEmpty()
    .withMessage("last name can't be empty")
    .isString()
    .withMessage("last name must be a string"),
  body("email")
    .exists()
    .withMessage("email is required")
    .trim()
    .notEmpty()
    .withMessage("email can't be empty")
    .isEmail()
    .withMessage("email is not a valid email address")
    .custom(async (value) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: value },
      });
      if (existingUser) {
        throw new Error("A user already exists with this email address!");
      }
      return true;
    }),
  body("password")
    .exists()
    .withMessage("password is required")
    .trim()
    .notEmpty()
    .withMessage("password can't be empty")
    .isLength({ min: 8 })
    .withMessage("password must contain at least 8 characters"),
  body("passwordConfirmation")
    .exists()
    .withMessage("password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation must match the password field!");
      }
      return true;
    }),
  validateResult,
];

export const validateLogin = [
  body("email")
    .exists()
    .withMessage("email is required")
    .trim()
    .notEmpty()
    .withMessage("email can't be empty")
    .isEmail()
    .withMessage("email is not a valid email address"),
  body("password")
    .exists()
    .withMessage("password is required")
    .trim()
    .notEmpty()
    .withMessage("password can't be empty"),
  validateResult,
];

export const validateProfileImage = [
  check("profileImage").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("File is required");
    }
    // Validate MIME type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new Error("Invalid file type. Only JPEG, PNG and GIF are allowed.");
    }
    // Validate file size (e.g., max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (req.file.size > maxSize) {
      throw new Error("File is too large (max 2MB)");
    }
    return true;
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  },
];

export const validateQueryString = [
  query("sq")
    .optional()
    .isString()
    .withMessage("Search query must be a string"),
  query("role")
    .optional()
    .isIn(["ADMIN", "USER"])
    .withMessage("Role must be ADMIN OR USER"),
  query("sort")
    .optional()
    .isString()
    .withMessage("sort must be a string")
    .custom((value) => {
      const allowedSortFields = ["firstName", "lastName"];
      value.split(",").forEach((item: string) => {
        if (item.at(0) !== "-" && item.at(0) !== "+") {
          throw new Error(
            "Invalid sort order direction! use '+' and '-' signs before columns names to indicate 'asc' and 'desc' directions.",
          );
        }
        if (!allowedSortFields.includes(item.slice(1))) {
          throw new Error(
            `Invalid sort field! Allowed fields are : ${allowedSortFields.join(",")}`,
          );
        }
      });
      return true;
    }),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be an integer greater than or equal to 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100"),
  validateResult,
];

export const userExists = [
  param("userId")
    .exists()
    .withMessage("user id is required")
    .isInt()
    .withMessage("user id must be an integer")
    .toInt()
    .custom(async (value, { req }) => {
      const user = await prisma.user.findUnique({
        where: { id: value },
      });
      if (!user) {
        throw new Error("user not found!");
      }
      req.selectedUser = user;
      return true;
    }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }
    next();
  },
];
