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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const error_reporting_1 = require("@google-cloud/error-reporting");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_jsdoc_swagger_1 = __importDefault(require("express-jsdoc-swagger"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_1 = require("socket.io");
require("dotenv/config");
const swaggerOptions_1 = require("./config/swaggerOptions");
const Link_schema_1 = require("./database/models/Link.schema");
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
const router_1 = __importDefault(require("./routes/router"));
const logger = __importStar(require("./utils/logger"));
const validateEnv_1 = require("./utils/validateEnv");
const API_PORT = process.env.API_PORT;
void (() => __awaiter(void 0, void 0, void 0, function* () {
    const errors = new error_reporting_1.ErrorReporting({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        key: process.env.GOOGLE_CLOUD_ERROR_REPORTING_API_KEY,
    });
    const validatedEnvironment = (0, validateEnv_1.validateEnv)();
    if (!validatedEnvironment.valid) {
        logger.error(validatedEnvironment.message);
        return;
    }
    else {
        logger.info("Environment variables validated.");
    }
    logger.db("Connecting to MongoDB...");
    mongoose_1.default.set("strictQuery", true);
    const connection = yield mongoose_1.default.connect(process.env.MONGO_URI);
    if (!connection) {
        logger.error("Failed to connect to MongoDB.");
        process.exit(1);
    }
    logger.db("Connected to MongoDB.");
    mongoose_1.default.connection.on("error", (err) => {
        logger.error(err);
    });
    const app = (0, express_1.default)();
    (0, express_jsdoc_swagger_1.default)(app)(swaggerOptions_1.swaggerOptions);
    app.use(errors.express);
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use((0, helmet_1.default)({
        referrerPolicy: false,
    }));
    app.use(body_parser_1.default.json({}));
    app.use((0, cors_1.default)({
        origin: "*",
    }));
    app.use(error_handler_1.default);
    app.use("/", router_1.default);
    const httpServer = (0, http_1.createServer)(app);
    const io = new socket_io_1.Server(httpServer, {
    /* options */
    });
    // const secretKey = process.env.SECRET_KEY as string;
    // Define a namespace for endpoint 1
    const endpoint1 = io.of("/db-change-streams");
    endpoint1.on("connection", (client) => {
        console.log("Client connected");
        // Set up a change stream on the Link model
        const changeStream = Link_schema_1.LinkModel.watch();
        // When a change is detected, send it to all connected clients (speify change type)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeStream.on("change", (change) => {
            // if change is an insert, send the new document
            if (change.operationType === "insert") {
                const newLink = change.fullDocument;
                const link = newLink.link;
                client.emit("link", "+ " + `${link}`);
                client.emit("link-added", {
                    id: newLink.id,
                    link: newLink.link,
                });
            }
            // if change is a delete, send the id of the deleted document
            if (change.operationType === "delete") {
                const deletedLink = change.fullDocument;
                const link = deletedLink.link;
                client.emit("link", "- " + `${link}`);
                client.emit("link-deleted", {
                    id: deletedLink.id,
                    link: deletedLink.link,
                });
            }
        });
        // Clean up change stream when client disconnects
        client.on("disconnect", () => {
            changeStream.close();
        });
    });
    const application = httpServer.listen(API_PORT, () => {
        logger.ready(`API listening on port ${API_PORT}`);
        logger.plain("Press Ctrl+C to quit.");
    });
    if (!application) {
        logger.error("Error starting API || Missing Application");
        process.exit(1);
    }
    if (!connection) {
        logger.error("Error starting API || Missing DB Connection");
        process.exit(1);
    }
}))();
//# sourceMappingURL=index.js.map