import { UserModel, User } from "../database/models/User.schema";

export function createUser(user: User): Promise<User> {
  const newUser = new UserModel(user);
  return newUser.save();
}

export function getUserById(id: string): Promise<User | null> {
  return UserModel.findById(id).exec();
}

export function updateUser(id: string, user: User): Promise<User | null> {
  return UserModel.findByIdAndUpdate(id, user, { new: true }).exec();
}

export function deleteUser(id: string): Promise<User | null> {
  return UserModel.findByIdAndDelete(id).exec();
}
