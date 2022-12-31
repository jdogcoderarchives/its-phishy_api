import axios from "axios";
import mongoose from "mongoose";

import { CheckLinkResponse } from "../../interfaces/CheckLinkResponse";
import { flattenLink } from "../flattenLink";

export async function checkLink(link: string): Promise<CheckLinkResponse> {
  const flattenedLink = flattenLink(link);

  const linkExistsLocaly = await mongoose
    .model("Link")
    .exists({ link: flattenedLink });

  if (linkExistsLocaly) {
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

  const checkPhishResponse1 = await axios.post(
    "https://developers.checkphish.ai/api/neo/scan",
    {
      headers: {
        Referer: "https://api.itsfishy.xyz",
        "Content-Type": "application/json",
      },
      apiKey: `${process.env.CHECK_PHISH_API_KEY}`,
      urlInfo: {
        url: flattenedLink,
      },
    }
  );

  const jobID = checkPhishResponse1.data.jobID;
  const insights = false;

  const checkPhishResponse2 = await axios.post(
    `https://developers.checkphish.ai/api/neo/status/${jobID}`,
    {
      apiKey: `${process.env.CHECK_PHISH_API_KEY}`,
      jobID: `${jobID}`,
      insights: `${insights}`,
      headers: {
        Referer: "https://api.itsfishy.xyz",
        "Content-Type": "application/json",
      },
    }
  );

  // eslint-disable-next-line init-declarations
  let checkPhishResponse3;

  if (checkPhishResponse2.data.status !== "DONE") {
    // wait 10 seccounts before checking again
    await new Promise((resolve) => setTimeout(resolve, 10000));

    checkPhishResponse3 = await axios.post(
      `https://developers.checkphish.ai/api/neo/status/${jobID}`,
      {
        apiKey: `${process.env.CHECK_PHISH_API_KEY}`,
        jobID: `${jobID}`,
        insights: `${insights}`,
        headers: {
          Referer: "https://api.itsfishy.xyz",
          "Content-Type": "application/json",
        },
      }
    );
  } else {
    checkPhishResponse3 = checkPhishResponse2;
  }

  const gooleSafeBrowsingResponse = await axios.post(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
    {
      client: {
        clientId: "api.itsfishy.xyz",
        clientVersion: "1.0.0",
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION",
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url: flattenedLink }],
      },
    },
    {
      headers: {
        Referer: "https://api.itsfishy.xyz",
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

  const checkVirusTotalAPI = await axios.get<{
    data: {
      attributes: {
        last_analysis_stats: {
          malicious: number;
          suspicious: number;
          timeout: number;
          undetected: number;
        };
      };
    };
  }>(`https://www.virustotal.com/api/v3/domains/${flattenedLink}`, {
    headers: {
      "x-apikey": process.env.VIRUSTOTAL_API_KEY,
      "X-Identity": "api.itsfishy.xyz",
    },
  });

  if (
    checkWalshyAPI.data.badDomain ||
    checkPhishResponse3.data.disposition !== "clean" ||
    gooleSafeBrowsingResponse.data.matches.length > 0 ||
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
      link: link,
      flattenedLink: flattenedLink,
      localDbNative: false,
      externalApiResponses: {
        walshyAPI: `${checkWalshyAPI.data}`,
        checkPhishAPI: `${checkPhishResponse3.data}`,
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
        checkPhishAPI: `${checkPhishResponse3.data}`,
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
