"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcrypt"));
const express = __importStar(require("express"));
const jwt = __importStar(require("jsonwebtoken"));
const User_schema_1 = require("../database/models/User.schema");
const router = express.Router();
/**
 * GET /user/signup
 * @summary This endpoint is used to sign up a new user.
 * @tags Authentication Endpoints
 * @param {string} email.query.required - email of the user
 * @param {string} password.query.required - password of the user
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the request body
        if (!req.body.email || !req.body.password) {
            return res
                .status(400)
                .send({ message: "Email and password are required." });
        }
        // Check if a user with the same email already exists
        const user = yield User_schema_1.UserModel.findOne({ email: req.body.email });
        if (user) {
            return res
                .status(400)
                .send({ message: "A user with the same email already exists." });
        }
        // Hash the password
        const hash = yield bcrypt.hash(req.body.password, 10);
        // Create a new user
        const newUser = new User_schema_1.UserModel({
            email: req.body.email,
            password: hash,
        });
        yield newUser.save();
        // Generate a JSON Web Token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRE, {
            expiresIn: 86400, // expires in 24 hours
        });
        // Return the token in the response
        res.status(201).send({ auth: true, token });
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "There was a problem registering the user." });
    }
}));
exports.default = router;
//# sourceMappingURL=user.js.map