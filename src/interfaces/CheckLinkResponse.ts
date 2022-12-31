// create a CheckLinkResponse interface
export interface CheckLinkResponse {
  isScam: boolean;
  link: string;
  flattenedLink: string;
  localDbNative: boolean;
  externalApiResponses?: {
    walshyAPI: string;
    checkPhishAPI: string;
    googleSafeBrowsingAPI: string;
    ipQualityScoreAPI: string;
    phishermanAPI: string;
    sinkingYahtsAPI: string;
    spenTkAPI: string;
    urlScanAPI: string;
  };
}
