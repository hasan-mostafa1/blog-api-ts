import { matchedData } from "express-validator";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import auth from "../middlewares/authMiddleware.js";
import * as userValidator from "../validators/userValidator.js";
import * as utils from "../lib/utils.js";
import { userResource } from "../resources/userResource.js";
import upload from "../config/multer.js";
import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";

export const signup = [
  ...userValidator.validateSignup,
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = matchedData(req) as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    };
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      },
    });

    const jwt = utils.issueJwt(user);
    res.status(201).json({
      success: true,
      user: userResource(user),
      token: jwt.token,
      expiresIn: jwt.expiresIn,
    });
  },
];

export const login = [
  ...userValidator.validateLogin,
  async (req: Request, res: Response) => {
    const { email, password } = matchedData(req) as {
      email: string;
      password: string;
    };
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "email or password is incorrect.",
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const jwt = utils.issueJwt(user);
      return res.status(200).json({
        success: true,
        user: userResource(user),
        token: jwt.token,
        expiresIn: jwt.expiresIn,
      });
    } else {
      return res.status(401).json({
        success: false,
        msg: "email or password is incorrect.",
      });
    }
  },
];

export const showProfile = [
  auth,
  (req: Request, res: Response) =>
    res.status(200).json({ user: userResource(req.user!) }),
];

export const updateProfileImage = [
  auth,
  upload.single("profileImage"),
  ...userValidator.validateProfileImage,
  async (req: Request, res: Response) => {
    let oldFilePath: string | null = null;
    if (req.user?.profileImage) {
      oldFilePath = path.join(
        process.cwd(),
        "public/uploads/profiles",
        req.user.profileImage,
      );
    }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        profileImage: req.file!.filename,
      },
    });
    // Delete uploaded file if validation fails
    if (oldFilePath) {
      await fs.unlink(oldFilePath);
    }
    res.status(200).json({ user: userResource(user) });
  },
];
