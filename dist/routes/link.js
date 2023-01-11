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
const express = __importStar(require("express"));
const check_1 = require("../functions/link/check");
const router = express.Router();
/**
 * GET /link/check
 * @summary Checks if a link is classified as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 * @param {string} link.query.required - The link to check
 */
router.get("/check", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.query.link;
    const rsp = yield (0, check_1.checkLink)(url);
    if (rsp.isScam) {
        res.status(200).json({
            isScam: true,
            link: rsp.link,
            flattenedLink: rsp.flattenedLink,
            localDbNative: rsp.localDbNative,
        });
    }
    else if (!rsp.isScam) {
        res.status(200).json({
            isScam: false,
            link: rsp.link,
            flattenedLink: rsp.flattenedLink,
            localDbNative: rsp.localDbNative,
        });
    }
    else {
        res.status(400).json({
            error: "Something went wrong",
        });
    }
}));
/**
 * GET /link/report
 * @summary Reports a link as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.get("/report", (req, res) => {
    res.send("Link report");
});
exports.default = router;
//# sourceMappingURL=link.js.map