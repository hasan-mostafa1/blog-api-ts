const { prisma } = require("../lib/prisma");
const auth = require("../middlewares/authMiddleware");
const {
  commentResource,
  commentResourceArray,
} = require("../resources/commentResource");
const commentValidator = require("../validators/commentValidator");
const postValidator = require("../validators/postValidator");
const { matchedData } = require("express-validator");

module.exports.index = [
  commentValidator.validateQueryString,
  postValidator.publishedPostExists,
  async (req, res) => {
    // Filtering
    const { content, sort, page, limit } = matchedData(req);
    const whereClause = { postId: req.post.id };

    if (content) {
      whereClause.content = {
        contains: content,
        mode: "insensitive",
      };
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
      // req.query.page = 1;
    }
    // Pagination
    const currentPage = page || 1;
    const recordsLimit = limit || 10;
    const skip = (currentPage - 1) * recordsLimit;
    const totalItems = await prisma.comment.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / recordsLimit);
    // Getting the data
    const comments = await prisma.comment.findMany({
      skip: skip,
      take: recordsLimit,
      where: whereClause,
      orderBy: sortList,
      include: {
        author: true,
        parent: true,
      },
    });

    res.status(200).json({
      success: true,
      data: commentResourceArray(comments),
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
  postValidator.publishedPostExists,
  commentValidator.validateComment,
  async (req, res) => {
    const { content } = matchedData(req);
    const comment = await prisma.comment.create({
      data: {
        content: content,
        post: {
          connect: { id: req.post.id },
        },
        author: {
          connect: { id: req.user.id },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: commentResource(comment),
    });
  },
];

module.exports.update = [
  auth,
  postValidator.publishedPostExists,
  commentValidator.commentExists,
  commentValidator.validateComment,
  async (req, res) => {
    if (req.user.id !== req.comment.authorId) {
      return res.status(403).json({ msg: "Unauthorized action!" });
    }
    const { content } = matchedData(req);
    const comment = await prisma.comment.update({
      where: { id: req.comment.id },
      data: {
        content: content,
      },
    });

    res.status(200).json({
      success: true,
      data: commentResource(comment),
    });
  },
];

module.exports.destroy = [
  auth,
  postValidator.publishedPostExists,
  commentValidator.commentExists,
  async (req, res) => {
    if (req.user.id !== req.comment.authorId) {
      return res.status(403).json({ msg: "Unauthorized action!" });
    }
    await prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({
        where: { parentId: req.comment.id },
      });

      await tx.comment.delete({
        where: { id: req.comment.id },
      });
    });
    res.sendStatus(204);
  },
];

module.exports.increaseLikes = [
  postValidator.publishedPostExists,
  commentValidator.commentExists,
  async (req, res) => {
    await prisma.comment.update({
      where: { id: req.comment.id },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
    res.sendStatus(200);
  },
];

module.exports.decreaseLikes = [
  postValidator.publishedPostExists,
  commentValidator.commentExists,
  async (req, res) => {
    if (req.comment.likes > 0) {
      await prisma.comment.update({
        where: { id: req.comment.id },
        data: {
          likes: {
            decrement: 1,
          },
        },
      });
    }
    res.sendStatus(200);
  },
];

module.exports.getReplies = [
  commentValidator.validateQueryString,
  postValidator.publishedPostExists,
  commentValidator.commentExists,
  async (req, res) => {
    // Filtering
    const { content, sort, page, limit } = matchedData(req);
    const whereClause = { postId: req.post.id, parentId: req.comment.id };

    if (content) {
      whereClause.content = {
        contains: content,
        mode: "insensitive",
      };
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
      // req.query.page = 1;
    }
    // Pagination
    const currentPage = page || 1;
    const recordsLimit = limit || 10;
    const skip = (currentPage - 1) * recordsLimit;
    const totalItems = await prisma.comment.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / recordsLimit);
    // Getting the data
    const comments = await prisma.comment.findMany({
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
      data: commentResourceArray(comments),
      meta: {
        currentPage: currentPage,
        totalPages: totalPages,
        itemsPerPage: recordsLimit,
        totalItems: totalItems,
      },
    });
  },
];

module.exports.addReply = [
  auth,
  postValidator.publishedPostExists,
  commentValidator.commentExists,
  commentValidator.validateComment,
  async (req, res) => {
    const { content } = matchedData(req);
    const comment = await prisma.comment.create({
      data: {
        content: content,
        post: {
          connect: { id: req.post.id },
        },
        author: {
          connect: { id: req.user.id },
        },
        parent: {
          connect: { id: req.comment.id },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: commentResource(comment),
    });
  },
];
