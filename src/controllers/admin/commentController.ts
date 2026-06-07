import auth from "../../middlewares/authMiddleware.js";
import isAdmin from "../../middlewares/isAdminMiddleware.js";
import { prisma } from "../../lib/prisma.js";
import {
  commentResource,
  commentResourceArray,
} from "../../resources/commentResource.js";
import * as commentValidator from "../../validators/commentValidator.js";
import * as postValidator from "../../validators/postValidator.js";
import { matchedData } from "express-validator";
import type { Request, Response } from "express";
import type { Prisma } from "../../generated/prisma/client.js";

export const index = [
  auth,
  isAdmin,
  ...commentValidator.validateQueryString,
  ...postValidator.publishedPostExists,
  async (req: Request, res: Response) => {
    // Filtering
    const { content, sort, page, limit } = matchedData(req) as {
      content?: string;
      sort?: string;
      page?: number;
      limit?: number;
    };
    const whereClause: Prisma.CommentWhereInput = {
      postId: req.post?.id as number,
    };

    if (content) {
      whereClause.content = {
        contains: content,
        mode: "insensitive",
      };
    }
    // Sorting
    let sortList: Prisma.CommentOrderByWithRelationInput[] = [
      {
        id: "asc",
      },
    ];
    if (sort) {
      sortList = [];
      const sortQuery = sort;
      sortQuery.split(",").forEach((item: string) => {
        let order: Prisma.SortOrder;
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

export const update = [
  auth,
  isAdmin,
  ...postValidator.publishedPostExists,
  ...commentValidator.commentExists,
  ...commentValidator.validateComment,
  async (req: Request, res: Response) => {
    const { content } = matchedData(req) as { content: string };
    const comment = await prisma.comment.update({
      where: { id: req.comment!.id },
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

export const destroy = [
  auth,
  isAdmin,
  ...postValidator.publishedPostExists,
  ...commentValidator.commentExists,
  async (req: Request, res: Response) => {
    await prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({
        where: { parentId: req.comment!.id },
      });

      await tx.comment.delete({
        where: { id: req.comment!.id },
      });
    });

    res.sendStatus(204);
  },
];
