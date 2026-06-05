const { matchedData } = require("express-validator");
const { prisma } = require("../../lib/prisma");
const auth = require("../../middlewares/authMiddleware");
const isAdmin = require("../../middlewares/isAdminMiddleware");
const {
  userResource,
  userResourceArray,
} = require("../../resources/userResource");
const userValidator = require("../../validators/userValidator");
const fs = require("node:fs/promises");

module.exports.index = [
  auth,
  isAdmin,
  userValidator.validateQueryString,
  async (req, res) => {
    // Filtering
    const { sq, role, sort, page, limit } = matchedData(req);
    const whereClause = {};

    if (sq) {
      whereClause.OR = [
        {
          firstName: {
            contains: sq,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: sq,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: sq,
            mode: "insensitive",
          },
        },
      ];
    }

    if (role) {
      whereClause.role = role;
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
    const totalItems = await prisma.user.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / recordsLimit);

    // Getting the data
    const users = await prisma.user.findMany({
      skip: skip,
      take: recordsLimit,
      where: whereClause,
      orderBy: sortList,
    });

    res.status(200).json({
      success: true,
      data: userResourceArray(users),
      meta: {
        currentPage: currentPage,
        totalPages: totalPages,
        itemsPerPage: recordsLimit,
        totalItems: totalItems,
      },
    });
  },
];

module.exports.show = [
  auth,
  isAdmin,
  userValidator.userExists,
  async (req, res) => {
    res.status(200).json({
      success: true,
      data: userResource(req.selectedUser),
    });
  },
];

module.exports.destroy = [
  auth,
  isAdmin,
  userValidator.userExists,
  async (req, res) => {
    const profileImagePath = req.selectedUser.profileImage;
    await prisma.user.delete({
      where: { id: req.selectedUser.id },
    });
    if (profileImagePath) {
      await fs.unlink(profileImagePath);
    }
    res.sendStatus(204);
  },
];
