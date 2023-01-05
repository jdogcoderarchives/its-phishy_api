import * as express from "express";
import { checkDomain } from "../functions/domain/check";

const router = express.Router();

/**
 * GET /domain/check
 * @summary Checks if a domain is classified as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 * @param {string} domain.query.required - The domain to check
 */
router.get("/check", async (req, res) => {
  const url = req.query.domain as string;

  const rsp = await checkDomain(url);

  if (rsp.isScam) {
    res.status(200).json({
      isScam: true,
      domain: rsp.domain,
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

/**
 * GET /domain/report
 * @summary Reports a domain as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.get("/report", (req, res) => {
  res.send("Domain report");
});

export default router;
