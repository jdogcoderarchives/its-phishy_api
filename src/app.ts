import express, { Request, Response } from 'express';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import helmet from 'helmet';

import { swaggerOptions } from './config/swaggerOptions';
import router from './router';

const app = express();

expressJSDocSwagger(app)(swaggerOptions);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
	helmet({
		referrerPolicy: false,
	})
);

app.use('/', router);

export default app;
