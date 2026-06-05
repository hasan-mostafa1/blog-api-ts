const { body, validationResult, query, param } = require("express-validator");
const fs = require("node:fs/promises");
const { prisma } = require("../lib/prisma");

const validateComment = [
  body("content")
    .exists()
    .withMessage("content is required")
    .isString()
    .withMessage("content must be a string")
    .trim()
    .notEmpty()
    .withMessage("content can't be empty"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateQueryString = [
  query("sort")
    .optional()
    .isString()
    .withMessage("sort must be a string")
    .custom((value) => {
      const allowedSortFields = ["likes", "createdAt"];
      value.split(",").forEach((item) => {
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
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const commentExists = [
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
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateComment,
  validateQueryString,
  commentExists,
};
