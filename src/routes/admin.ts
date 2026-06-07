import { Router } from "express";
import * as userController from "../controllers/admin/userController.js";
import * as postController from "../controllers/admin/postController.js";
import * as commentController from "../controllers/admin/commentController.js";

const router = Router();

// Users
router.get("/users", userController.index);
router.get("/users/:userId", userController.show);
router.delete("/users/:userId", userController.destroy);

// Posts
router.get("/posts", postController.index);
router.post("/posts", postController.store);
router.get("/posts/:postId", postController.show);
router.put("/posts/:postId", postController.update);
router.delete("/posts/:postId", postController.destroy);

// Comments
router.get("/posts/:postId/comments", commentController.index);
router.put("/posts/:postId/comments/:commentId", commentController.update);
router.delete("/posts/:postId/comments/:commentId", commentController.destroy);

export default router;
