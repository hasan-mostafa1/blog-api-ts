import { body, validationResult, query, param } from "express-validator";
import { prisma } from "../lib/prisma.js";
import type { Request, Response, NextFunction, Handler } from "express";

const validateResult: Handler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateComment = [
  body("content")
    .exists()
    .withMessage("content is required")
    .isString()
    .withMessage("content must be a string")
    .trim()
    .notEmpty()
    .withMessage("content can't be empty"),
  validateResult,
];

export const validateQueryString = [
  query("sort")
    .optional()
    .isString()
    .withMessage("sort must be a string")
    .custom((value) => {
      const allowedSortFields = ["likes", "createdAt"];
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
    .withMessage("Page must be an integer greater than or equal to 1")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100")
    .toInt(),
  ,
  validateResult,
];

export const commentExists = [
  param("commentId")
    .exists()
    .withMessage("comment id is required")
    .isInt()
    .withMessage("comment id must be an integer")
    .toInt()
    .custom(async (value, { req }) => {
      const comment = await prisma.comment.findUnique({
        where: { id: value, postId: req.post.id },
        include: {
          author: true,
        },
      });
      if (!comment) {
        throw new Error("comment not found!");
      }
      req.comment = comment;
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
