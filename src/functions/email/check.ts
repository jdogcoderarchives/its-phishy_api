import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { query } from "../../db/index";

/**
 * Checks various APIs to see if a email is a scam
 * @param {string} email The email to check
 */
export async function checkEmail(email: string) {
  if (!email) {
    throw new Error("No email provided");
  }

  // check if domain exists in database

  const dbdata = await query("SELECT * FROM emails WHERE email = $1", [
    email,
  ]);

  if (dbdata.rows.length > 0) {
    return {
      isScam: true,
      email: email,
      localDbNative: true,
      reason: "Link exists in native database!",
    };
  }

  const checkIpQualityScore = await axios.get(
    `https://ipqualityscore.com/api/json/email/${process.env.IPQUALITYSCORE_API_KEY}/${email}?timeout=60`
  );

  if (checkIpQualityScore.data.success === false) {
    throw new Error("IPQualityScore API error");
  }

  if (checkIpQualityScore.data.disposable === true) {

    const dbinsert1 = await query(
      "INSERT INTO emails (id, email, type, reason, reported_by_id) VALUES ($1, $2, $3, $4, $5)",
      [
        uuidv4(),
        email,
        "disposable",
        "Flagged as disposable by IPQualityScore",
        1,
      ]
    );

    if (dbinsert1.rows.length > 0) {
      throw new Error("Database error");
    }

    return {
      isScam: true,
      reason: "Flagged as disposable by IPQualityScore",
      email: email,
      localDbNative: false,
    };
  }

  if (checkIpQualityScore.data.honeypot === true) {

    const dbinsert2 = await query(
      "INSERT INTO emails (id, email, type, reason, reported_by_id) VALUES ($1, $2, $3, $4, $5)",
      [
        uuidv4(),
        email,
        "honeypot",
        "Flagged as honeypot by IPQualityScore",
        1,
      ]
    );


    if (dbinsert2.rows.length > 0) {
      throw new Error("Database error");
    }

    return {
      isScam: true,
      reason: "Flagged as honeypot by IPQualityScore",
      email: email,
      localDbNative: false,
    };
  }

  return {
    isScam: false,
    email: email,
    localDbNative: false,
  };
}
