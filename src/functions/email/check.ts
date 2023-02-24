import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { supabaseClient } from "../../index";

/**
 * Checks various APIs to see if a email is a scam
 * @param {string} email The email to check
 */
export async function checkEmail(email: string) {
  if (!email) {
    throw new Error("No email provided");
  }

  // check if domain exists in database (supabase)
  const sup = await supabaseClient
    .from("emails")
    .select("email")
    .eq("email", email);

  if (!sup.data) {
    throw new Error("Supabase error");
  }

  if (sup.data.length > 0) {
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
    const { error } = await supabaseClient
      .from("emails")
      .insert({
        id: uuidv4(),
        email: email,
        type: "disposable",
        reason: "Flagged as disposable by IPQualityScore",
        reportedByID: 1,
      })
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return {
      isScam: true,
      reason: "Flagged as disposable by IPQualityScore",
      email: email,
      localDbNative: false,
    };
  }

  if (checkIpQualityScore.data.honeypot === true) {
    const { error } = await supabaseClient
      .from("emails")
      .insert({
        id: uuidv4(),
        email: email,
        type: "honeypot",
        reason: "Flagged as honeypot by IPQualityScore",
        reportedByID: 1,
      })
      .select();

    if (error) {
      throw new Error(error.message);
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
