const { userResource } = require("../resources/userResource");

const commentResource = (data) => {
  const comment = {
    id: data.id,
    content: data.content,
    likes: data.likes,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    author: data.author ? userResource(data.author) : null,
    parent: data.parent ? commentResource(data.parent) : null,
  };
  return comment;
};

const commentResourceArray = (data) => {
  const comments = data.map((comment) => {
    return {
      id: comment.id,
      content: comment.content,
      likes: comment.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author ? userResource(comment.author) : null,
      parent: comment.parent ? commentResource(comment.parent) : null,
    };
  });
  return comments;
};

module.exports = {
  commentResource,
  commentResourceArray,
};
