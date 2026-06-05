const { matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/prisma");
const auth = require("../middlewares/authMiddleware");
const userValidator = require("../validators/userValidator");
const utils = require("../lib/utils");
const { userResource } = require("../resources/userResource");
const upload = require("../config/multer");
const fs = require("node:fs/promises");
const path = require("node:path");

module.exports.signup = [
  userValidator.validateSignup,
  async (req, res) => {
    const { firstName, lastName, email, password } = matchedData(req);
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

module.exports.login = [
  userValidator.validateLogin,
  async (req, res) => {
    const { email, password } = matchedData(req);
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

module.exports.showProfile = [
  auth,
  (req, res) => res.status(200).json({ user: userResource(req.user) }),
];

module.exports.updateProfileImage = [
  auth,
  upload.single("profileImage"),
  userValidator.validateProfileImage,
  async (req, res) => {
    const oldFilePath = path.join(
      __dirname,
      "../public/uploads/profiles",
      req.user.profileImage,
    );
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profileImage: req.file.filename,
      },
    });
    // Delete uploaded file if validation fails
    if (oldFilePath) {
      await fs.unlink(oldFilePath);
    }
    res.status(200).json({ user: userResource(user) });
  },
];
