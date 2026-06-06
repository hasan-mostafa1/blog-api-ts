import jsonwebtoken from "jsonwebtoken";

interface IssueJwtUser {
  id: number;
}

interface JwtResult {
  token: string;
  expiresIn: string;
}

export const issueJwt = (user: IssueJwtUser): JwtResult => {
  const id = user.id;
  const expiresIn = "1d";

  const payload = {
    sub: id,
    iat: Math.floor(Date.now() / 1000),
  };

  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "TOKEN_SECRET is not defined in the environment variables.",
    );
  }

  const signedToken = jsonwebtoken.sign(payload, secret, {
    expiresIn,
  });

  return {
    token: "Bearer " + signedToken,
    expiresIn,
  };
};
