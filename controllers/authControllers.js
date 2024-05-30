import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";

import bcrypt from "bcrypt";
import { createToken } from "../helpers/jwt.js";

import * as authServises from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";

import gravatar from "gravatar";

const avatarsPath = path.resolve("public", "avatars");

const singup = async (req, res) => {
  const { email } = req.body;
  const user = await authServises.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const avatarURL = gravatar.url(email, { s: 250 }, true);
  const newUser = await authServises.addUser({ ...req.body, avatarURL });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const singin = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServises.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
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
  singin: ctrlWrapper(singin),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateMembership: ctrlWrapper(updateMembership),
  updateAvatar: ctrlWrapper(updateAvatar),
};
