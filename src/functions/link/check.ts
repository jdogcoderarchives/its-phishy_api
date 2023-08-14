import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { query } from '../../db/index';
import { flattenLink } from '../flattenLink';

/**
 * Checks various APIs to see if a link is a scam
 * @param {string} link The link to check
 * @returns {Promise} The response
 */
export async function checkLink(link: string): Promise<any> {
	if (!link) {
		throw new Error('No link provided');
	}

	const flattenedLink = flattenLink(link);

	if (!flattenedLink) {
		throw new Error('Flat link issue');
	}

	// check if domain exists in database
	const dbdata = await query('SELECT * FROM links WHERE link = $1', [
		flattenedLink,
	]);

	if (dbdata.rows.length > 0) {
		return {
			isScam: true,
			link: link,
			flattenedLink: flattenedLink,
			localDbNative: true,
			reason: 'Link exists in native database!',
		};
	}

	const checkWalshyAPI = await axios.post<{
    badDomain: boolean;
    detection: 'discord' | 'community';
  }>('https://bad-domains.walshy.dev/check', {
  	domain: link,
  });

	const gooleSafeBrowsingResponse = await axios.post(
		`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
		{
			client: {
				clientId: 'api.itsfishy.xyz',
				clientVersion: '1.0.0',
			},
			threatInfo: {
				threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
				platformTypes: ['ANY_PLATFORM'],
				threatEntryTypes: ['URL'],
				threatEntries: [
					{
						url: link,
					},
				],
			},
		}
	);

	const ipQualityScoreResponse = await axios.get(
		`https://ipqualityscore.com/api/json/url/${process.env.IP_QUALITY_SCORE_API_KEY}/${link}`,
		{
			headers: {
				Referer: 'https://api.itsfishy.xyz',
			},
		}
	);

	const phishermanResponse = await axios.get(
		`https://api.phisherman.gg/v2/domains/check/${link}`,
		{
			headers: {
				Authorization: 'Bearer ' + process.env.PHISHERMAN_API_KEY,
				"X-Identity": 'api.itsfishy.xyz',
			},
		}
	);

	const sinkingYahtsResponse = await axios.get<boolean>(
		`https://phish.sinking.yachts/v2/check/${link}`,
		{
			headers: {
				accept: 'application/json',
				"X-Identity": 'api.itsfishy.xyz',
			},
		}
	);

	const urlScanCheckSerch = await axios.get(
		`https://urlscan.io/api/v1/search/?q=domain:${link}`,
		{
			headers: {
				"API-Key": process.env.URLSCAN_API_KEY,
				"X-Identity": 'api.itsfishy.xyz',
			},
		}
	);

	let urlScanResponse;

	if (!urlScanCheckSerch?.data) {
		throw new Error('urlScanCheckSerch.data is undefined');
	}

	if (!urlScanCheckSerch.data.results.length) {
		throw new Error('urlScanCheckSerch.data.results is undefined');
	}

	// check if the link is not already scanned
	if (urlScanCheckSerch.data.results.length === 0) {
		// if not scan the link, providing the api key
		const scan = await axios.post(
			"https://urlscan.io/api/v1/scan/",
			{
				url: link,
			},
			{
				headers: {
					"API-Key": process.env.URLSCAN_API_KEY,
					"X-Identity": 'api.itsfishy.xyz',
				},
			}
		);
		// wait 15 seconds for the scan to finish
		setTimeout(async () => {
			urlScanResponse = await axios.get(
				`https://urlscan.io/api/v1/result/${scan.data.uuid}/`,
				{
					headers: {
						"API-Key": process.env.URLSCAN_API_KEY,
						"X-Identity": 'api.itsfishy.xyz',
					},
				}
			);
		}, 15000);
	} else {
		urlScanResponse = await axios.get(
			`https://urlscan.io/api/v1/result/${urlScanCheckSerch.data.results[0].task.uuid}/`,
			{
				headers: {
					"API-Key": process.env.URLSCAN_API_KEY,
					"X-Identity": 'api.itsfishy.xyz',
				},
			}
		);
	}

	if (!urlScanResponse?.data) {
		throw new Error('urlScanResponse.data is undefined');
	}

	const checkVirusTotalAPI = await axios.get(
		`https://www.virustotal.com/api/v3/domains/${link}`,
		{
			headers: {
				"x-apikey": process.env.VIRUS_TOTAL_API_KEY,
			},
		}
	);

	if (!gooleSafeBrowsingResponse?.data) {
		throw new Error('gooleSafeBrowsingResponse.data is undefined');
	}

	if (!ipQualityScoreResponse?.data) {
		throw new Error('ipQualityScoreResponse.data is undefined');
	}

	if (
		checkWalshyAPI.data.badDomain ||
    // if googlesafebrowsing does not return an empty object
    Object.keys(gooleSafeBrowsingResponse.data).length !== 0 ||
    ipQualityScoreResponse.data.unsafe ||
    ipQualityScoreResponse.data.spam ||
    ipQualityScoreResponse.data.phishing ||
    ipQualityScoreResponse.data.malware ||
    phishermanResponse.data.verifiedPhish ||
    sinkingYahtsResponse.data ||
    urlScanResponse.data.verdicts.malicious ||
    checkVirusTotalAPI.data.data.attributes.last_analysis_stats.malicious +
      checkVirusTotalAPI.data.data.attributes.last_analysis_stats.suspicious >=
      2
	) {
		// insert the link into the database
		const dbinsert = await query(
			"INSERT INTO links (id, link, flatLink, type, reason, reportedByID, dateReported) VALUES ($1, $2, $3, $4, $5, $6, $7)",
			[
				uuidv4(),
				link,
				flattenedLink,
				"Unclassified",
				"Flagged by external APIs",
				1,
				new Date(),
			]
		);

		if (dbinsert.rows.length > 0) {
			throw new Error('Database error');
		}

		return {
			isScam: true,
			link: link,
			flattenedLink: flattenedLink,
			reason: 'Flagged by external APIs',
			localDbNative: false,
			externalApiResponses: {
				walshyAPI: `${checkWalshyAPI.data}`,
				googleSafeBrowsingAPI: `${gooleSafeBrowsingResponse.data}`,
				ipQualityScoreAPI: `${ipQualityScoreResponse.data}`,
				phishermanAPI: `${phishermanResponse.data}`,
				sinkingYahtsAPI: `${sinkingYahtsResponse.data}`,
				urlScanAPI: `${urlScanResponse.data}`,
				virusTotalAPI: `${checkVirusTotalAPI.data}`,
			},
		};
	} else {
		return {
			isScam: false,
			link: link,
			flattenedLink: flattenedLink,
			localDbNative: false,
			externalApiResponses: {
				walshyAPI: `${checkWalshyAPI.data}`,
				googleSafeBrowsingAPI: `${gooleSafeBrowsingResponse.data}`,
				ipQualityScoreAPI: `${ipQualityScoreResponse.data}`,
				phishermanAPI: `${phishermanResponse.data}`,
				sinkingYahtsAPI: `${sinkingYahtsResponse.data}`,
				urlScanAPI: `${urlScanResponse.data}`,
				virusTotalAPI: `${checkVirusTotalAPI.data}`,
			},
		};
	}
}
