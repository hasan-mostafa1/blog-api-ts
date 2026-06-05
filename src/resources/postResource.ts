const {
  userResource,
  userResourceArray,
} = require("../resources/userResource");

const postResource = (data) => {
  const post = {
    id: data.id,
    title: data.title,
    content: data.content,
    bannerImage: data.bannerImage,
    likes: data.likes,
    published: data.published,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    author: data.author ? userResource(data.author) : null,
  };
  return post;
};

const postResourceArray = (data) => {
  const posts = data.map((post) => {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      bannerImage: post.bannerImage,
      likes: post.likes,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author ? userResource(post.author) : null,
    };
  });
  return posts;
};

module.exports = {
  postResource,
  postResourceArray,
};
