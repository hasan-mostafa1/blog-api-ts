export interface UserResourceData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
}

export const userResource = (data: UserResourceData): UserResourceData => {
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
): UserResourceData[] => data.map(userResource);
