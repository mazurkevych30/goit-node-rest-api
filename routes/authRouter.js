import express from "express";
import authControllers from "../controllers/authControllers.js";

import validateBody from "../decorators/validateBody.js";
import isEmptyBody from "../middlewares/isEmptyBody.js";

import { authSignupSchema, authSigninSchema } from "../schemas/authSchemas.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  isEmptyBody,
  validateBody(authSignupSchema),
  authControllers.singup
);

authRouter.post(
  "/login",
  isEmptyBody,
  validateBody(authSigninSchema),
  authControllers.singin
);

export default authRouter;
