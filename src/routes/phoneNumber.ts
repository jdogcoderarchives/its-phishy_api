import * as express from 'express';
import validator from 'validator';

import { checkPhoneNumber } from '../functions/phoneNumber/check';

const router = express.Router();

/**
 * GET /phoneNumber/check
 * @summary Checks if a phone number is classified as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 * @return {object} 500 - Internal server error response
 * @param {string} phoneNumber.query.required - The phone number to check
 */
router.get('/check', async (req, res) => {
	const rawPhoneNumber = req.query.phoneNumber as string;

	if (!rawPhoneNumber) {
		return res.status(449).json({
			error: 'No phone number provided',
		});
	}

	let phoneNumber = null;

	if (validator.isMobilePhone(rawPhoneNumber)) {
		phoneNumber = rawPhoneNumber;
	} else {
		return res.status(400).json({
			error: 'Phone number is not valid',
		});
	}

	if (phoneNumber === null || phoneNumber === undefined || !phoneNumber) {
		return res.status(500).json({
			error: 'Something went wrong',
		});
	}

	const rsp = await checkPhoneNumber(phoneNumber);

	if (!rsp) {
		return res.status(500).json({
			error: 'Something went wrong',
		});
	}

	if (rsp.isScam) {
		return res.status(200).json({
			isScam: true,
			phoneNumber: phoneNumber,
			localDbNative: rsp.localDbNative,
			reason: rsp.reason,
		});
	} else if (!rsp.isScam) {
		return res.status(200).json({
			isScam: false,
			phoneNumber: phoneNumber,
			localDbNative: rsp.localDbNative,
		});
	} else {
		return res.status(500).json({
			error: 'Something went wrong',
		});
	}
});

export default router;
