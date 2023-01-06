import axios from "axios";

import { DomainModel } from "../../database/models/Domain.schema";
import { CheckDomainResponse } from "../../interfaces/CheckDomainResponse";
import { flattenLink } from "../flattenLink";

export async function checkDomain(domain: string): Promise<CheckDomainResponse> {

 if (!domain) {
    throw new Error("No domain provided");
  }

  const flattenedDomain = flattenLink(domain)

  if (!flattenedDomain) {
    throw new Error("No domain provided");
  }

const domainExistsInDatabase = await DomainModel.exists({
    domain: flattenedDomain,
  });

  if (domainExistsInDatabase) {
    return {
      isScam: false,
      domain: domain,
      localDbNative: true,
    };
  }

  const checkWalshyAPI = await axios.post<{
    badDomain: boolean;
    detection: "discord" | "community";
  }>("https://bad-domains.walshy.dev/check", {
    domain: flattenedDomain,
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
            url: flattenedDomain,
          },
        ],
      },
    }
  );

  const ipQualityScoreResponse = await axios.get(
    `https://ipqualityscore.com/api/json/url/${process.env.IP_QUALITY_SCORE_API_KEY}/${flattenedDomain}`,
    {
      headers: {
        Referer: "https://api.itsfishy.xyz",
      },
    }
  );

  const phishermanResponse = await axios.get(
    `https://api.phisherman.gg/v2/domains/check/${flattenedDomain}`,
    {
      headers: {
        Authorization: "Bearer " + process.env.PHISHERMAN_API_KEY,
        "X-Identity": "api.itsfishy.xyz",
      },
    }
  );

  const sinkingYahtsResponse = await axios.get<boolean>(
    `https://phish.sinking.yachts/v2/check/${flattenedDomain}`,
    {
      headers: {
        accept: "application/json",
        "X-Identity": "api.itsfishy.xyz",
      },
    }
  );

  const spenTkResponse = await axios.get(
    `https://spen.tk/api/v1/isScamLink?link=${flattenedDomain}`,
  );

  const urlScanCheckSerch = await axios.get(
    `https://urlscan.io/api/v1/search/?q=domain:${flattenedDomain}`,
    {
      headers: {
        "API-Key": process.env.URLSCAN_API_KEY,
        "X-Identity": "api.itsfishy.xyz",
      },
    }
  );

  // eslint-disable-next-line init-declarations
  let urlScanResponse;

  if (!urlScanCheckSerch?.data) {
    throw new Error("urlScanCheckSerch.data is undefined");
  }

  if (!urlScanCheckSerch.data.results.length) {
    throw new Error("urlScanCheckSerch.data.results is undefined");
  }

  // check if the domain is not already scanned
  if (urlScanCheckSerch.data.results.length === 0) {
    // if not scan the domain, providing the api key
    const scan = await axios.post(
      "https://urlscan.io/api/v1/scan/",
      {
        url: flattenedDomain,
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

  if (!urlScanResponse?.data) {
    throw new Error("urlScanResponse.data is undefined");
  }

  const checkVirusTotalAPI = await axios.get(
    `https://www.virustotal.com/api/v3/domains/${flattenedDomain}`,
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
    spenTkResponse.data.result ||
    urlScanResponse.data.verdicts.malicious ||
    checkVirusTotalAPI.data.data.attributes.last_analysis_stats.malicious +
      checkVirusTotalAPI.data.data.attributes.last_analysis_stats.suspicious >=
      2
  ) {
    return {
      isScam: true,
      domain: domain,
      localDbNative: false,
      externalApiResponses: {
        walshyAPI: `${checkWalshyAPI.data}`,
        googleSafeBrowsingAPI: `${gooleSafeBrowsingResponse.data}`,
        ipQualityScoreAPI: `${ipQualityScoreResponse.data}`,
        phishermanAPI: `${phishermanResponse.data}`,
        sinkingYahtsAPI: `${sinkingYahtsResponse.data}`,
        spenTkAPI: `${spenTkResponse.data}`,
        urlScanAPI: `${urlScanResponse.data}`,
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
        spenTkAPI: `${spenTkResponse.data}`,
        urlScanAPI: `${urlScanResponse.data}`,
      },
    };
  }
}
