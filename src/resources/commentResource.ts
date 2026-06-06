import {
  userResource,
  type UserResourceData,
} from "../resources/userResource.js";

interface CommentResourceData {
  id: number;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  author: UserResourceData | null;
  parent: CommentResourceData | null;
}

export const commentResource = (
  data: CommentResourceData,
): CommentResourceData => {
  return {
    id: data.id,
    content: data.content,
    likes: data.likes,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    author: data.author ? userResource(data.author) : null,
    parent: data.parent ? commentResource(data.parent) : null,
  };
};

export const commentResourceArray = (
  data: CommentResourceData[],
): CommentResourceData[] => data.map(commentResource);
