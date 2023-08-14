import { query } from '../../db/index';

/**
 * Checks various APIs to see if a phone number is a scam
 * @param {string} phoneNumber The phone number to check
 */
export async function checkPhoneNumber(phoneNumber: string) {
	// check if domain exists in database (postgres)

	const dbdata = await query(
		"SELECT * FROM phone_numbers WHERE phone_number = $1",
		[phoneNumber]
	);

	if (dbdata.rows.length > 0) {
		return {
			isScam: true,
			phoneNumber: phoneNumber,
			localDbNative: true,
			reason: 'Link exists in native database!',
		};
	} else {
		return {
			isScam: false,
			phoneNumber: phoneNumber,
			localDbNative: false,
			reason: 'Not a scam',
		};
	}
}
