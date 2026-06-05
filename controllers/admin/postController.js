const upload = require("../../config/multer");
const { prisma } = require("../../lib/prisma");
const auth = require("../../middlewares/authMiddleware");
const isAdmin = require("../../middlewares/isAdminMiddleware");
const {
  postResource,
  postResourceArray,
} = require("../../resources/postResource");
const postValidator = require("../../validators/postValidator");
const fs = require("node:fs/promises");
const { matchedData } = require("express-validator");

module.exports.index = [
  auth,
  isAdmin,
  postValidator.validateQueryString,
  async (req, res) => {
    // Filtering
    const { sq, authorId, sort, page, limit } = matchedData(req);
    const whereClause = {};

    if (sq) {
      whereClause.OR = [
        {
          title: {
            contains: sq,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: sq,
            mode: "insensitive",
          },
        },
      ];
    }

    if (authorId) {
      whereClause.authorId = authorId;
    }

    // Sorting
    let sortList = [
      {
        id: "asc",
      },
    ];
    if (sort) {
      sortList = [];
      const sortQuery = sort;
      sortQuery.split(",").forEach((item) => {
        let order;
        if (item.at(0) === "-") {
          order = "desc";
        } else {
          order = "asc";
        }
        sortList.push({
          [item.slice(1)]: order,
        });
      });
      // req.query.page = 1; // Need to think about this one (reseting page when sorting the results)
    }
    // Pagination
    const currentPage = page || 1;
    const recordsLimit = limit || 10;
    const skip = (currentPage - 1) * recordsLimit;
    const totalItems = await prisma.post.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / recordsLimit);
    // Getting the data
    const posts = await prisma.post.findMany({
      include: {
        author: true,
      },
      skip: skip,
      take: recordsLimit,
      where: whereClause,
      orderBy: sortList,
    });

    res.status(200).json({
      success: true,
      data: postResourceArray(posts),
      meta: {
        currentPage: currentPage,
        totalPages: totalPages,
        itemsPerPage: recordsLimit,
        totalItems: totalItems,
      },
    });
  },
];

module.exports.store = [
  auth,
  isAdmin,
  upload.single("bannerImage"),
  postValidator.validatePost,
  async (req, res) => {
    const { title, content, published } = matchedData(req);
    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
        bannerImage: req.file?.filename,
        published: published,
        author: {
          connect: { id: req.user.id },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: postResource(post),
    });
  },
];

module.exports.show = [
  auth,
  isAdmin,
  postValidator.postExists,
  async (req, res) => {
    const post = req.post;
    res.status(200).json({
      success: true,
      data: postResource(post),
    });
  },
];

module.exports.update = [
  auth,
  isAdmin,
  postValidator.postExists,
  upload.single("bannerImage"),
  postValidator.validatePost,
  async (req, res) => {
    const { title, content, published } = matchedData(req);
    let bannerImageName = req.post.bannerImage;
    if (req.file) {
      bannerImageName = req.file.filename;
    } else if (req.body.bannerImage === null || req.body.bannerImage === "") {
      bannerImageName = null;
    }

    const post = await prisma.post.update({
      where: { id: req.post.id },
      data: {
        title: title,
        content: content,
        bannerImage: bannerImageName,
        published: published,
      },
    });

    if (
      req.post.bannerImage &&
      (req.file || req.body.bannerImage === null || req.body.bannerImage === "")
    ) {
      const bannerImagePath = path.join(
        __dirname,
        "../public/uploads/profiles",
        req.user.bannerImage,
      );
      await fs.unlink(bannerImagePath);
    }

    res.status(200).json({
      success: true,
      data: postResource(post),
    });
  },
];

module.exports.destroy = [
  auth,
  isAdmin,
  postValidator.postExists,
  async (req, res) => {
    const bannerImagePath = path.join(
      __dirname,
      "../public/uploads/profiles",
      req.post.bannerImage,
    );
    const { postId } = matchedData(req);
    await prisma.post.delete({
      where: { id: postId },
    });
    if (bannerImagePath) {
      await fs.unlink(bannerImagePath);
    }
    res.sendStatus(204);
  },
];
