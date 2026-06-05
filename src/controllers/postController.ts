const { matchedData } = require("express-validator");
const { prisma } = require("../lib/prisma");
const {
  postResource,
  postResourceArray,
} = require("../resources/postResource");
const postValidator = require("../validators/postValidator");
const upload = require("../config/multer");
const auth = require("../middlewares/authMiddleware");
const isPostAuthor = require("../middlewares/isPostAuthorMiddleware");
const fs = require("node:fs/promises");
const path = require("node:path");

module.exports.index = [
  postValidator.validateQueryString,
  async (req, res) => {
    // Filtering
    const { sq, authorId, sort, page, limit } = matchedData(req);
    const whereClause = { published: true };

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
      req.query.page = 1;
    }
    // Pagination
    const currentPage = page || 1;
    const recordsLimit = limit || 10;
    const skip = (currentPage - 1) * recordsLimit;
    const totalItems = await prisma.post.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / recordsLimit);
    // Getting the data
    const posts = await prisma.post.findMany({
      skip: skip,
      take: recordsLimit,
      where: whereClause,
      orderBy: sortList,
      include: {
        author: true,
      },
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

module.exports.myPosts = [
  auth,
  postValidator.validateQueryString,
  async (req, res) => {
    // Filtering
    const { sq, sort, page, limit } = matchedData(req);
    const whereClause = { authorId: req.user.id };

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
      req.query.page = 1;
    }
    // Pagination
    const currentPage = page || 1;
    const recordsLimit = limit || 10;
    const skip = (currentPage - 1) * recordsLimit;
    const totalItems = await prisma.post.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / recordsLimit);
    // Getting the data
    const posts = await prisma.post.findMany({
      skip: skip,
      take: recordsLimit,
      where: whereClause,
      orderBy: sortList,
      include: {
        author: true,
      },
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
  postValidator.publishedPostExists,
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
  postValidator.postExists,
  isPostAuthor,
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
  postValidator.postExists,
  isPostAuthor,
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

module.exports.increaseLikes = [
  postValidator.publishedPostExists,
  async (req, res) => {
    const post = await prisma.post.update({
      where: { id: req.post.id },
      data: {
        likes: {
          increment: 1,
        },
      },
      include: {
        author: true,
      },
    });
    res.status(200).json({
      success: true,
      data: postResource(post),
    });
  },
];

module.exports.decreaseLikes = [
  postValidator.publishedPostExists,
  async (req, res) => {
    let post;
    if (req.post.likes > 0) {
      post = await prisma.post.update({
        where: { id: req.post.id },
        data: {
          likes: {
            decrement: 1,
          },
        },
        include: {
          author: true,
        },
      });
    }
    res.status(200).json({
      success: true,
      data: postResource(post),
    });
  },
];
