const { Router } = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");

const router = Router();

// Auth
router.post("/auth/signup", authController.signup);
router.post("/auth/login", authController.login);
router.get("/auth/profile", authController.showProfile);
router.put("/auth/profile-image", authController.updateProfileImage);

// Posts
router.get("/posts", postController.index);
router.get("/my-posts", postController.myPosts);
router.post("/posts", postController.store);
router.get("/posts/:postId", postController.show);
router.put("/posts/:postId", postController.update);
router.delete("/posts/:postId", postController.destroy);
router.patch("/posts/:postId/like", postController.increaseLikes);
router.patch("/posts/:postId/unLike", postController.decreaseLikes);

// Comments
router.get("/posts/:postId/comments", commentController.index);
router.post("/posts/:postId/comments", commentController.store);
router.put("/posts/:postId/comments/:commentId", commentController.update);
router.delete("/posts/:postId/comments/:commentId", commentController.destroy);
router.get(
  "/posts/:postId/comments/:commentId/replies",
  commentController.getReplies,
);
router.post(
  "/posts/:postId/comments/:commentId/replies",
  commentController.addReply,
);
router.patch(
  "/posts/:postId/comments/:commentId/like",
  commentController.increaseLikes,
);
router.patch(
  "/posts/:postId/comments/:commentId/unlike",
  commentController.decreaseLikes,
);

module.exports = router;
