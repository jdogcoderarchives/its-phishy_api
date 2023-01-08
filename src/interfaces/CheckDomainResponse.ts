export interface CheckDomainResponse {
  isScam: boolean;
  domain: string;
  localDbNative: boolean;
  externalApiResponses?: {
    walshyAPI: string;
    googleSafeBrowsingAPI: string;
    ipQualityScoreAPI: string;
    phishermanAPI: string;
    sinkingYahtsAPI: string;
    urlScanAPI: string;
  };
}
