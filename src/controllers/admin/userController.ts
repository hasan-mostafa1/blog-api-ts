import { matchedData } from "express-validator";
import { prisma } from "../../lib/prisma.js";
import auth from "../../middlewares/authMiddleware.js";
import isAdmin from "../../middlewares/isAdminMiddleware.js";
import {
  userResource,
  userResourceArray,
} from "../../resources/userResource.js";
import * as userValidator from "../../validators/userValidator.js";
import fs from "node:fs/promises";
import type { Request, Response } from "express";
import type { Prisma } from "../../generated/prisma/client.js";
export const index = [
  auth,
  isAdmin,
  ...userValidator.validateQueryString,
  async (req: Request, res: Response) => {
    // Filtering
    const { sq, role, sort, page, limit } = matchedData(req) as {
      sq?: string;
      role: "ADMIN" | "USER";
      sort?: string;
      page?: number;
      limit?: number;
    };
    const whereClause: Prisma.UserWhereInput = {};

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
    let sortList: Prisma.UserOrderByWithRelationInput[] = [
      {
        id: "asc",
      },
    ];
    if (sort) {
      sortList = [];
      const sortQuery = sort;
      sortQuery.split(",").forEach((item: string) => {
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

export const show = [
  auth,
  isAdmin,
  ...userValidator.userExists,
  async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: userResource(req.selectedUser!),
    });
  },
];

export const destroy = [
  auth,
  isAdmin,
  ...userValidator.userExists,
  async (req: Request, res: Response) => {
    const profileImagePath = req.selectedUser?.profileImage;
    await prisma.user.delete({
      where: { id: req.selectedUser!.id },
    });
    if (profileImagePath) {
      await fs.unlink(profileImagePath);
    }
    res.sendStatus(204);
  },
];
