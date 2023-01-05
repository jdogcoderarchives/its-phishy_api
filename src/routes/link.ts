import * as express from "express";
import { checkLink } from "../functions/link/check";

const router = express.Router();

/**
 * GET /link/check
 * @summary Checks if a link is classified as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 * @param {string} url.query.required - The URL to check
 */
router.get("/check", async (req, res) => {
  const url = req.query.url as string;

  const rsp = await checkLink(url);

  if (rsp.isScam) {
    res.status(200).json({
      isScam: true,
      link: rsp.link,
      flattenedLink: rsp.flattenedLink,
      localDbNative: rsp.localDbNative,
    });
  } else if (!rsp.isScam) {
    res.status(200).json({
      isScam: false,
      link: rsp.link,
      flattenedLink: rsp.flattenedLink,
      localDbNative: rsp.localDbNative,
    });
  } else {
    res.status(400).json({
      error: "Something went wrong",
    });
  }
});

/**
 * GET /link/report
 * @summary Reports a link as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
router.get("/report", (req, res) => {
  res.send("Link report");
});

export default router;
