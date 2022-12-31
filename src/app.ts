import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import "dotenv/config";

import { setHeaders } from "./middleware/setHeaders";
import router from "./routes/router";


const app = express();

app.use(cors({}));
app.use(bodyParser.json({}));
app.use(
  helmet({
    referrerPolicy: false,
  })
);
app.use(setHeaders);


app.use("/", router);

export default app;