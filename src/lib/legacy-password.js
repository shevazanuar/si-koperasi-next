import crypto from "crypto";
import { hashPassword, verifyPassword } from "./password";

export function md5(input) {
  return crypto.createHash("md5").update(input).digest("hex");
}

export async function verifyLegacyOrBcrypt(inputPassword, storedPassword) {
  // If the stored password is 32 characters long and consists of hex characters, it might be MD5.
  // We'll check if it's 32 chars long. Bcrypt hashes are 60 chars long.
  if (storedPassword && storedPassword.length === 32) {
    return md5(inputPassword) === storedPassword;
  }

  return verifyPassword(inputPassword, storedPassword);
}

export async function shouldRehashPassword(storedPassword) {
  return storedPassword && storedPassword.length === 32;
}

export async function rehashPassword(inputPassword) {
  return hashPassword(inputPassword);
}
