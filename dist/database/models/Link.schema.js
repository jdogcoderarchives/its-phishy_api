"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const linkSchema = new mongoose_1.default.Schema({
    id: {
        type: String,
        required: [true, "Link ID is required"],
        unique: true,
    },
    link: {
        type: String,
        required: [true, "Link is required"],
        unique: true,
    },
    flatLink: {
        type: String,
        required: [true, "Flat Link is required"],
        unique: true,
    },
    reportedBy: {
        type: String,
        // required: [true, "Reported By is required"],
    },
    reportedByID: {
        type: String,
        // required: [true, "Reported By ID is required"],
    },
    dateReported: {
        type: Date,
        default: Date.now,
        required: [true, "Date is required"],
    },
});
exports.LinkModel = mongoose_1.default.model("Link", linkSchema);
//# sourceMappingURL=Link.schema.js.map