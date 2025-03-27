import bcrypt from "bcryptjs";

export async function validatePassword(
  saltedPassword: string,
  password: string
): Promise<boolean> {
  return new Promise((resolve) => {
    bcrypt.compare(password, saltedPassword, async function (err, res) {
      if (err) {
        throw err;
      }

      if (res) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve) => {
    bcrypt.genSalt(2, function (err, salt) {
      if (err) {
        throw err;
      }

      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) {
          throw err;
        }

        resolve(hash);
      });
    });
  });
}
