import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { getToken } from './getToken';

/**
 * Gets a user's info from their token
 * @param req Request
 * @param res Response
 */
export function getUserInfo(req: Request, res: Response) {
	const token = getToken(req);

	if (token === undefined || token === null) {
		return res.status(403).json({
			message: 'No Authorization Token Provided!',
		});
	}

	jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
		if (err) {
			return res.status(403).json({
				message: 'Invalid Token!',
			});
		}

		return res.status(200).json({
			message: 'Token Valid!',
			decoded,
		});
	});
}
