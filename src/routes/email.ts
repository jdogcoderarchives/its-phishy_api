import * as express from "express";
import validator from "validator";

import { checkEmail } from "../functions/email/check";

const router = express.Router();

/**
 * GET /email/check
 * @summary Checks if an email is classified as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @return {} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 * @return {object} 500 - Internal server error response
 * @param {string} email.query.required - The email to check
 */
router.get("/check", async (req, res) => {
  const rawEmail = req.query.email as string;

  if (!rawEmail) {
    return res.status(449).json({
      error: "No email provided",
    });
  }

  const tmpEmail = validator.normalizeEmail(rawEmail);

  if (!tmpEmail) {
    return res.status(500).json({
      error: "Email normalization failed",
    });
  }

  let email = null;

  if (validator.isEmail(tmpEmail)) {
    email = tmpEmail;
  } else {
    return res.status(500).json({
      error: "Email is not valid",
    });
  }

  if (email === null || email === undefined || !email) {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }

  const rsp = await checkEmail(email);

  if (!rsp) {
    return res.status(500).json({
        error: "Something went wrong",
    });
    }

  if (rsp.isScam) {
    return res.status(200).json({
      isScam: true,
      reason: rsp.reason,
      email: rsp.email,
      localDbNative: rsp.localDbNative,
    });
  } else if (!rsp.isScam) {
    return res.status(200).json({
      isScam: false,
      email: rsp.email,
      localDbNative: rsp.localDbNative,
    });
  } else {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});

export default router;