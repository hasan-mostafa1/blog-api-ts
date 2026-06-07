import type { User } from "../generated/prisma/client.js";

export interface UserResourceData extends User {}

export interface UserApiResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
}

export const userResource = (data: UserResourceData): UserApiResponse => {
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    profileImage: data.profileImage,
  };
};

export const userResourceArray = (
  data: UserResourceData[],
): UserApiResponse[] => data.map(userResource);
