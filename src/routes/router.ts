import * as express from "express";
import swaggerUi from "swagger-ui-express";

import { apiSpecs } from "../functions/apiSpecs";
import userRoutes from "./user/_index";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

// create a tos route
router.get("/tos", (req, res) => {
  // send a pretty html tos page
  res.send("Hello World!");
});

router.use("/docs", swaggerUi.serve, swaggerUi.setup(apiSpecs));

router.use("/user", userRoutes);

export default router;
