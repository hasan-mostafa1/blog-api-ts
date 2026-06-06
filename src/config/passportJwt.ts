import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  type StrategyOptionsWithoutRequest,
} from "passport-jwt";
import { prisma } from "../lib/prisma.js";

const options: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_SECRET as string,
};

interface Payload {
  sub: number;
  iat: number;
}

const strategy = new JwtStrategy(options, async (payload: Payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      done(null, false);
    }
    return done(null, user);
  } catch (err) {
    done(err, false);
  }
});

passport.use(strategy);
