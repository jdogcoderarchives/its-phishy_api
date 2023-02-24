import { supabaseClient } from "../../index";

/**
 * Checks various APIs to see if a phone number is a scam
 * @param {string} phoneNumber The phone number to check
 */
export async function checkPhoneNumber(phoneNumber: string) {

  // check if domain exists in database (supabase)
  const sup = await supabaseClient
    .from("phoneNumbers")
    .select('phoneNumber')
    .eq('phoneNumber', phoneNumber)

if (!sup.data) {
    throw new Error("Supabase error");
  }

  if (sup.data.length > 0) {
    return {
      isScam: true,
      phoneNumber: phoneNumber,
      localDbNative: true,
      reason: "Link exists in native database!",
    };
  }

  return {
    isScam: false,
    phoneNumber: phoneNumber,
    localDbNative: false,
    reason: "Not a scam",
  };
}
