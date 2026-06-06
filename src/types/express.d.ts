interface PostPayload {
  id: number;
  authorId: number;
  title: string;
}

declare global {
  namespace Express {
    interface User {
      id: number;
      role: "ADMIN" | "USER";
    }

    interface Request {
      post?: PostPayload;
    }
  }
}

export {};
