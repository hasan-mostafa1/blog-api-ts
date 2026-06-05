const jsonwebtoken = require("jsonwebtoken");

module.exports.issueJwt = (user) => {
  const id = user.id;
  const expiresIn = "1d";

  const payload = {
    sub: id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn,
  });

  return {
    token: "Bearer " + signedToken,
    expiresIn,
  };
};
