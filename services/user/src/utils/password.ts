import bcrypt from "bcryptjs";

export const generateHashPassword = async (
  password: string
): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const checkPassword = async (
  userPassword: string,
  dbPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(userPassword, dbPassword);
};
