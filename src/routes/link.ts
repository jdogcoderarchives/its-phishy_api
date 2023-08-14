import * as express from 'express';
import validator from 'validator';

import { checkLink } from '../functions/link/check';

const router = express.Router();

/**
 * GET /link/check
 * @summary Checks if a link is classified as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 * @return {object} 500 - Internal server error response
 * @param {string} link.query.required - The link to check
 */
router.get('/check', async (req, res) => {
	const rawUrl = req.query.link as string;

	if (!rawUrl) {
		return res.status(449).json({
			error: 'No link provided',
		});
	}

	let url = null;

	if (validator.isFQDN(rawUrl)) {
		return res.status(400).json({
			error:
        'Link appears to be a FQDN. (e.g. domain.com) Please use the /domain endpoint instead.',
		});
	} else if (validator.isURL(rawUrl)) {
		url = rawUrl;
	} else {
		return res.status(400).json({
			error: 'Link is not a valid URL. (e.g. https://domain.com)',
		});
	}

	if (url === null || url === undefined || !url) {
		return res.status(500).json({
			error: 'Something went wrong',
		});
	}

	const rsp = await checkLink(url);

	if (rsp.isScam) {
		res.status(200).json({
			isScam: true,
			link: rsp.link,
			reason: rsp.reason,
			flattenedLink: rsp.flattenedLink,
			localDbNative: rsp.localDbNative,
		});
	} else if (!rsp.isScam) {
		res.status(200).json({
			isScam: false,
			link: rsp.link,
			flattenedLink: rsp.flattenedLink,
			localDbNative: rsp.localDbNative,
		});
	} else {
		res.status(400).json({
			error: 'Something went wrong',
		});
	}
});

export default router;
