"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = void 0;
const User_schema_1 = require("../database/models/User.schema");
function createUser(user) {
    const newUser = new User_schema_1.UserModel(user);
    return newUser.save();
}
exports.createUser = createUser;
function getUserById(id) {
    return User_schema_1.UserModel.findById(id).exec();
}
exports.getUserById = getUserById;
function updateUser(id, user) {
    return User_schema_1.UserModel.findByIdAndUpdate(id, user, { new: true }).exec();
}
exports.updateUser = updateUser;
function deleteUser(id) {
    return User_schema_1.UserModel.findByIdAndDelete(id).exec();
}
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.js.map