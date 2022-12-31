import * as bcrypt from "bcrypt";
import * as express from "express";
import * as jwt from "jsonwebtoken";

import { UserModel } from "../../database/models/User.schema";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    // Validate the request body
    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .send({ message: "Email and password are required." });
    }

    // Check if a user with the same email already exists
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .send({ message: "A user with the same email already exists." });
    }

    // Hash the password
    const hash = await bcrypt.hash(req.body.password, 10);

    // Create a new user
    const newUser = new UserModel({
      email: req.body.email,
      password: hash,
    });
    await newUser.save();

    // Generate a JSON Web Token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRE as string,
      {
        expiresIn: 86400, // expires in 24 hours
      }
    );

    // Return the token in the response
    res.status(201).send({ auth: true, token });
  } catch (error) {
    res
      .status(500)
      .send({ message: "There was a problem registering the user." });
  }
});

export default router;
