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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const domain_1 = __importDefault(require("./domain"));
const link_1 = __importDefault(require("./link"));
const user_1 = __importDefault(require("./user"));
const router = express.Router();
/**
 * GET /
 * @summary The Root endpoint, simply returns "Hello World!"
 * @tags Main API Endpoints
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.get("/", (req, res) => {
    res.send("Hello World!");
});
/**
 * GET /tos
 * @summary This serves the terms of service page
 * @tags Misc Endpoints
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.get("/tos", (req, res) => {
    // send the file, located in src/public/html/tos.html
    res.sendFile("tos.html", { root: "./src/public/html" });
});
/**
 * GET /privacy
 * @summary This serves the privacy policy page
 * @tags Misc Endpoints
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.get("/privacy", (req, res) => {
    // send the file, located in src/public/html/privacy.html, with the css styling applied
    res.sendFile("privacy.html", { root: "./src/public/html" });
});
router.use("/user", user_1.default);
router.use("/link", link_1.default);
router.use("/domain", domain_1.default);
exports.default = router;
//# sourceMappingURL=router.js.map