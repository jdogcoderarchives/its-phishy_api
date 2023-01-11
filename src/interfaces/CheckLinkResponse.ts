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
    urlScanAPI: string;
    virusTotalAPI: string;
  };
}
