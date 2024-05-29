import express from "express";
import authControllers from "../controllers/authControllers.js";

import validateBody from "../decorators/validateBody.js";

import isEmptyBody from "../middlewares/isEmptyBody.js";
import authenticate from "../middlewares/authenticate.js";

import {
  authSignupSchema,
  authSigninSchema,
  updateMembershipSchema,
} from "../schemas/authSchemas.js";

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

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.logout);

authRouter.patch(
  "/",
  authenticate,
  isEmptyBody,
  validateBody(updateMembershipSchema),
  authControllers.updateMembership
);

export default authRouter;
