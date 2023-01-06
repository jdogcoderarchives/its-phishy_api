import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { LinkModel } from "../../database/models/Link.schema";
import { CheckLinkResponse } from "../../interfaces/CheckLinkResponse";

export async function checkLink(link: string): Promise<CheckLinkResponse> {
  if (!link) {
    throw new Error("No link provided");
  }

  const flattenedLink = link;

  if (!flattenedLink) {
    throw new Error("No link provided");
  }

  const linkExistsInDatabase = await LinkModel.exists({
    link: flattenedLink,
  });

  if (linkExistsInDatabase) {
    return {
      isScam: false,
      link: link,
      flattenedLink: flattenedLink,
      localDbNative: true,
    };
  }

  const checkWalshyAPI = await axios.post<{
    badDomain: boolean;
    detection: "discord" | "community";
  }>("https://bad-domains.walshy.dev/check", {
    domain: flattenedLink,
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
            url: flattenedLink,
          },
        ],
      },
    }
  );

  const ipQualityScoreResponse = await axios.get(
    `https://ipqualityscore.com/api/json/url/${process.env.IP_QUALITY_SCORE_API_KEY}/${flattenedLink}`,
    {
      headers: {
        Referer: "https://api.itsfishy.xyz",
      },
    }
  );

  const phishermanResponse = await axios.get(
    `https://api.phisherman.gg/v2/domains/check/${flattenedLink}`,
    {
      headers: {
        Authorization: "Bearer " + process.env.PHISHERMAN_API_KEY,
        "X-Identity": "api.itsfishy.xyz",
      },
    }
  );

  const sinkingYahtsResponse = await axios.get<boolean>(
    `https://phish.sinking.yachts/v2/check/${flattenedLink}`,
    {
      headers: {
        accept: "application/json",
        "X-Identity": "api.itsfishy.xyz",
      },
    }
  );

  const spenTkResponse = await axios.get(
    `https://spen.tk/api/v1/isScamLink?link=${flattenedLink}`
  );

  const urlScanCheckSerch = await axios.get(
    `https://urlscan.io/api/v1/search/?q=domain:${flattenedLink}`,
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

  // check if the link is not already scanned
  if (urlScanCheckSerch.data.results.length === 0) {
    // if not scan the link, providing the api key
    const scan = await axios.post(
      "https://urlscan.io/api/v1/scan/",
      {
        url: flattenedLink,
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
    `https://www.virustotal.com/api/v3/domains/${flattenedLink}`,
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
    const newLink = new LinkModel({
      id: uuidv4(),
      link: link,
      flatLink: flattenedLink,
      dateReported: new Date(),
    });

    await newLink.save();

    return {
      isScam: true,
      link: link,
      flattenedLink: flattenedLink,
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
      link: link,
      flattenedLink: flattenedLink,
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
