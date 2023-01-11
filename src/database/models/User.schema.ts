import * as mongoose from "mongoose";

/**
 * A user type
 * @typedef {object} User
 * @property {string} id.required - The ID
 * @property {string} name.required - The name
 * @property {string} email.required - The email
 * @property {string} password.required - The password
 * @property {string} plan.required - The plan that the user is subscribed to
 * @property {string} dateCreated.required - The dateCreated
 *
 */
interface User extends mongoose.Document {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: string;
  date_created: Date;
}

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "User ID is required"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  plan: {
    type: String,
    enum: ["base", "personal", "buisness", "enterprise"],
    default: "base",
    required: [true, "Plan is required"],
  },
  dateCreated: {
    type: Date,
    default: Date.now,
    required: [true, "Date created is required"],
  },
});

// export the interface as User
export { User };
export const UserModel = mongoose.model<User>("User", userSchema);
