"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDomain = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const Domain_schema_1 = require("../../database/models/Domain.schema");
const flattenLink_1 = require("../flattenLink");
function checkDomain(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!domain) {
            throw new Error("No domain provided");
        }
        const flattenedDomain = (0, flattenLink_1.flattenLink)(domain);
        if (!flattenedDomain) {
            throw new Error("No domain provided");
        }
        const domainExistsInDatabase = yield Domain_schema_1.DomainModel.exists({
            domain: flattenedDomain,
        });
        if (domainExistsInDatabase) {
            return {
                isScam: false,
                domain: domain,
                localDbNative: true,
            };
        }
        const checkWalshyAPI = yield axios_1.default.post("https://bad-domains.walshy.dev/check", {
            domain: flattenedDomain,
        });
        const gooleSafeBrowsingResponse = yield axios_1.default.post(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`, {
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
        });
        const ipQualityScoreResponse = yield axios_1.default.get(`https://ipqualityscore.com/api/json/url/${process.env.IP_QUALITY_SCORE_API_KEY}/${flattenedDomain}`, {
            headers: {
                Referer: "https://api.itsfishy.xyz",
            },
        });
        const phishermanResponse = yield axios_1.default.get(`https://api.phisherman.gg/v2/domains/check/${flattenedDomain}`, {
            headers: {
                Authorization: "Bearer " + process.env.PHISHERMAN_API_KEY,
                "X-Identity": "api.itsfishy.xyz",
            },
        });
        const sinkingYahtsResponse = yield axios_1.default.get(`https://phish.sinking.yachts/v2/check/${flattenedDomain}`, {
            headers: {
                accept: "application/json",
                "X-Identity": "api.itsfishy.xyz",
            },
        });
        const spenTKresponse = yield axios_1.default.get(`https://spen.tk/api/v1/isScamLink?link=${flattenedDomain}`);
        const urlScanCheckSerch = yield axios_1.default.get(`https://urlscan.io/api/v1/search/?q=domain:${flattenedDomain}`, {
            headers: {
                "API-Key": process.env.URLSCAN_API_KEY,
                "X-Identity": "api.itsfishy.xyz",
            },
        });
        // eslint-disable-next-line init-declarations
        let urlScanResponse;
        if (!(urlScanCheckSerch === null || urlScanCheckSerch === void 0 ? void 0 : urlScanCheckSerch.data)) {
            throw new Error("urlScanCheckSerch.data is undefined");
        }
        if (!urlScanCheckSerch.data.results.length) {
            throw new Error("urlScanCheckSerch.data.results is undefined");
        }
        // check if the domain is not already scanned
        if (urlScanCheckSerch.data.results.length === 0) {
            // if not scan the domain, providing the api key
            const scan = yield axios_1.default.post("https://urlscan.io/api/v1/scan/", {
                url: flattenedDomain,
            }, {
                headers: {
                    "API-Key": process.env.URLSCAN_API_KEY,
                    "X-Identity": "api.itsfishy.xyz",
                },
            });
            // wait 15 seconds for the scan to finish
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                urlScanResponse = yield axios_1.default.get(`https://urlscan.io/api/v1/result/${scan.data.uuid}/`, {
                    headers: {
                        "API-Key": process.env.URLSCAN_API_KEY,
                        "X-Identity": "api.itsfishy.xyz",
                    },
                });
            }), 15000);
        }
        else {
            urlScanResponse = yield axios_1.default.get(`https://urlscan.io/api/v1/result/${urlScanCheckSerch.data.results[0].task.uuid}/`, {
                headers: {
                    "API-Key": process.env.URLSCAN_API_KEY,
                    "X-Identity": "api.itsfishy.xyz",
                },
            });
        }
        if (!(urlScanResponse === null || urlScanResponse === void 0 ? void 0 : urlScanResponse.data)) {
            throw new Error("urlScanResponse.data is undefined");
        }
        const checkVirusTotalAPI = yield axios_1.default.get(`https://www.virustotal.com/api/v3/domains/${flattenedDomain}`, {
            headers: {
                "x-apikey": process.env.VIRUS_TOTAL_API_KEY,
            },
        });
        if (!(gooleSafeBrowsingResponse === null || gooleSafeBrowsingResponse === void 0 ? void 0 : gooleSafeBrowsingResponse.data)) {
            throw new Error("gooleSafeBrowsingResponse.data is undefined");
        }
        if (!(ipQualityScoreResponse === null || ipQualityScoreResponse === void 0 ? void 0 : ipQualityScoreResponse.data)) {
            throw new Error("ipQualityScoreResponse.data is undefined");
        }
        const checkPhishresponse1 = yield axios_1.default.post("https://developers.checkphish.ai/api/neo/scan", {
            headers: {
                Referer: "https://api.itsfishy.xyz",
                "Content-Type": "application/json",
            },
            apiKey: `${process.env.CHECKPHISH_API_KEY}`,
            urlInfo: {
                url: flattenedDomain,
            },
        });
        const cpJobID = checkPhishresponse1.data.jobID;
        const cpInsights = false;
        let checkPhishFinalResponse = null;
        const checkPhishresponse2 = yield axios_1.default.post(`https://developers.checkphish.ai/api/neo/status/${cpJobID}`, {
            apiKey: `${process.env.CHECKPHISH_API_KEY}`,
            jobID: `${cpJobID}`,
            insights: `${cpInsights}`,
            headers: {
                Referer: "https://api.itsfishy.xyz",
                "Content-Type": "application/json",
            },
        });
        if (checkPhishresponse2.data.status !== "DONE") {
            // wait 10 seccounts before checking again
            yield new Promise((resolve) => setTimeout(resolve, 10000));
            const response3 = yield axios_1.default.post(`https://developers.checkphish.ai/api/neo/status/${cpJobID}`, {
                apiKey: `${process.env.CHECKPHISH_API_KEY}`,
                jobID: `${cpJobID}`,
                insights: `${cpInsights}`,
                headers: {
                    Referer: "https://api.itsfishy.xyz",
                    "Content-Type": "application/json",
                },
            });
            checkPhishFinalResponse = response3;
        }
        else {
            checkPhishFinalResponse = checkPhishresponse2;
        }
        if (!checkPhishFinalResponse === null) {
            throw new Error("checkPhishFinalResponse is null");
        }
        if (checkWalshyAPI.data.badDomain ||
            // if googlesafebrowsing does not return an empty object
            Object.keys(gooleSafeBrowsingResponse.data).length !== 0 ||
            ipQualityScoreResponse.data.unsafe ||
            ipQualityScoreResponse.data.spam ||
            ipQualityScoreResponse.data.phishing ||
            ipQualityScoreResponse.data.malware ||
            checkPhishFinalResponse.data.disposition !== "clean" ||
            spenTKresponse.data.result ||
            phishermanResponse.data.verifiedPhish ||
            sinkingYahtsResponse.data ||
            urlScanResponse.data.verdicts.malicious ||
            checkVirusTotalAPI.data.data.attributes.last_analysis_stats.malicious +
                checkVirusTotalAPI.data.data.attributes.last_analysis_stats.suspicious >=
                2) {
            const newDomain = new Domain_schema_1.DomainModel({
                id: (0, uuid_1.v4)(),
                domain: domain,
                dateReported: new Date(),
            });
            yield newDomain.save();
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
                    urlScanAPI: `${urlScanResponse.data}`,
                    spentKAPI: `${spenTKresponse.data}`,
                    virusTotalAPI: `${checkVirusTotalAPI.data}`,
                    checkPhishAPI: `${checkPhishFinalResponse.data}`,
                },
            };
        }
        else {
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
                    spentKAPI: `${spenTKresponse.data}`,
                    virusTotalAPI: `${checkVirusTotalAPI.data}`,
                    checkPhishAPI: `${checkPhishFinalResponse.data}`,
                },
            };
        }
    });
}
exports.checkDomain = checkDomain;
//# sourceMappingURL=check.js.map