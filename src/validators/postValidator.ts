const {
  body,
  validationResult,
  query,
  check,
  param,
} = require("express-validator");
const fs = require("node:fs/promises");
const { prisma } = require("../lib/prisma");

const validatePost = [
  body("title")
    .exists()
    .withMessage("title is required")
    .isString()
    .withMessage("title must be a string")
    .trim()
    .notEmpty()
    .withMessage("title can't be empty")
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters long"),
  body("content")
    .exists()
    .withMessage("content is required")
    .isString()
    .withMessage("content must be a string")
    .trim()
    .notEmpty()
    .withMessage("content can't be empty")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long"),
  check("bannerImage").custom((value, { req }) => {
    if (req.file) {
      // Validate MIME type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error(
          "Invalid banner image type. Only JPEG, PNG and GIF are allowed.",
        );
      }
      // Validate file size (e.g., max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2 MB
      if (req.file.size > maxSize) {
        throw new Error("Banner image size is too large (max 2MB)");
      }
    }
    return true;
  }),
  body("published")
    .exists()
    .withMessage("published is required")
    .isBoolean()
    .withMessage("published must be a boolean")
    .toBoolean(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateQueryString = [
  query("sq")
    .optional()
    .isString()
    .withMessage("Search query must be a string"),
  query("authorId")
    .optional()
    .isInt({ min: 0 })
    .withMessage("AuthorId must be an integer greater than 0")
    .toInt(),
  query("sort")
    .optional()
    .isString()
    .withMessage("sort must be a string")
    .custom((value) => {
      const allowedSortFields = ["likes", "createdAt", "updatedAt"];
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

const postExists = [
  param("postId")
    .exists()
    .withMessage("post id is required")
    .isInt()
    .withMessage("post id must be an integer")
    .toInt()
    .custom(async (value, { req }) => {
      const post = await prisma.post.findUnique({
        where: { id: value },
        include: {
          author: true,
        },
      });
      if (!post) {
        throw new Error("Post not found!");
      }
      req.post = post;
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

const publishedPostExists = [
  param("postId")
    .exists()
    .withMessage("post id is required")
    .isInt()
    .withMessage("post id must be an integer")
    .toInt()
    .custom(async (value, { req }) => {
      const post = await prisma.post.findUnique({
        where: { id: value, published: true },
        include: {
          author: true,
        },
      });
      if (!post) {
        throw new Error("Post not found!");
      }
      req.post = post;
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
  validatePost,
  validateQueryString,
  postExists,
  publishedPostExists,
};
