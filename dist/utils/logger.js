"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ready = exports.db = exports.debug = exports.error = exports.warn = exports.info = exports.plain = exports.log = void 0;
const error_reporting_1 = require("@google-cloud/error-reporting");
const colors_1 = __importDefault(require("colors"));
const moment_1 = __importDefault(require("moment"));
const errors = new error_reporting_1.ErrorReporting({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    key: process.env.GOOGLE_CLOUD_ERROR_REPORTING_API_KEY,
});
const log = (content, type = "log") => {
    const timestamp = `${colors_1.default.white(`[${(0, moment_1.default)().format("DD-MM-YY H:m:s")}]`)}`;
    switch (type) {
        case "log":
            return console.log(`${colors_1.default.grey("[LOG]")} ${timestamp} ${content}`);
        case "plain":
            return console.log(`${content}`);
        case "info":
            return console.log(`${colors_1.default.cyan("[INFO]")} ${timestamp} ${colors_1.default.cyan(content)}`);
        case "warn":
            return console.log(`${colors_1.default.yellow("[WARN]")} ${timestamp} ${colors_1.default.yellow(content)} `);
        case "error":
            errors.report(content);
            return console.log(`${colors_1.default.red("[ERROR]")} ${timestamp} ${colors_1.default.red(content)} `);
        case "debug":
            return console.log(`${colors_1.default.green("[DEBUG]")}  ${timestamp} ${colors_1.default.green(content)} `);
        case "db": {
            return console.log(`${colors_1.default.magenta("[DATABASE]")} ${timestamp} ${colors_1.default.magenta(content)} `);
        }
        case "ready":
            return console.log(`${colors_1.default.rainbow("[READY]")}  ${timestamp} ${colors_1.default.rainbow(content)}`);
        default:
            throw new TypeError("Logger type not correct.");
    }
};
exports.log = log;
const plain = (content) => (0, exports.log)(content, "plain");
exports.plain = plain;
const info = (content) => (0, exports.log)(content, "info");
exports.info = info;
const warn = (content) => (0, exports.log)(content, "warn");
exports.warn = warn;
const error = (content) => (0, exports.log)(content, "error");
exports.error = error;
const debug = (content) => (0, exports.log)(content, "debug");
exports.debug = debug;
const db = (content) => (0, exports.log)(content, "db");
exports.db = db;
const ready = (content) => (0, exports.log)(content, "ready");
exports.ready = ready;
//# sourceMappingURL=logger.js.map