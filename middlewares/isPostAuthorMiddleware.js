const isPostAuthor = (req, res, next) => {
  if (req.user && req.post && req.user.id === req.post.authorId) {
    next();
  } else {
    res.status(403).json({ msg: "Forbidden" });
  }
};

module.exports = isPostAuthor;
