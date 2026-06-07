import type { Post, User } from "../generated/prisma/client.js";
import {
  userResource,
  type UserApiResponse,
} from "../resources/userResource.js";

interface PostResourceData extends Post {
  author?: User | null;
}

interface PostApiResponse {
  id: number;
  title: string;
  content: string;
  bannerImage: string | null;
  likes: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: UserApiResponse | null;
}

export const postResource = (data: PostResourceData): PostApiResponse => {
  return {
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
};

export const postResourceArray = (
  data: PostResourceData[],
): PostApiResponse[] => data.map(postResource);
