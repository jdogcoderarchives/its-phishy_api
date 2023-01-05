export interface CheckLinkResponse {
  isScam: boolean;
  link: string;
  flattenedLink: string;
  localDbNative: boolean;
  externalApiResponses?: {
    walshyAPI: string;
    googleSafeBrowsingAPI: string;
    ipQualityScoreAPI: string;
    phishermanAPI: string;
    sinkingYahtsAPI: string;
    spenTkAPI: string;
    urlScanAPI: string;
  };
}
