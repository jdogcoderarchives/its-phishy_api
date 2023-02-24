import * as express from "express";
import validator from "validator";

import { checkDomain } from "../functions/domain/check";
import { flattenLink } from "../functions/flattenLink";

const router = express.Router();

/**
 * GET /domain/check
 * @summary Checks if a domain is classified as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 * @return {object} 500 - Internal server error response
 * @param {string} domain.query.required - The domain to check
 */
router.get("/check", async (req, res) => {
  const rawDomain = req.query.domain as string;

  if (!rawDomain) {
    return res.status(449).json({
      error: "No domain provided",
    });
  }

  let url = null;

  if (validator.isFQDN(rawDomain)) {
    url = rawDomain;
  } else if (validator.isURL(rawDomain)) {
    url = flattenLink(rawDomain);
  } else {
    return res.status(400).json({
      error: "Domain is not a valid FQDN (e.g. domain.com)",
    });
  }

  if (url === null || url === undefined || !url) {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }

  const rsp = await checkDomain(url);

  if (rsp.isScam) {
    res.status(200).json({
      isScam: true,
      domain: rsp.domain,
      reason: rsp.reason,
      localDbNative: rsp.localDbNative,
    });
  } else if (!rsp.isScam) {
    res.status(200).json({
      isScam: false,
      domain: rsp.domain,
      localDbNative: rsp.localDbNative,
    });
  } else {
    res.status(400).json({
      error: "Something went wrong",
    });
  }
});

export default router;
