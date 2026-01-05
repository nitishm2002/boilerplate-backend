import bcrypt from 'bcrypt';

export async function generateHash(str: string) {
  const bcryptSalt = bcrypt.genSaltSync(10);
  const strHash = await bcrypt.hash(str, Number(bcryptSalt));
  return strHash.toString();
}

export function compareHash(str: string, hash: string) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(str, hash, function (err, isMatch) {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
}
