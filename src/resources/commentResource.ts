import {
  type UserApiResponse,
  userResource,
} from "../resources/userResource.js";
import type { Comment, User } from "../generated/prisma/client.js";

interface CommentResourceData extends Comment {
  author?: User | null;
  parent?: Comment | null;
}

interface CommentApiResponse {
  id: number;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  author: UserApiResponse | null;
  parent: CommentApiResponse | null;
}

export const commentResource = (
  data: CommentResourceData,
): CommentApiResponse => {
  return {
    id: data.id,
    content: data.content,
    likes: data.likes,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    author: data.author ? userResource(data.author) : null,
    parent: data.parent
      ? commentResource(data.parent as CommentResourceData)
      : null,
  };
};

export const commentResourceArray = (data: CommentResourceData[]) =>
  data.map(commentResource);
