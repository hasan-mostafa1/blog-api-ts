import upload from "../../config/multer.js";
import { prisma } from "../../lib/prisma.js";
import auth from "../../middlewares/authMiddleware.js";
import isAdmin from "../../middlewares/isAdminMiddleware.js";
import {
  postResource,
  postResourceArray,
} from "../../resources/postResource.js";
import * as postValidator from "../../validators/postValidator.js";
import fs from "node:fs/promises";
import { matchedData } from "express-validator";
import type { Request, Response } from "express";
import type { Prisma } from "../../generated/prisma/client.js";
import path from "node:path";

export const index = [
  auth,
  isAdmin,
  ...postValidator.validateQueryString,
  async (req: Request, res: Response) => {
    // Filtering
    const { sq, authorId, sort, page, limit } = matchedData(req) as {
      sq?: string;
      authorId: number;
      sort?: string;
      page?: number;
      limit?: number;
    };
    const whereClause: Prisma.PostWhereInput = {};

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
    let sortList: Prisma.PostOrderByWithRelationInput[] = [
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

export const store = [
  auth,
  isAdmin,
  upload.single("bannerImage"),
  ...postValidator.validatePost,
  async (req: Request, res: Response) => {
    const { title, content, published } = matchedData(req) as {
      title: string;
      content: string;
      published: boolean;
    };

    const bannerImage = req.file ? req.file.filename : null;

    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
        bannerImage: bannerImage,
        published: published,
        author: {
          connect: { id: req.user!.id },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: postResource(post),
    });
  },
];

export const show = [
  auth,
  isAdmin,
  ...postValidator.postExists,
  async (req: Request, res: Response) => {
    const post = req.post;
    res.status(200).json({
      success: true,
      data: postResource(post!),
    });
  },
];

export const update = [
  auth,
  isAdmin,
  ...postValidator.postExists,
  upload.single("bannerImage"),
  ...postValidator.validatePost,
  async (req: Request, res: Response) => {
    const { title, content, published } = matchedData(req);
    let bannerImageName = req.post ? req.post.bannerImage : null;
    if (req.file) {
      bannerImageName = req.file.filename;
    } else if (req.body.bannerImage === null || req.body.bannerImage === "") {
      bannerImageName = null;
    }

    const post = await prisma.post.update({
      where: { id: req.post!.id },
      data: {
        title: title,
        content: content,
        bannerImage: bannerImageName,
        published: published,
      },
    });

    if (
      req.post?.bannerImage &&
      (req.file || req.body.bannerImage === null || req.body.bannerImage === "")
    ) {
      const bannerImagePath = path.join(
        process.cwd(),
        "/public/uploads/profiles",
        req.post.bannerImage,
      );
      await fs.unlink(bannerImagePath);
    }

    res.status(200).json({
      success: true,
      data: postResource(post),
    });
  },
];

export const destroy = [
  auth,
  isAdmin,
  ...postValidator.postExists,
  async (req: Request, res: Response) => {
    let bannerImagePath: string | null = null;
    if (req.post?.bannerImage) {
      bannerImagePath = path.join(
        process.cwd(),
        "/public/uploads/profiles",
        req.post.bannerImage,
      );
    }
    const { postId } = matchedData(req) as { postId: number };
    await prisma.post.delete({
      where: { id: postId },
    });
    if (bannerImagePath) {
      await fs.unlink(bannerImagePath);
    }
    res.sendStatus(204);
  },
];
