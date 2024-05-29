import Joi from "joi";
import { membershipTypeList } from "../constants/user-constans.js";

export const authSignupSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
  subscription: Joi.string()
    .valid(...membershipTypeList)
    .default("starter"),
});

export const authSigninSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
});

export const updateMembershipSchema = Joi.object({
  subscription: Joi.string()
    .valid(...membershipTypeList)
    .required(),
});
