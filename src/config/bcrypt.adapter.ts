import { compare, compareSync, genSaltSync, hashSync } from "bcryptjs";

export const bcryptAdapter = {
  hash: (password: string) => {
    const salt = genSaltSync();
    return hashSync(salt);
  },

  compare: (password: string, hashed: string) => {
    return compareSync(password, hashed);
  },
};
