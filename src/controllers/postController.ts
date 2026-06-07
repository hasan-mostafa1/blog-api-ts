import { matchedData } from "express-validator";
import { prisma } from "../lib/prisma.js";
import { postResource, postResourceArray } from "../resources/postResource.js";
import * as postValidator from "../validators/postValidator.js";
import upload from "../config/multer.js";
import auth from "../middlewares/authMiddleware.js";
import isPostAuthor from "../middlewares/isPostAuthorMiddleware.js";
import fs from "node:fs/promises";
import path from "node:path";
import type { Request, RequestHandler, Response } from "express";
import type { Post, Prisma } from "../generated/prisma/client.js";

export const index = [
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
    const whereClause: Prisma.PostWhereInput = { published: true };

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
      // req.query.page = 1;
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

export const myPosts = [
  auth,
  ...postValidator.validateQueryString,
  async (req: Request, res: Response) => {
    // Filtering
    const { sq, sort, page, limit } = matchedData(req);
    const whereClause: Prisma.PostWhereInput = { authorId: req.user!.id };

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
      // req.query.page = 1;
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

export const store = [
  auth,
  upload.single("bannerImage"),
  ...postValidator.validatePost,
  async (req: Request, res: Response) => {
    const { title, content, published } = matchedData(req) as {
      title: string;
      content: string;
      published: boolean;
    };
    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
        bannerImage: req.file ? req.file.filename : null,
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
  ...postValidator.publishedPostExists,
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
  ...postValidator.postExists,
  isPostAuthor,
  upload.single("bannerImage"),
  ...postValidator.validatePost,
  async (req: Request, res: Response) => {
    const { title, content, published } = matchedData(req) as {
      title: string;
      content: string;
      published: boolean;
    };
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
  ...postValidator.postExists,
  isPostAuthor,
  async (req: Request, res: Response) => {
    let bannerImagePath: string | null = null;
    if (req.post?.bannerImage) {
      bannerImagePath = path.join(
        process.cwd(),
        "/public/uploads/profiles",
        req.post.bannerImage,
      );
    }
    const { postId } = matchedData(req) as {
      postId: number;
    };
    await prisma.post.delete({
      where: { id: postId },
    });
    if (bannerImagePath) {
      await fs.unlink(bannerImagePath);
    }
    res.sendStatus(204);
  },
];

export const increaseLikes = [
  ...postValidator.publishedPostExists,
  async (req: Request, res: Response) => {
    const post = await prisma.post.update({
      where: { id: req.post!.id },
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

export const decreaseLikes = [
  ...postValidator.publishedPostExists,
  async (req: Request, res: Response) => {
    let post: Post = req.post!;
    if (req.post!.likes > 0) {
      post = await prisma.post.update({
        where: { id: req.post!.id },
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
