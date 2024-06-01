import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import { nanoid } from "nanoid";

import bcrypt from "bcrypt";
import { createToken } from "../helpers/jwt.js";

import * as authServises from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import sendEmail from "../helpers/sendEmail.js";

import gravatar from "gravatar";

const avatarsPath = path.resolve("public", "avatars");

const singup = async (req, res) => {
  const { email } = req.body;
  const user = await authServises.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const avatarURL = gravatar.url(email, { s: 250 }, true);

  const verificationToken = nanoid();

  const newUser = await authServises.addUser({
    ...req.body,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Click verify  email.</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken: token } = req.params;
  const user = await authServises.findUser({ verificationToken: token });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  await authServises.updateUser(
    { _id: user._id },
    { verify: true, verificationToken: "null" }
  );

  res.json({
    message: "Verification successful",
  });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;
  const user = await authServises.findUser({ email });

  if (!user) {
    throw HttpError(404, "Email not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${user.verificationToken}">Click verify  email.</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
};

const singin = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServises.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verify");
  }

  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;
  const payload = { id };

  const token = createToken(payload);
  await authServises.updateUser({ _id: id }, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await authServises.updateUser({ _id }, { token: "" });

  res.status(204).json();
};

const updateMembership = async (req, res) => {
  const { _id } = req.user;

  const result = await authServises.updateUser({ _id }, req.body);

  res.json({
    email: result.email,
    subscription: result.subscription,
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  if (!req.file) {
    throw HttpError(400, "avatarURL must have photo");
  }
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsPath, filename);

  Jimp.read(oldPath, (err, avatar) => {
    if (err) HttpError(400);
    avatar.resize(250, 250).write(oldPath);
    fs.rename(oldPath, newPath);
  });

  const avatarURL = path.join("avatars", filename);
  const result = await authServises.updateUser({ _id }, { avatarURL });

  res.json({
    avatarURL: result.avatarURL,
  });
};

export default {
  singup: ctrlWrapper(singup),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  singin: ctrlWrapper(singin),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateMembership: ctrlWrapper(updateMembership),
  updateAvatar: ctrlWrapper(updateAvatar),
};
