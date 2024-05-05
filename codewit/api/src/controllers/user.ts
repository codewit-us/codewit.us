import { User } from '../models';

export async function createUser(
  username: string,
  email: string,
  googleId: string,
  isAdmin?: boolean
): Promise<User> {
  const user = await User.create({
    username,
    email,
    googleId,
    isAdmin: isAdmin || false,
  });

  return user;
}

export async function getAllUsers(): Promise<User[]> {
  const users = await User.findAll();
  return users;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await User.findOne({ where: { email } });
  return user;
}

export async function updateUser(
  uid: number,
  username?: string,
  email?: string,
  isAdmin?: boolean
): Promise<User | null> {
  const user = await User.findByPk(uid);

  if (!user) {
    return null;
  }

  if (username) {
    user.username = username;
  }
  if (email) {
    user.email = email;
  }
  if (isAdmin !== undefined) {
    user.isAdmin = isAdmin;
  }
  await user.save();
  await user.reload();

  return user;
}

export async function deleteUser(uid: number): Promise<boolean> {
  const user = await User.findByPk(uid);

  if (!user) {
    return false;
  }

  await user.destroy();
  return true;
}
