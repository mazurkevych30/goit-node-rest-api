import bcrupt from "bcrypt";

import User from "../Model/User.js";

function findUser(filter) {
  return User.findOne(filter);
}

async function addUser(data) {
  const hashPassword = await bcrupt.hash(data.password, 10);
  return User.create({ ...data, password: hashPassword });
}

export { addUser, findUser };