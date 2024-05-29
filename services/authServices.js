import bcrypt from "bcrypt";

import User from "../Model/User.js";

function findUser(filter) {
  return User.findOne(filter);
}

async function addUser(data) {
  const hashPassword = await bcrypt.hash(data.password, 10);
  return User.create({ ...data, password: hashPassword });
}

function updateUser(filter, data) {
  return User.findOneAndUpdate(filter, data);
}

export { addUser, findUser, updateUser };
