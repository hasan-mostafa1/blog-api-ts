import type {
  Comment,
  Post,
  User as PrismaUser,
} from "../generated/prisma/client.ts";

declare global {
  namespace Express {
    interface User extends PrismaUser {}
    interface Request {
      post?: Post;
      comment?: Comment;
      selectedUser?: User;
    }
  }
}

export {};
