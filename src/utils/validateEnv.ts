/**
 * A function to validate the environment variables, and makes sure they are set.
 * @returns valid: boolean, message: string
 */
export const validateEnv = (): { valid: boolean; message: string } => {
	if (!process.env.NODE_ENV) {
		return { valid: false, message: 'Missing Node Env' };
	}

	if (!process.env.API_PORT) {
		return { valid: false, message: 'Missing API Port' };
	}

	if (!process.env.DATABASE_URL) {
		return { valid: false, message: 'Missing Database URL' };
	}


	if (!process.env.YURI_API_KEY) {
		return { valid: false, message: 'Missing Yuri API Key' };
	}

	if (!process.env.STRIPE_SECRET_KEY) {
		return { valid: false, message: 'Missing Stripe Secret Key' };
	}

	if (!process.env.JWT_SECRET) {
		return { valid: false, message: 'Missing JWT Secret' };
	}

	if (!process.env.GOOGLE_SAFE_BROWSING_API_KEY) {
		return { valid: false, message: 'Missing Google Safe Browsing API Key' };
	}

	if (!process.env.PHISHERMAN_API_KEY) {
		return { valid: false, message: 'Missing Phisherman API Key' };
	}

	if (!process.env.URLSCAN_API_KEY) {
		return { valid: false, message: 'Missing URLScan API Key' };
	}

	if (!process.env.VIRUS_TOTAL_API_KEY) {
		return { valid: false, message: 'Missing Virus Total API Key' };
	}

	if (!process.env.IP_QUALITY_SCORE_API_KEY) {
		return { valid: false, message: 'Missing ipQualityScore API Key' };
	}

	return { valid: true, message: 'Environment variables validated!' };
};
