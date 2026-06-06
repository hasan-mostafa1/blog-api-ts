import type { Handler } from "express";
import passport from "passport";

const auth: () => void = (() =>
  passport.authenticate("jwt", { session: false }))();

export default auth;
