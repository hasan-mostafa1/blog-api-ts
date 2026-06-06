import {
  userResource,
  type UserResourceData,
} from "../resources/userResource.js";

interface PostResourceData {
  id: number;
  title: string;
  content: string;
  bannerImage: string;
  likes: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: UserResourceData | null;
}

export const postResource = (data: PostResourceData): PostResourceData => {
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
): PostResourceData[] => data.map(postResource);
