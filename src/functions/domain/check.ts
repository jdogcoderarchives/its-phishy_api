import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { supabaseClient } from "../../index";

/**
 * Checks various APIs to see if a domain is a scam
 * @param {string} domain The domain to check
 * @returns {Promise} The response
 */
export async function checkDomain(domain: string) {
  if (!domain) {
    throw new Error("No domain provided");
  }

 // check if domain exists in database (supabase)
  const sup = await supabaseClient
    .from("domains")
    .select("domain")
    .eq("domain", domain);

  if (!sup.data) {
    throw new Error("Supabase error");
  }

  if (sup.data.length > 0) {
    return {
      isScam: true,
      domain: domain,
      localDbNative: true,
      reason: "Link exists in native database!",
    };
  }

  const checkWalshyAPI = await axios.post<{
    badDomain: boolean;
    detection: "discord" | "community";
  }>("https://bad-domains.walshy.dev/check", {
    domain: domain,
  });

  const gooleSafeBrowsingResponse = await axios.post(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
    {
      client: {
        clientId: "api.itsfishy.xyz",
        clientVersion: "1.0.0",
      },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [
          {
            url: domain,
          },
        ],
      },
    }
  );

  const ipQualityScoreResponse = await axios.get(
    `https://ipqualityscore.com/api/json/url/${process.env.IP_QUALITY_SCORE_API_KEY}/${domain}`,
    {
      headers: {
        Referer: "https://api.itsfishy.xyz",
      },
    }
  );

  const phishermanResponse = await axios.get(
    `https://api.phisherman.gg/v2/domains/check/${domain}`,
    {
      headers: {
        Authorization: "Bearer " + process.env.PHISHERMAN_API_KEY,
        "X-Identity": "api.itsfishy.xyz",
      },
    }
  );

  const sinkingYahtsResponse = await axios.get<boolean>(
    `https://phish.sinking.yachts/v2/check/${domain}`,
    {
      headers: {
        accept: "application/json",
        "X-Identity": "api.itsfishy.xyz",
      },
    }
  );

  const urlScanCheckSerch = await axios.get(
    `https://urlscan.io/api/v1/search/?q=domain:${domain}`,
    {
      headers: {
        "API-Key": process.env.URLSCAN_API_KEY,
        "X-Identity": "api.itsfishy.xyz",
      },
    }
  );

  // eslint-disable-next-line init-declarations
  let urlScanResponse;

  // check if the domain is not already scanned
  if (urlScanCheckSerch.data.results.length === 0) {
    // if not scan the domain, providing the api key
    const scan = await axios.post(
      "https://urlscan.io/api/v1/scan/",
      {
        url: domain,
      },
      {
        headers: {
          "API-Key": process.env.URLSCAN_API_KEY,
          "X-Identity": "api.itsfishy.xyz",
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
            "X-Identity": "api.itsfishy.xyz",
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
          "X-Identity": "api.itsfishy.xyz",
        },
      }
    );
  }

  if (!urlScanCheckSerch?.data) {
    throw new Error("urlScanCheckSerch.data is undefined");
  }

  if (!urlScanResponse?.data) {
    throw new Error("urlScanResponse.data is undefined");
  }

  const checkVirusTotalAPI = await axios.get(
    `https://www.virustotal.com/api/v3/domains/${domain}`,
    {
      headers: {
        "x-apikey": process.env.VIRUS_TOTAL_API_KEY,
      },
    }
  );

  if (!gooleSafeBrowsingResponse?.data) {
    throw new Error("gooleSafeBrowsingResponse.data is undefined");
  }

  if (!ipQualityScoreResponse?.data) {
    throw new Error("ipQualityScoreResponse.data is undefined");
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
    const { error } = await supabaseClient
      .from("domains")
      .insert({
        id: uuidv4(),
        domain: domain,
        dateReported: new Date(),
        reason: "Flagged by external APIs",
        type: "Unclassfied",
        reportedByID: 1,
      })
      .select();

    axios.post("https://yuri.bots.lostluma.dev/phish/report", {
      headers: {
        authorization: process.env.YURI_API_KEY,
      },
      body: {
        url: domain,
        reason: ":robot: It's Phishy API detected as scam",
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      isScam: true,
      domain: domain,
      reason: "Flagged by external APIs",
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
      domain: domain,
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
