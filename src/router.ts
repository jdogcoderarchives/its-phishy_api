import * as express from 'express';

import domainRoutes from "./routes/domain";
import emailRoutes from "./routes/email";
import linkRoutes from "./routes/link";
import phoneNumberRoutes from "./routes/phoneNumber";

const router = express.Router();

/**
 * GET /
 * @summary The root endpoint, simply directs to the documentation page with a 418 status code
 * @tags Main API Endpoints
 * @return {object} 418 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.get('/', (req, res) => {
	res.status(418).send('Hello World!');
});

/**
 * GET /tos
 * @summary This serves the terms of service page
 * @tags Misc Endpoints
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.get('/tos', (req, res) => {
	// send the file, located in src/public/html/tos.html
	res.sendFile('tos.html', { root: './src/public/html' });
});

/**
 * GET /privacy
 * @summary This serves the privacy policy page
 * @tags Misc Endpoints
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.get('/privacy', (req, res) => {
	// send the file, located in src/public/html/privacy.html, with the css styling applied
	res.sendFile('privacy.html', { root: './src/public/html' });
});

router.use("/link", linkRoutes);
router.use("/domain", domainRoutes);
router.use("/email", emailRoutes);
router.use("/phonenumber", phoneNumberRoutes);

export default router;
